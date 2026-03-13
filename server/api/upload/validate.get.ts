export default defineEventHandler(async (event) => {
  const { token, folder } = getQuery(event) as { token: string; folder: string }

  if (!token || !folder) {
    throw createError({ statusCode: 400, message: 'token and folder are required' })
  }

  await validateUploadToken(token, folder)

  return { valid: true, folder }
})
