<template>
  <UModal v-model:open="open" title="Create Folder">
    <template #body>
      <UFormField label="Folder name" :error="validationError">
        <UInput
          v-model="folderName"
          placeholder="e.g. wedding-2026"
          autofocus
          @keydown.enter="create"
        />
      </UFormField>
    </template>

    <template #footer>
      <div class="flex justify-end gap-2">
        <UButton variant="ghost" label="Cancel" @click="handleClose" />
        <UButton label="Create" :loading="loading" @click="create" />
      </div>
    </template>
  </UModal>
</template>

<script setup lang="ts">
const open = defineModel<boolean>('open', { default: false })
const emit = defineEmits<{ created: [prefix: string] }>()

const toast = useToast()
const folderName = ref('')
const loading = ref(false)
const validationError = ref('')

watch(open, (val) => {
  if (!val) reset()
})

function validate(): boolean {
  const name = folderName.value.trim()
  if (!name) {
    validationError.value = 'Folder name is required'
    return false
  }
  if (name.includes('/')) {
    validationError.value = 'Folder name must not contain slashes'
    return false
  }
  validationError.value = ''
  return true
}

async function create() {
  if (!validate()) return
  loading.value = true
  try {
    const result = await $fetch('/api/folders', {
      method: 'POST',
      body: { name: folderName.value.trim() }
    })
    emit('created', result.prefix)
    open.value = false
  } catch (e: unknown) {
    const message = (e as { data?: { message?: string } })?.data?.message ?? 'Failed to create folder'
    toast.add({ title: message, color: 'error' })
  } finally {
    loading.value = false
  }
}

function reset() {
  folderName.value = ''
  validationError.value = ''
}

function handleClose() {
  open.value = false
}
</script>
