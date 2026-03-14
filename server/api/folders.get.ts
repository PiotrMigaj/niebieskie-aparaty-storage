import { ListObjectsV2Command } from '@aws-sdk/client-s3'

async function sleep(time: number): Promise<void> {
  return new Promise((resolve) => {
    setTimeout(() => {
      console.log("Hello");
      resolve();
    }, time);
  });
}

export default defineEventHandler(async (event) => {
  await requireUserSession(event)

  // await sleep(5000);

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
