import { CompleteMultipartUploadCommand } from '@aws-sdk/client-s3'

export default defineEventHandler(async (event) => {
  const { token, folder, key, uploadId, parts } = await readBody(event)

  if (!token || !folder || !key || !uploadId || !parts) {
    throw createError({ statusCode: 400, message: 'token, folder, key, uploadId, and parts are required' })
  }

  await validateUploadToken(token, folder)

  const config = useRuntimeConfig()
  const s3 = useS3Client()

  const command = new CompleteMultipartUploadCommand({
    Bucket: config.bucketName,
    Key: key,
    UploadId: uploadId,
    MultipartUpload: {
      Parts: parts.map((p: { partNumber: number; etag: string }) => ({
        PartNumber: p.partNumber,
        ETag: p.etag
      }))
    }
  })

  await s3.send(command)

  return { key }
})
