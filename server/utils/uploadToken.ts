import { PutCommand, GetCommand, DeleteCommand, ScanCommand } from '@aws-sdk/lib-dynamodb'
import { v4 as uuidv4 } from 'uuid'

export interface UploadToken {
  tokenId: string
  folder: string
  createdAt: string
  expiresAt: number
  createdBy: string
}

export async function createUploadToken(
  folder: string,
  expiresInSeconds: number,
  createdBy: string
): Promise<UploadToken> {
  const config = useRuntimeConfig()
  const dynamo = useDynamoClient()

  const now = new Date()
  const token: UploadToken = {
    tokenId: uuidv4(),
    folder,
    createdAt: now.toISOString(),
    expiresAt: Math.floor(now.getTime() / 1000) + expiresInSeconds,
    createdBy
  }

  await dynamo.send(new PutCommand({
    TableName: config.dynamoTableName,
    Item: token
  }))

  return token
}

export async function getUploadToken(tokenId: string): Promise<UploadToken | null> {
  const config = useRuntimeConfig()
  const dynamo = useDynamoClient()

  const result = await dynamo.send(new GetCommand({
    TableName: config.dynamoTableName,
    Key: { tokenId }
  }))

  return (result.Item as UploadToken) ?? null
}

export async function validateUploadToken(tokenId: string, folder: string): Promise<UploadToken> {
  const token = await getUploadToken(tokenId)

  if (!token) {
    throw createError({ statusCode: 401, message: 'Invalid upload token' })
  }

  if (token.expiresAt < Math.floor(Date.now() / 1000)) {
    throw createError({ statusCode: 401, message: 'Upload token has expired' })
  }

  if (token.folder !== folder) {
    throw createError({ statusCode: 403, message: 'Token is not valid for this folder' })
  }

  return token
}

export async function deleteUploadToken(tokenId: string): Promise<void> {
  const config = useRuntimeConfig()
  const dynamo = useDynamoClient()

  await dynamo.send(new DeleteCommand({
    TableName: config.dynamoTableName,
    Key: { tokenId }
  }))
}

export async function listActiveTokens(): Promise<UploadToken[]> {
  const config = useRuntimeConfig()
  const dynamo = useDynamoClient()

  const now = Math.floor(Date.now() / 1000)

  const result = await dynamo.send(new ScanCommand({
    TableName: config.dynamoTableName,
    FilterExpression: 'expiresAt > :now',
    ExpressionAttributeValues: { ':now': now }
  }))

  return (result.Items ?? []) as UploadToken[]
}
