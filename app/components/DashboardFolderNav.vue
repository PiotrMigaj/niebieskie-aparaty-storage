<template>
  <div class="flex flex-col gap-1 p-2">
    <p class="px-2 pb-1 text-xs font-semibold uppercase tracking-wider text-neutral-500">
      Folders
    </p>

    <div v-if="status === 'pending'" class="flex flex-col gap-2 p-2">
      <USkeleton v-for="i in 5" :key="i" class="h-8 w-full" />
    </div>

    <div v-else-if="error" class="p-2">
      <UAlert
        title="Failed to load folders"
        :description="error.message"
        color="error"
        icon="i-lucide-alert-triangle"
      />
    </div>

    <template v-else>
      <UButton
        v-for="folder in folders"
        :key="folder.name"
        :label="folder.name"
        icon="i-lucide-folder"
        variant="ghost"
        color="neutral"
        block
        class="justify-start"
        :class="{ 'bg-primary/10! text-primary!': mounted && selectedFolder === folder.prefix }"
        @click="selectFolder(folder.prefix)"
      />

      <div v-if="!folders?.length" class="p-2 text-center text-sm text-neutral-400">
        No folders found
      </div>
    </template>

    <ClientOnly>
      <template v-if="selectedFolder">
        <USeparator class="my-2" />
        <UButton
          icon="i-lucide-link"
          label="Generate Upload Link"
          variant="ghost"
          color="neutral"
          block
          class="justify-start"
          @click="showModal = true"
        />
      </template>
      <GenerateUploadLinkModal v-model:open="showModal" :folder="selectedFolder || ''" />
    </ClientOnly>
  </div>
</template>

<script setup lang="ts">
const selectedFolder = useSelectedFolder()
const showModal = ref(false)
const mounted = ref(false)
onMounted(() => { mounted.value = true })

const { data: folders, status, error } = useFetch('/api/folders')

watch(folders, (val) => {
  if (val?.length && !selectedFolder.value) {
    selectedFolder.value = val[0]!.prefix
  }
}, { immediate: true })

function selectFolder(prefix: string) {
  selectedFolder.value = prefix
}
</script>
