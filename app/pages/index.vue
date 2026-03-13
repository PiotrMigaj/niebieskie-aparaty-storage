<template>
  <UDashboardPanel>
    <template #header>
      <UDashboardNavbar>
        <template #left>
          <div class="flex items-center gap-2">
            <UIcon name="i-lucide-hard-drive" class="size-5" />
            <h1 class="text-lg font-semibold">
              {{ currentFolderName || 'Files' }}
            </h1>
          </div>
        </template>

        <template #right>
          <UColorModeButton />
        </template>
      </UDashboardNavbar>
    </template>

    <ClientOnly>
      <FileList />
      <template #fallback>
        <div class="flex flex-col gap-3 p-6">
          <USkeleton v-for="i in 8" :key="i" class="h-12 w-full" />
        </div>
      </template>
    </ClientOnly>
  </UDashboardPanel>
</template>

<script setup lang="ts">
definePageMeta({
  layout: 'dashboard',
  middleware: 'auth'
})

const selectedFolder = useSelectedFolder()

const currentFolderName = computed(() => {
  if (!selectedFolder.value) return null
  return selectedFolder.value.replace(/\/$/, '')
})
</script>
