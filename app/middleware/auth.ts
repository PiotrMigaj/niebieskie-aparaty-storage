export default defineNuxtRouteMiddleware((to) => {
  if (to.path.startsWith('/upload')) {
    return
  }

  const { loggedIn } = useUserSession()

  if (!loggedIn.value && to.path !== '/login') {
    return navigateTo('/login')
  }

  if (loggedIn.value && to.path === '/login') {
    return navigateTo('/')
  }
})
