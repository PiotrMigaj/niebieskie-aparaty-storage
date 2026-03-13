<template>
  <div class="min-h-screen flex items-center justify-center p-6">
    <div class="w-full max-w-2xl">

      <!-- Error state -->
      <div v-if="error" class="text-center space-y-4">
        <UIcon name="i-lucide-shield-x" class="size-16 text-error mx-auto" />
        <h1 class="text-2xl font-bold">Access Denied</h1>
        <p class="text-muted">{{ error }}</p>
      </div>

      <!-- Loading validation -->
      <div v-else-if="validating" class="text-center">
        <UIcon name="i-lucide-loader" class="size-10 mx-auto animate-spin text-muted" />
        <p class="mt-2 text-muted">Validating link…</p>
      </div>

      <!-- Upload UI -->
      <div v-else class="space-y-6">
        <div>
          <h1 class="text-2xl font-bold">Upload Files</h1>
          <p class="text-muted text-sm mt-1">Uploading to <span class="font-mono font-medium">{{ folderDisplay }}</span></p>
        </div>

        <UFileUpload
          multiple
          :preview="false"
          label="Drop files here or click to select"
          description="Any file type, up to any size"
          class="w-full min-h-40"
          @update:model-value="handleFiles"
        />

        <!-- File list -->
        <div v-if="items.length" class="space-y-3">
          <div
            v-for="item in items"
            :key="item.id"
            class="border rounded-lg p-3 space-y-2"
          >
            <div class="flex items-center justify-between gap-2">
              <div class="flex items-center gap-2 min-w-0">
                <UIcon :name="statusIcon(item.status)" :class="statusIconClass(item.status)" class="size-4 shrink-0" />
                <span class="text-sm font-medium truncate">{{ item.file.name }}</span>
                <span class="text-xs text-muted shrink-0">{{ formatSize(item.file.size) }}</span>
              </div>
              <UButton
                v-if="item.status === 'pending'"
                icon="i-lucide-x"
                size="xs"
                variant="ghost"
                color="neutral"
                @click="removeFile(item.id)"
              />
            </div>

            <UProgress
              v-if="item.status === 'uploading'"
              :value="item.progress"
              size="sm"
            />

            <p v-if="item.status === 'error'" class="text-xs text-error">{{ item.error }}</p>
          </div>
        </div>

        <div v-if="items.length" class="flex justify-between items-center">
          <p class="text-sm text-muted">{{ pendingCount }} file(s) pending</p>
          <UButton
            label="Upload All"
            icon="i-lucide-upload"
            :loading="uploading"
            :disabled="pendingCount === 0"
            @click="startUpload"
          />
        </div>
      </div>

    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({ layout: 'default', middleware: 'auth' })

const route = useRoute()
const toast = useToast()

const folderParam = computed(() => decodeURIComponent(route.params.folder as string))
const token = computed(() => route.query.token as string ?? '')
const folder = computed(() => {
  const f = folderParam.value
  return f.endsWith('/') ? f : `${f}/`
})
const folderDisplay = computed(() => folderParam.value)

const validating = ref(true)
const error = ref('')
const uploading = ref(false)

const { items, addFiles, removeFile, uploadAll } = useMultipartUpload(token, folder)

const pendingCount = computed(() => items.value.filter(i => i.status === 'pending').length)

onMounted(async () => {
  if (!token.value) {
    error.value = 'No upload token provided.'
    validating.value = false
    return
  }

  try {
    await $fetch('/api/upload/validate', {
      query: { token: token.value, folder: folder.value }
    })
  } catch (e: any) {
    error.value = e.data?.message ?? 'This upload link is invalid or has expired.'
  } finally {
    validating.value = false
  }
})

function handleFiles(files: File[] | null) {
  if (files?.length) addFiles(files)
}

async function startUpload() {
  uploading.value = true
  await uploadAll()
  uploading.value = false

  const succeeded = items.value.filter(i => i.status === 'complete').length
  const failed = items.value.filter(i => i.status === 'error').length

  if (succeeded > 0) {
    toast.add({ title: `${succeeded} file(s) uploaded successfully`, color: 'success' })
  }
  if (failed > 0) {
    toast.add({ title: `${failed} file(s) failed to upload`, color: 'error' })
  }
}

function statusIcon(status: string) {
  if (status === 'complete') return 'i-lucide-check-circle'
  if (status === 'error') return 'i-lucide-x-circle'
  if (status === 'uploading') return 'i-lucide-loader'
  return 'i-lucide-file'
}

function statusIconClass(status: string) {
  if (status === 'complete') return 'text-success'
  if (status === 'error') return 'text-error'
  if (status === 'uploading') return 'text-primary animate-spin'
  return 'text-muted'
}

function formatSize(bytes: number) {
  if (bytes === 0) return '0 B'
  const units = ['B', 'KB', 'MB', 'GB', 'TB']
  const i = Math.floor(Math.log(bytes) / Math.log(1024))
  return `${(bytes / Math.pow(1024, i)).toFixed(1)} ${units[i]}`
}
</script>
