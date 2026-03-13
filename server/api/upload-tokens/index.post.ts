export default defineEventHandler(async (event) => {
  const session = await requireUserSession(event)
  const { folder, expiresIn } = await readBody(event)

  if (!folder || !expiresIn) {
    throw createError({ statusCode: 400, message: 'folder and expiresIn are required' })
  }

  const token = await createUploadToken(folder, expiresIn, session.user.name)

  return token
})
