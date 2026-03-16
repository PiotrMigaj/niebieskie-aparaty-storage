<template>
  <UDashboardGroup>
    <UDashboardSidebar mode="slideover" :toggle="true">
      <template #header>
        <div class="flex items-center gap-2 px-4 py-3">
          <span class="font-serif text-xl font-semibold">Niebieskie Aparaty</span>
        </div>
      </template>

      <template #default>
        <DashboardFolderNav
          :folders="folders"
          :selected-folder="selectedFolder"
          :status="foldersStatus"
          :error="foldersError"
          @select-folder="selectFolder"
          @open-create-modal="createModalOpen = true"
          @open-upload-link-modal="uploadLinkModalOpen = true"
        />
      </template>

      <template #footer>
        <div class="flex items-center justify-between px-4 py-3">
          <UUser
            :name="user?.name || 'Admin'"
            description="Administrator"
            :avatar="{ icon: 'i-lucide-user', color: 'neutral' }"
          />
          <UTooltip text="Logout">
            <UButton
              icon="i-lucide-log-out"
              variant="ghost"
              color="neutral"
              size="sm"
              @click="handleLogout"
            />
          </UTooltip>
        </div>
      </template>
    </UDashboardSidebar>

    <slot />

    <CreateFolderModal
      v-model:open="createModalOpen"
      :loading="createFolderLoading"
      @submit="handleCreateFolder"
    />
    <GenerateUploadLinkModal
      v-model:open="uploadLinkModalOpen"
      :folder="selectedFolder || ''"
      :loading="uploadLinkLoading"
      :generated-url="generatedUrl"
      @generate="handleGenerateUploadLink"
    />
  </UDashboardGroup>
</template>

<script setup lang="ts">
const { user, clear } = useUserSession()
const router = useRouter()
const toast = useToast()

const { folders, selectedFolder, status: foldersStatus, error: foldersError, selectFolder, createFolder, generateUploadToken } = useFolders()

const createModalOpen = ref(false)
const createFolderLoading = ref(false)
const uploadLinkModalOpen = ref(false)
const uploadLinkLoading = ref(false)
const generatedUrl = ref('')

watch(uploadLinkModalOpen, (val) => {
  if (!val) generatedUrl.value = ''
})

async function handleCreateFolder(name: string) {
  createFolderLoading.value = true
  try {
    await createFolder(name)
    createModalOpen.value = false
  } catch (e: unknown) {
    const message = (e as { data?: { message?: string } })?.data?.message ?? 'Failed to create folder'
    toast.add({ title: message, color: 'error' })
  } finally {
    createFolderLoading.value = false
  }
}

async function handleGenerateUploadLink(payload: { folder: string; expiresIn: number }) {
  uploadLinkLoading.value = true
  try {
    const token = await generateUploadToken(payload.folder, payload.expiresIn)
    const folder = payload.folder.replace(/\/$/, '')
    const origin = window.location.origin
    generatedUrl.value = `${origin}/upload/${encodeURIComponent(folder)}?token=${token.tokenId}`
  } catch {
    toast.add({ title: 'Failed to generate link', color: 'error' })
  } finally {
    uploadLinkLoading.value = false
  }
}

async function handleLogout() {
  await $fetch('/api/auth/logout', { method: 'POST' })
  await clear()
  router.push('/login')
}
</script>
