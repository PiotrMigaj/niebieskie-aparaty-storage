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
        @click="emit('selectFolder', folder.prefix)"
      />

      <div v-if="!folders?.length" class="p-2 text-center text-sm text-neutral-400">
        No folders found
      </div>
    </template>

    <ClientOnly>
      <USeparator class="my-2" />
      <UButton
        icon="i-lucide-folder-plus"
        label="Add Folder"
        variant="ghost"
        color="neutral"
        block
        class="justify-start"
        @click="emit('openCreateModal')"
      />
      <template v-if="selectedFolder">
        <UButton
          icon="i-lucide-link"
          label="Generate Upload Link"
          variant="ghost"
          color="neutral"
          block
          class="justify-start"
          @click="emit('openUploadLinkModal')"
        />
      </template>
    </ClientOnly>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  folders?: { name: string; prefix: string }[] | null
  selectedFolder: string | null
  status: string
  error?: Error | null
}>()

const emit = defineEmits<{
  selectFolder: [prefix: string]
  openCreateModal: []
  openUploadLinkModal: []
}>()

const mounted = ref(false)
onMounted(() => { mounted.value = true })
</script>
