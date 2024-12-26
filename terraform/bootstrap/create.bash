#!/bin/bash

set -e

# export necessary environment variables
if [ -f .env ]; then
    export $(cat .env | xargs)
else
    echo ".env file not found"
    exit 1
fi

# create bucket (buckets are encypted by default; public access is blocked by default)
echo "-> creating bucket $BUCKET_NAME"
aws s3api create-bucket \
    --bucket $BUCKET_NAME \
    --region $RESOURCE_REGION \
    > /dev/null
echo "-> enabling versioning on bucket $BUCKET_NAME"
aws s3api put-bucket-versioning \
    --bucket $BUCKET_NAME \
    --versioning-configuration Status=Enabled \
    > /dev/null

# create dynamodb table
echo "-> creating dynamodb table $DYNAMODB_TABLE_NAME"
aws dynamodb create-table \
    --table-name $DYNAMODB_TABLE_NAME \
    --region $RESOURCE_REGION \
    --attribute-definitions AttributeName=LockID,AttributeType=S \
    --key-schema AttributeName=LockID,KeyType=HASH \
    --billing-mode PAY_PER_REQUEST \
    > /dev/null

# celebrate
echo "Terraform backend resources created successfully"
