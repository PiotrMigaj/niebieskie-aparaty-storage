export default defineEventHandler(async (event) => {
  const { username, password } = await readBody(event)
  const config = useRuntimeConfig()
  console.log(username, password, config.adminUsername, config.adminPassword)
  if (username !== config.adminUsername || password !== config.adminPassword) {
    throw createError({ statusCode: 401, message: 'Invalid credentials' })
  }

  await setUserSession(event, {
    user: {
      name: username,
      role: 'admin'
    },
    loggedInAt: new Date()
  })

  return { success: true }
})
