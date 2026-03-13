import { UploadPartCommand } from '@aws-sdk/client-s3'
import { getSignedUrl } from '@aws-sdk/s3-request-presigner'

export default defineEventHandler(async (event) => {
  const { token, folder, key, uploadId, partNumber } = await readBody(event)

  if (!token || !folder || !key || !uploadId || !partNumber) {
    throw createError({ statusCode: 400, message: 'token, folder, key, uploadId, and partNumber are required' })
  }

  await validateUploadToken(token, folder)

  const config = useRuntimeConfig()
  const s3 = useS3Client()

  const command = new UploadPartCommand({
    Bucket: config.bucketName,
    Key: key,
    UploadId: uploadId,
    PartNumber: partNumber
  })

  const url = await getSignedUrl(s3, command, { expiresIn: 3600 })

  return { url }
})
