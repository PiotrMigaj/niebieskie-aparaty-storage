export default defineEventHandler(async (event) => {
  await requireUserSession(event)

  const id = getRouterParam(event, 'id')

  if (!id) {
    throw createError({ statusCode: 400, message: 'Token ID is required' })
  }

  await deleteUploadToken(id)

  return { success: true }
})
