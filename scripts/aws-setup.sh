#!/usr/bin/env bash
set -euo pipefail

REGION="eu-central-1"
TABLE="UploadTokens"
BUCKET="niebieskie-aparaty-storage"

echo "→ Creating DynamoDB table..."
aws dynamodb create-table \
  --table-name "$TABLE" \
  --attribute-definitions AttributeName=tokenId,AttributeType=S \
  --key-schema AttributeName=tokenId,KeyType=HASH \
  --billing-mode PAY_PER_REQUEST \
  --region "$REGION" \
  --output text --query 'TableDescription.TableStatus'

echo "→ Waiting for table to become ACTIVE..."
aws dynamodb wait table-exists --table-name "$TABLE" --region "$REGION"

echo "→ Enabling TTL..."
aws dynamodb update-time-to-live \
  --table-name "$TABLE" \
  --time-to-live-specification Enabled=true,AttributeName=expiresAt \
  --region "$REGION" \
  --output text --query 'TimeToLiveSpecification.TimeToLiveStatus'

echo "→ Configuring S3 CORS..."
aws s3api put-bucket-cors \
  --bucket "$BUCKET" \
  --cors-configuration '{
    "CORSRules": [{
      "AllowedHeaders": ["*"],
      "AllowedMethods": ["PUT", "GET"],
      "AllowedOrigins": ["http://localhost:3000"],
      "ExposeHeaders": ["ETag"],
      "MaxAgeSeconds": 3600
    }]
  }' \
  --region "$REGION"

echo "✓ Done. Verify with:"
echo "  aws dynamodb describe-table --table-name $TABLE --region $REGION --query 'Table.{Status:TableStatus,TTL:TimeToLiveDescription}'"
echo "  aws s3api get-bucket-cors --bucket $BUCKET --region $REGION"
