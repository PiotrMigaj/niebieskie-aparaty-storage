<template>
  <UModal v-model:open="open" title="Generate Upload Link">
    <template #body>
      <div v-if="!generatedUrl" class="space-y-4">
        <div>
          <p class="text-sm text-muted mb-1">Folder</p>
          <p class="font-medium">{{ folderDisplay }}</p>
        </div>

        <UFormField label="Link expires in">
          <USelect v-model="selectedExpiry" :items="expiryOptions" />
        </UFormField>
      </div>

      <div v-else class="space-y-4">
        <p class="text-sm text-muted">Share this link with the user. It expires {{ selectedExpiryLabel }}.</p>
        <div class="flex gap-2">
          <UInput :model-value="generatedUrl" readonly class="flex-1 font-mono text-xs" />
          <UButton icon="i-lucide-copy" variant="outline" @click="copyUrl" />
        </div>
        <p v-if="copied" class="text-sm text-success">Copied to clipboard!</p>
      </div>
    </template>

    <template #footer>
      <div class="flex justify-end gap-2">
        <UButton variant="ghost" label="Close" @click="handleClose" />
        <UButton
          v-if="!generatedUrl"
          label="Generate Link"
          :loading="loading"
          @click="generate"
        />
        <UButton
          v-else
          label="Generate Another"
          variant="outline"
          @click="reset"
        />
      </div>
    </template>
  </UModal>
</template>

<script setup lang="ts">
const props = defineProps<{
  folder: string
}>()

const open = defineModel<boolean>('open', { default: false })

const expiryOptions = [
  { label: '1 hour', value: 3600 },
  { label: '6 hours', value: 21600 },
  { label: '24 hours', value: 86400 },
  { label: '48 hours', value: 172800 },
  { label: '7 days', value: 604800 }
]

const toast = useToast()
const selectedExpiry = ref(86400)
const loading = ref(false)
const generatedUrl = ref('')
const copied = ref(false)

const folderDisplay = computed(() => props.folder.replace(/\/$/, '') || '(root)')

const selectedExpiryLabel = computed(() =>
  expiryOptions.find(o => o.value === selectedExpiry.value)?.label?.toLowerCase() ?? ''
)

async function generate() {
  loading.value = true
  try {
    const token = await $fetch('/api/upload-tokens', {
      method: 'POST',
      body: { folder: props.folder, expiresIn: selectedExpiry.value }
    })

    const folder = props.folder.replace(/\/$/, '')
    const origin = window.location.origin
    generatedUrl.value = `${origin}/upload/${encodeURIComponent(folder)}?token=${token.tokenId}`
  } catch {
    toast.add({ title: 'Failed to generate link', color: 'error' })
  } finally {
    loading.value = false
  }
}

async function copyUrl() {
  await navigator.clipboard.writeText(generatedUrl.value)
  copied.value = true
  setTimeout(() => (copied.value = false), 2000)
}

function reset() {
  generatedUrl.value = ''
  copied.value = false
}

function handleClose() {
  reset()
  open.value = false
}
</script>
