#!/usr/bin/env bash
# Section 4 / 13 step 4 — single table, on-demand, no GSI, TTL on expiresAt.
# Point-in-Time Recovery is deliberately left OFF (section 4, cost).

source "$(cd "$(dirname "$0")" && pwd)/_lib.sh"

printf '\n=== [3] DynamoDB ===\n'
require_aws

step 1/3 "Table $TABLE_NAME"
if aws dynamodb describe-table --region "$AWS_REGION" --table-name "$TABLE_NAME" > /dev/null 2>&1; then
  handle_existing "DynamoDB table $TABLE_NAME" "already in $AWS_REGION"
else
  aws dynamodb create-table \
    --region "$AWS_REGION" \
    --table-name "$TABLE_NAME" \
    --attribute-definitions AttributeName=PK,AttributeType=S AttributeName=SK,AttributeType=S \
    --key-schema AttributeName=PK,KeyType=HASH AttributeName=SK,KeyType=RANGE \
    --billing-mode PAY_PER_REQUEST \
    --table-class STANDARD \
    --tags Key=Project,Value=PolicyRaj Key=Component,Value=dashboard > /dev/null
  ok "created (PK/SK, PAY_PER_REQUEST, no GSI)"
fi

step 2/3 "Waiting for ACTIVE"
aws dynamodb wait table-exists --region "$AWS_REGION" --table-name "$TABLE_NAME"
ok "active"

step 3/3 "TTL on expiresAt"
TTL_STATUS="$(aws dynamodb describe-time-to-live --region "$AWS_REGION" \
  --table-name "$TABLE_NAME" --query 'TimeToLiveDescription.TimeToLiveStatus' --output text)"

if [ "$TTL_STATUS" = "ENABLED" ]; then
  ok "TTL already enabled"
else
  aws dynamodb update-time-to-live \
    --region "$AWS_REGION" \
    --table-name "$TABLE_NAME" \
    --time-to-live-specification "Enabled=true,AttributeName=expiresAt" > /dev/null
  ok "TTL enabled — activity items expire 180 days out"
fi

printf '\n=== DynamoDB ready ===\n'
printf '    No GSI created. No PITR enabled. Both are intentional (section 4).\n\n'
