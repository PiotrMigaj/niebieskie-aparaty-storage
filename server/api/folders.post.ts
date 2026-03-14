import { PutObjectCommand } from '@aws-sdk/client-s3'

export default defineEventHandler(async (event) => {
  await requireUserSession(event)

  const { name } = await readBody(event)

  if (!name || typeof name !== 'string' || !name.trim()) {
    throw createError({ statusCode: 400, message: 'Folder name is required' })
  }

  const trimmed = name.trim().replace(/^\/+|\/+$/g, '')

  if (!trimmed || trimmed.includes('/')) {
    throw createError({ statusCode: 400, message: 'Folder name must not contain slashes' })
  }

  const config = useRuntimeConfig()
  const s3 = useS3Client()

  await s3.send(new PutObjectCommand({
    Bucket: config.bucketName,
    Key: `${trimmed}/`,
    Body: ''
  }))

  return { prefix: `${trimmed}/` }
})
