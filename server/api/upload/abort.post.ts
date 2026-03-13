import { AbortMultipartUploadCommand } from '@aws-sdk/client-s3'

export default defineEventHandler(async (event) => {
  const { token, folder, key, uploadId } = await readBody(event)

  if (!token || !folder || !key || !uploadId) {
    throw createError({ statusCode: 400, message: 'token, folder, key, and uploadId are required' })
  }

  await validateUploadToken(token, folder)

  const config = useRuntimeConfig()
  const s3 = useS3Client()

  const command = new AbortMultipartUploadCommand({
    Bucket: config.bucketName,
    Key: key,
    UploadId: uploadId
  })

  await s3.send(command)

  return { success: true }
})
