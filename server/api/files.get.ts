import { ListObjectsV2Command } from '@aws-sdk/client-s3'

export default defineEventHandler(async (event) => {
  await requireUserSession(event)

  const query = getQuery(event)
  const folder = query.folder as string

  if (!folder) {
    throw createError({ statusCode: 400, message: 'Folder parameter is required' })
  }

  const config = useRuntimeConfig()
  const s3 = useS3Client()

  const prefix = folder.endsWith('/') ? folder : `${folder}/`

  const command = new ListObjectsV2Command({
    Bucket: config.bucketName,
    Prefix: prefix
  })

  const response = await s3.send(command)

  const files = (response.Contents || [])
    .filter((obj) => obj.Key !== prefix)
    .map((obj) => {
      const key = obj.Key!
      const name = key.split('/').pop() || key
      const sizeBytes = obj.Size || 0
      const lastModified = obj.LastModified?.toISOString() || ''

      return {
        key,
        name,
        size: formatFileSize(sizeBytes),
        sizeBytes,
        lastModified,
        extension: name.includes('.') ? name.split('.').pop()?.toLowerCase() : ''
      }
    })

  return files
})

function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 B'
  const units = ['B', 'KB', 'MB', 'GB', 'TB']
  const i = Math.floor(Math.log(bytes) / Math.log(1024))
  return `${(bytes / Math.pow(1024, i)).toFixed(1)} ${units[i]}`
}
