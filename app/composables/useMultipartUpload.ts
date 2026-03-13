const CHUNK_SIZE = 50 * 1024 * 1024 // 50MB
const MAX_CONCURRENT = 3

export type UploadStatus = 'pending' | 'uploading' | 'complete' | 'error'

export interface UploadItem {
  id: string
  file: File
  progress: number
  status: UploadStatus
  error?: string
}

export function useMultipartUpload(token: Ref<string>, folder: Ref<string>) {
  const items = ref<UploadItem[]>([])

  function addFiles(files: FileList | File[]) {
    for (const file of Array.from(files)) {
      items.value.push({
        id: crypto.randomUUID(),
        file,
        progress: 0,
        status: 'pending'
      })
    }
  }

  function removeFile(id: string) {
    const idx = items.value.findIndex(i => i.id === id)
    if (idx !== -1 && items.value[idx].status !== 'uploading') {
      items.value.splice(idx, 1)
    }
  }

  async function uploadAll() {
    const pending = items.value.filter(i => i.status === 'pending')
    for (const item of pending) {
      await uploadFile(item)
    }
  }

  async function uploadFile(item: UploadItem) {
    item.status = 'uploading'
    item.progress = 0

    const totalParts = Math.ceil(item.file.size / CHUNK_SIZE)
    const partProgress = new Array(totalParts).fill(0)
    let uploadId = ''
    let key = ''

    function updateProgress() {
      const totalUploaded = partProgress.reduce((a, b) => a + b, 0)
      item.progress = Math.min(99, Math.round((totalUploaded / item.file.size) * 100))
    }

    try {
      const initiated = await $fetch('/api/upload/initiate', {
        method: 'POST',
        body: { token: token.value, folder: folder.value, filename: item.file.name }
      })
      uploadId = initiated.uploadId!
      key = initiated.key!

      const partNumbers = Array.from({ length: totalParts }, (_, i) => i + 1)
      const parts: { partNumber: number; etag: string }[] = []

      for (let i = 0; i < partNumbers.length; i += MAX_CONCURRENT) {
        const batch = partNumbers.slice(i, i + MAX_CONCURRENT)

        await Promise.all(batch.map(async (partNumber) => {
          const start = (partNumber - 1) * CHUNK_SIZE
          const end = Math.min(start + CHUNK_SIZE, item.file.size)
          const chunk = item.file.slice(start, end)

          const { url } = await $fetch('/api/upload/presign-part', {
            method: 'POST',
            body: { token: token.value, folder: folder.value, key, uploadId, partNumber }
          })

          const etag = await uploadPartXhr(url, chunk, (loaded) => {
            partProgress[partNumber - 1] = loaded
            updateProgress()
          })

          parts.push({ partNumber, etag })
        }))
      }

      parts.sort((a, b) => a.partNumber - b.partNumber)

      await $fetch('/api/upload/complete', {
        method: 'POST',
        body: { token: token.value, folder: folder.value, key, uploadId, parts }
      })

      item.progress = 100
      item.status = 'complete'
    } catch (e: any) {
      item.status = 'error'
      item.error = e.data?.message ?? e.message ?? 'Upload failed'

      if (uploadId && key) {
        try {
          await $fetch('/api/upload/abort', {
            method: 'POST',
            body: { token: token.value, folder: folder.value, key, uploadId }
          })
        } catch {}
      }
    }
  }

  return { items, addFiles, removeFile, uploadAll }
}

function uploadPartXhr(url: string, chunk: Blob, onProgress: (loaded: number) => void): Promise<string> {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest()
    xhr.open('PUT', url)

    xhr.upload.addEventListener('progress', (e) => {
      if (e.lengthComputable) onProgress(e.loaded)
    })

    xhr.addEventListener('load', () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        const etag = xhr.getResponseHeader('ETag') ?? ''
        resolve(etag.replace(/"/g, ''))
      } else {
        reject(new Error(`Part upload failed with status ${xhr.status}`))
      }
    })

    xhr.addEventListener('error', () => reject(new Error('Network error during part upload')))
    xhr.send(chunk)
  })
}
