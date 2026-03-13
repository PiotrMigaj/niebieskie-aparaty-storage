<template>
  <div class="flex h-full flex-col">
    <div v-if="!selectedFolder" class="flex flex-1 items-center justify-center">
      <UEmpty icon="i-lucide-folder-open" title="Select a folder" description="Choose a folder from the sidebar to view its files." />
    </div>

    <div v-else-if="status === 'pending'" class="flex flex-col gap-3 p-6">
      <USkeleton v-for="i in 8" :key="i" class="h-12 w-full" />
    </div>

    <div v-else-if="error" class="p-6">
      <UAlert
        title="Failed to load files"
        :description="error.message"
        color="error"
        icon="i-lucide-alert-triangle"
      />
    </div>

    <div v-else-if="!files?.length" class="flex flex-1 items-center justify-center">
      <UEmpty icon="i-lucide-file-x" title="No files" description="This folder is empty." />
    </div>

    <div v-else class="flex flex-col divide-y divide-neutral-200 dark:divide-neutral-800">
      <div
        v-for="file in files"
        :key="file.key"
        class="flex items-center gap-4 px-6 py-3 transition-colors hover:bg-neutral-50 dark:hover:bg-neutral-900"
      >
        <UIcon :name="getFileIcon(file.extension)" class="size-5 shrink-0 text-neutral-500" />

        <div class="flex min-w-0 flex-1 flex-col">
          <span class="truncate text-sm font-medium">{{ file.name }}</span>
          <span class="text-xs text-neutral-400">{{ file.size }} &middot; {{ formatDate(file.lastModified) }}</span>
        </div>

        <UButton
          icon="i-lucide-download"
          variant="ghost"
          color="neutral"
          size="sm"
          :loading="downloadingKey === file.key"
          @click="downloadFile(file.key, file.name)"
        />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
const selectedFolder = useSelectedFolder()
const toast = useToast()
const downloadingKey = ref<string | null>(null)

const { data: files, status, error } = useFetch('/api/files', {
  query: { folder: selectedFolder },
  watch: [selectedFolder],
  immediate: true
})

function getFileIcon(ext: string | undefined): string {
  if (!ext) return 'i-lucide-file'
  const icons: Record<string, string> = {
    pdf: 'i-lucide-file-text',
    doc: 'i-lucide-file-text',
    docx: 'i-lucide-file-text',
    xls: 'i-lucide-file-spreadsheet',
    xlsx: 'i-lucide-file-spreadsheet',
    csv: 'i-lucide-file-spreadsheet',
    png: 'i-lucide-image',
    jpg: 'i-lucide-image',
    jpeg: 'i-lucide-image',
    gif: 'i-lucide-image',
    svg: 'i-lucide-image',
    webp: 'i-lucide-image',
    mp4: 'i-lucide-film',
    mov: 'i-lucide-film',
    avi: 'i-lucide-film',
    mp3: 'i-lucide-music',
    wav: 'i-lucide-music',
    zip: 'i-lucide-file-archive',
    rar: 'i-lucide-file-archive',
    '7z': 'i-lucide-file-archive',
    json: 'i-lucide-file-code',
    js: 'i-lucide-file-code',
    ts: 'i-lucide-file-code',
    html: 'i-lucide-file-code',
    css: 'i-lucide-file-code'
  }
  return icons[ext] || 'i-lucide-file'
}

function formatDate(dateStr: string): string {
  if (!dateStr) return ''
  return new Date(dateStr).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

async function downloadFile(key: string, name: string) {
  downloadingKey.value = key
  try {
    const { url } = await $fetch('/api/download', { query: { key } })
    const link = document.createElement('a')
    link.href = url
    link.download = name
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }
  catch {
    toast.add({
      title: 'Download failed',
      description: 'Could not generate download link.',
      color: 'error',
      icon: 'i-lucide-alert-circle'
    })
  }
  finally {
    downloadingKey.value = null
  }
}
</script>
