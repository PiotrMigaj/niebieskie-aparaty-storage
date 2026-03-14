<template>
  <UDashboardGroup>
    <UDashboardSidebar mode="slideover" :toggle="true">
      <template #header>
        <div class="flex items-center gap-2 px-4 py-3">
          <span class="font-serif text-xl font-semibold">Niebieskie Aparaty</span>
        </div>
      </template>

      <template #default>
        <DashboardFolderNav />
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
  </UDashboardGroup>
</template>

<script setup lang="ts">
const { user, clear } = useUserSession()
const router = useRouter()

async function handleLogout() {
  await $fetch('/api/auth/logout', { method: 'POST' })
  await clear()
  router.push('/login')
}
</script>
