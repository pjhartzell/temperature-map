#!/bin/bash

set -e

# export necessary environment variables
if [ -f .env ]; then
    export $(cat .env | xargs)
else
    echo ".env file not found"
    exit 1
fi

# delete versioned objects in bucket
echo "-> deleting objects in bucket $BUCKET_NAME"
aws s3api list-object-versions \
        --bucket $BUCKET_NAME \
        --region $RESOURCE_REGION \
        --query "Versions[].Key"  \
        --output json | jq 'unique' | jq -r '.[]' | while read key; do
    echo "    -> deleting versions of $key"
    aws s3api list-object-versions \
            --bucket $BUCKET_NAME \
            --region $RESOURCE_REGION \
            --prefix $key \
            --query "Versions[].VersionId"  \
            --output json | jq 'unique' | jq -r '.[]' | while read version; do
        echo "        -> deleting $version"
        aws s3api delete-object \
            --bucket $BUCKET_NAME \
            --key $key \
            --version-id $version \
            --region $RESOURCE_REGION \
            > /dev/null
    done
done  

# delete bucket
echo "-> deleting bucket $BUCKET_NAME"
aws s3api delete-bucket \
    --bucket $BUCKET_NAME \
    > /dev/null

# delete dynamodb table
echo "-> deleting dynamodb table $DYNAMODB_TABLE_NAME"
aws dynamodb delete-table \
    --table-name $DYNAMODB_TABLE_NAME \
    > /dev/null

# celebrate
echo "Terraform backend resources deleted successfully"