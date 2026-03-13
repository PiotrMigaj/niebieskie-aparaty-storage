import { DynamoDBClient } from '@aws-sdk/client-dynamodb'
import { DynamoDBDocumentClient } from '@aws-sdk/lib-dynamodb'

let _dynamoClient: DynamoDBDocumentClient | null = null

export function useDynamoClient() {
  if (!_dynamoClient) {
    const config = useRuntimeConfig()
    const client = new DynamoDBClient({
      region: config.awsRegion,
      credentials: {
        accessKeyId: config.awsAccessKeyId,
        secretAccessKey: config.awsSecretAccessKey
      }
    })
    _dynamoClient = DynamoDBDocumentClient.from(client)
  }
  return _dynamoClient
}
