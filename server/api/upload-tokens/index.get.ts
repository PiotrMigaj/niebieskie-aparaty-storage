export default defineEventHandler(async (event) => {
  await requireUserSession(event)

  const tokens = await listActiveTokens()

  return tokens
})
