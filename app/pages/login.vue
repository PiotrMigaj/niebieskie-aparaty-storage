<template>
  <div class="flex min-h-screen items-center justify-center bg-neutral-50 dark:bg-neutral-950">
    <UPageCard class="w-full max-w-md">
      <UAuthForm
        title="Admin Login"
        description="Sign in to access your storage dashboard."
        icon="i-lucide-lock"
        :fields="fields"
        :submit="{ label: 'Sign In', icon: 'i-lucide-arrow-right' }"
        :loading="loading"
        @submit="(event) => onSubmit(event.data)"
      />
    </UPageCard>
  </div>
</template>

<script setup lang="ts">
definePageMeta({
  layout: 'default',
  middleware: 'auth'
})

const toast = useToast()
const router = useRouter()
const { fetch: fetchSession } = useUserSession()
const loading = ref(false)

const fields = [
  {
    name: 'username',
    label: 'Username',
    type: 'text' as const,
    placeholder: 'Enter username',
    required: true
  },
  {
    name: 'password',
    label: 'Password',
    type: 'password' as const,
    placeholder: 'Enter password',
    required: true
  }
]

async function onSubmit(data: { username: string; password: string }) {
  loading.value = true
  try {
    await $fetch('/api/auth/login', {
      method: 'POST',
      body: data
    })
    await fetchSession()
    router.push('/')
  }
  catch {
    toast.add({
      title: 'Login failed',
      description: 'Invalid username or password.',
      color: 'error',
      icon: 'i-lucide-alert-circle'
    })
  }
  finally {
    loading.value = false
  }
}
</script>
