# One-Time AWS Setup

Required before the upload feature works. Run once per environment.

---

## 1. DynamoDB Table

Creates the `UploadTokens` table with TTL-based automatic expiry cleanup.

```bash
# Create table
aws dynamodb create-table \
  --table-name UploadTokens \
  --attribute-definitions AttributeName=tokenId,AttributeType=S \
  --key-schema AttributeName=tokenId,KeyType=HASH \
  --billing-mode PAY_PER_REQUEST \
  --region eu-central-1

# Enable TTL on the expiresAt attribute (Unix timestamp seconds)
aws dynamodb update-time-to-live \
  --table-name UploadTokens \
  --time-to-live-specification Enabled=true,AttributeName=expiresAt \
  --region eu-central-1
```

Verify:

```bash
aws dynamodb describe-table --table-name UploadTokens --region eu-central-1 \
  --query 'Table.{Status:TableStatus,TTL:TimeToLiveDescription}'
```

Expected output:

```json
{
    "Status": "ACTIVE",
    "TTL": {
        "TimeToLiveStatus": "ENABLED",
        "AttributeName": "expiresAt"
    }
}
```

---

## 2. S3 CORS

Required so the browser can PUT parts directly to S3 via presigned URLs and read the `ETag` response header (needed to complete multipart uploads).

Save the policy to a file and apply it:

```bash
cat > /tmp/cors.json << 'EOF'
[
  {
    "AllowedHeaders": ["*"],
    "AllowedMethods": ["PUT", "GET"],
    "AllowedOrigins": ["http://localhost:3000"],
    "ExposeHeaders": ["ETag"],
    "MaxAgeSeconds": 3600
  }
]
EOF

aws s3api put-bucket-cors \
  --bucket niebieskie-aparaty-storage \
  --cors-configuration file:///tmp/cors.json \
  --region eu-central-1
```

> **Production:** replace `http://localhost:3000` in `AllowedOrigins` with your actual domain, e.g. `https://storage.example.com`.

Verify:

```bash
aws s3api get-bucket-cors --bucket niebieskie-aparaty-storage --region eu-central-1
```

Expected output:

```json
{
    "CORSRules": [
        {
            "AllowedHeaders": ["*"],
            "AllowedMethods": ["PUT", "GET"],
            "AllowedOrigins": ["http://localhost:3000"],
            "ExposeHeaders": ["ETag"],
            "MaxAgeSeconds": 3600
        }
    ]
}
```

---

## Combined script

Run both steps in one go:

```bash
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

echo "✓ Done."
```

Save as `scripts/aws-setup.sh`, make executable, and run:

```bash
chmod +x scripts/aws-setup.sh
./scripts/aws-setup.sh
```

---

## IAM permissions required

The AWS credentials in `.env` need these permissions:

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": [
        "dynamodb:PutItem",
        "dynamodb:GetItem",
        "dynamodb:DeleteItem",
        "dynamodb:Scan"
      ],
      "Resource": "arn:aws:dynamodb:eu-central-1:*:table/UploadTokens"
    },
    {
      "Effect": "Allow",
      "Action": [
        "s3:PutObject",
        "s3:CreateMultipartUpload",
        "s3:UploadPart",
        "s3:CompleteMultipartUpload",
        "s3:AbortMultipartUpload"
      ],
      "Resource": "arn:aws:s3:::niebieskie-aparaty-storage/*"
    }
  ]
}
```
