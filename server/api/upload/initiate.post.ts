import { CreateMultipartUploadCommand } from '@aws-sdk/client-s3'

export default defineEventHandler(async (event) => {
  const { token, folder, filename } = await readBody(event)

  if (!token || !folder || !filename) {
    throw createError({ statusCode: 400, message: 'token, folder, and filename are required' })
  }

  await validateUploadToken(token, folder)

  const config = useRuntimeConfig()
  const s3 = useS3Client()

  const prefix = folder.endsWith('/') ? folder : `${folder}/`
  const key = `${prefix}${filename}`

  const command = new CreateMultipartUploadCommand({
    Bucket: config.bucketName,
    Key: key
  })

  const response = await s3.send(command)

  return { uploadId: response.UploadId, key }
})
