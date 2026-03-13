import { S3Client } from '@aws-sdk/client-s3'

let _s3Client: S3Client | null = null

export function useS3Client() {
  if (!_s3Client) {
    const config = useRuntimeConfig()
    _s3Client = new S3Client({
      region: config.awsRegion,
      credentials: {
        accessKeyId: config.awsAccessKeyId,
        secretAccessKey: config.awsSecretAccessKey
      }
    })
  }
  return _s3Client
}
