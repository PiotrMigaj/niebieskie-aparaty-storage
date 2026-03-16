<template>
  <div class="flex min-h-screen items-center justify-center bg-white px-4">
    <UPageCard class="w-full max-w-md">
      <div class="mb-4 text-center">
        <h1 class="font-serif text-3xl font-bold">Niebieskie Aparaty</h1>
      </div>
      <UAuthForm
        title="Admin Login"
        description="Sign in to access your storage dashboard."
        icon="i-lucide-lock"
        :fields="fields"
        :submit="{ label: 'Sign In', icon: 'i-lucide-arrow-right' }"
        :loading="loading"
        :providers="providers"
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
const route = useRoute()
const { fetch: fetchSession } = useUserSession()
const loading = ref(false)

const providers = [
  {
    label: 'Sign in with Google',
    icon: 'i-logos-google-icon',
    color: 'white' as const,
    onClick: () => navigateTo('/auth/google', { external: true })
  }
]

onMounted(() => {
  if (route.query.error === 'unauthorized') {
    toast.add({
      title: 'Access denied',
      description: 'Your email is not allowed to sign in.',
      color: 'error',
      icon: 'i-lucide-alert-circle'
    })
  } else if (route.query.error === 'oauth') {
    toast.add({
      title: 'Google sign-in failed',
      description: 'An error occurred during Google authentication.',
      color: 'error',
      icon: 'i-lucide-alert-circle'
    })
  }
})

const fields = [
  {
    name: 'username',
    label: 'Username',
    type: 'text' as const,
    placeholder: 'Enter username',
    required: true,
    autocomplete: 'off'
  },
  {
    name: 'password',
    label: 'Password',
    type: 'password' as const,
    placeholder: 'Enter password',
    required: true,
    autocomplete: 'new-password'
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
