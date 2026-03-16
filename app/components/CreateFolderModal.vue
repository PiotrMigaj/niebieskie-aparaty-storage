<template>
  <UModal v-model:open="open" title="Create Folder">
    <template #body>
      <UFormField label="Folder name" :error="validationError">
        <UInput
          v-model="folderName"
          placeholder="e.g. wedding-2026"
          autofocus
          @keydown.enter="submit"
        />
      </UFormField>
    </template>

    <template #footer>
      <div class="flex justify-end gap-2">
        <UButton variant="ghost" label="Cancel" @click="handleClose" />
        <UButton label="Create" :loading="loading" @click="submit" />
      </div>
    </template>
  </UModal>
</template>

<script setup lang="ts">
const open = defineModel<boolean>('open', { default: false })

defineProps<{
  loading: boolean
}>()

const emit = defineEmits<{
  submit: [name: string]
}>()

const folderName = ref('')
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

function submit() {
  if (!validate()) return
  emit('submit', folderName.value.trim())
}

function reset() {
  folderName.value = ''
  validationError.value = ''
}

function handleClose() {
  open.value = false
}
</script>
