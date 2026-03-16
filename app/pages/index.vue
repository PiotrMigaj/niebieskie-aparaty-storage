<template>
  <UDashboardPanel>
    <template #header>
      <UDashboardNavbar
        :title="currentFolderName || 'Files'"
        icon="i-lucide-hard-drive"
        :toggle="true"
        toggle-side="left"
      />
    </template>

    <template #body>
      <ClientOnly>
        <FileList
          :files="files"
          :selected-folder="selectedFolder"
          :folders-loading="foldersStatus === 'pending'"
          :status="filesStatus"
          :error="filesError"
          :downloading-key="downloadingKey"
          @download="downloadFile"
        />
        <template #fallback>
          <div class="flex flex-col gap-3 p-6">
            <USkeleton v-for="i in 8" :key="i" class="h-12 w-full" />
          </div>
        </template>
      </ClientOnly>
    </template>
  </UDashboardPanel>
</template>

<script setup lang="ts">
definePageMeta({
  layout: 'dashboard',
  middleware: 'auth'
})

const { selectedFolder, status: foldersStatus } = useFolders()
const { files, status: filesStatus, error: filesError, downloadFile, downloadingKey } = useFiles(selectedFolder)

const mounted = ref(false)
onMounted(() => { mounted.value = true })

const currentFolderName = computed(() => {
  if (!mounted.value || !selectedFolder.value) return null
  return selectedFolder.value.replace(/\/$/, '')
})
</script>
