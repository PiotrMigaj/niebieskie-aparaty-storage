import { ListObjectsV2Command } from '@aws-sdk/client-s3'

export default defineEventHandler(async (event) => {
  await requireUserSession(event)

  const config = useRuntimeConfig()
  const s3 = useS3Client()

  const command = new ListObjectsV2Command({
    Bucket: config.bucketName,
    Delimiter: '/'
  })

  const response = await s3.send(command)

  const folders = (response.CommonPrefixes || []).map((prefix) => {
    const name = prefix.Prefix!.replace(/\/$/, '')
    return { name, prefix: prefix.Prefix! }
  })

  return folders
})
