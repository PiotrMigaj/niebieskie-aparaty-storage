export function useFiles(folder: Ref<string | null>) {
  const { data: files, status, error } = useFetch('/api/files', {
    query: { folder },
    watch: [folder],
    immediate: true
  })

  const downloadingKey = ref<string | null>(null)
  const toast = useToast()

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
    } catch {
      toast.add({
        title: 'Download failed',
        description: 'Could not generate download link.',
        color: 'error',
        icon: 'i-lucide-alert-circle'
      })
    } finally {
      downloadingKey.value = null
    }
  }

  return { files, status, error, downloadFile, downloadingKey }
}
