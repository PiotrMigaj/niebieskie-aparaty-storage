import { GetObjectCommand } from '@aws-sdk/client-s3'
import { getSignedUrl } from '@aws-sdk/s3-request-presigner'

export default defineEventHandler(async (event) => {
  await requireUserSession(event)

  const query = getQuery(event)
  const key = query.key as string

  if (!key) {
    throw createError({ statusCode: 400, message: 'Key parameter is required' })
  }

  const config = useRuntimeConfig()
  const s3 = useS3Client()

  const filename = key.split('/').pop() || key
  const encodedFilename = encodeURIComponent(filename)

  const command = new GetObjectCommand({
    Bucket: config.bucketName,
    Key: key,
    ResponseContentDisposition: `attachment; filename*=UTF-8''${encodedFilename}`
  })

  const url = await getSignedUrl(s3, command, { expiresIn: 3600 })

  return { url }
})
