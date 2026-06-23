#!/usr/bin/env bash
# PolicyRaj — Newsletter Lambda Deploy Script
# Run once from this directory: bash deploy.sh
# Requires: AWS CLI configured with an IAM user that has Lambda, DynamoDB,
#           SES, IAM, and API Gateway permissions.

set -e

REGION="ap-south-1"
ACCOUNT_ID=$(aws sts get-caller-identity --query Account --output text)
FUNCTION_NAME="policyraj-newsletter"
TABLE_NAME="policyraj-newsletter"
ROLE_NAME="policyraj-newsletter-role"
API_NAME="policyraj-newsletter-api"
FROM_EMAIL="sachin@policyraj.com"
NOTIFY_EMAIL="sachin@policyraj.com"
ALLOWED_ORIGIN="https://policyraj.in"

echo "==> Account: $ACCOUNT_ID  |  Region: $REGION"

# ── 1. DynamoDB table ────────────────────────────────────────────────────────
echo "==> Creating DynamoDB table..."
aws dynamodb create-table \
  --table-name "$TABLE_NAME" \
  --attribute-definitions AttributeName=email,AttributeType=S \
  --key-schema AttributeName=email,KeyType=HASH \
  --billing-mode PAY_PER_REQUEST \
  --region "$REGION" 2>/dev/null || echo "    Table already exists — skipping."

# ── 2. IAM role ──────────────────────────────────────────────────────────────
echo "==> Creating IAM role..."
TRUST='{
  "Version":"2012-10-17",
  "Statement":[{
    "Effect":"Allow",
    "Principal":{"Service":"lambda.amazonaws.com"},
    "Action":"sts:AssumeRole"
  }]
}'
ROLE_ARN=$(aws iam create-role \
  --role-name "$ROLE_NAME" \
  --assume-role-policy-document "$TRUST" \
  --query Role.Arn --output text 2>/dev/null) \
|| ROLE_ARN=$(aws iam get-role --role-name "$ROLE_NAME" --query Role.Arn --output text)
echo "    Role ARN: $ROLE_ARN"

# Attach basic Lambda execution policy
aws iam attach-role-policy \
  --role-name "$ROLE_NAME" \
  --policy-arn arn:aws:iam::aws:policy/service-role/AWSLambdaBasicExecutionRole 2>/dev/null || true

# Inline policy for DynamoDB + SES
POLICY='{
  "Version":"2012-10-17",
  "Statement":[
    {
      "Effect":"Allow",
      "Action":["dynamodb:PutItem","dynamodb:GetItem"],
      "Resource":"arn:aws:dynamodb:'"$REGION"':'"$ACCOUNT_ID"':table/'"$TABLE_NAME"'"
    },
    {
      "Effect":"Allow",
      "Action":["ses:SendEmail","ses:SendRawEmail"],
      "Resource":"*"
    }
  ]
}'
aws iam put-role-policy \
  --role-name "$ROLE_NAME" \
  --policy-name "policyraj-newsletter-policy" \
  --policy-document "$POLICY"

echo "    Waiting 10s for IAM role to propagate..."
sleep 10

# ── 3. Zip and deploy Lambda ─────────────────────────────────────────────────
echo "==> Packaging Lambda..."
zip -j newsletter.zip index.mjs

echo "==> Deploying Lambda function..."
LAMBDA_ARN=$(aws lambda create-function \
  --function-name "$FUNCTION_NAME" \
  --runtime nodejs20.x \
  --role "$ROLE_ARN" \
  --handler index.handler \
  --zip-file fileb://newsletter.zip \
  --timeout 15 \
  --memory-size 128 \
  --environment "Variables={DYNAMO_TABLE=$TABLE_NAME,FROM_EMAIL=$FROM_EMAIL,NOTIFY_EMAIL=$NOTIFY_EMAIL,ALLOWED_ORIGIN=$ALLOWED_ORIGIN}" \
  --region "$REGION" \
  --query FunctionArn --output text 2>/dev/null) \
|| {
  echo "    Function exists — updating code and config..."
  aws lambda update-function-code \
    --function-name "$FUNCTION_NAME" \
    --zip-file fileb://newsletter.zip \
    --region "$REGION" > /dev/null
  aws lambda update-function-configuration \
    --function-name "$FUNCTION_NAME" \
    --environment "Variables={DYNAMO_TABLE=$TABLE_NAME,FROM_EMAIL=$FROM_EMAIL,NOTIFY_EMAIL=$NOTIFY_EMAIL,ALLOWED_ORIGIN=$ALLOWED_ORIGIN}" \
    --region "$REGION" > /dev/null
  LAMBDA_ARN=$(aws lambda get-function \
    --function-name "$FUNCTION_NAME" \
    --region "$REGION" \
    --query Configuration.FunctionArn --output text)
}
echo "    Lambda ARN: $LAMBDA_ARN"
rm -f newsletter.zip

# ── 4. HTTP API Gateway ───────────────────────────────────────────────────────
echo "==> Creating HTTP API Gateway..."
API_ID=$(aws apigatewayv2 create-api \
  --name "$API_NAME" \
  --protocol-type HTTP \
  --cors-configuration \
    AllowOrigins="$ALLOWED_ORIGIN",AllowMethods=POST,OPTIONS,AllowHeaders=Content-Type \
  --region "$REGION" \
  --query ApiId --output text 2>/dev/null) \
|| API_ID=$(aws apigatewayv2 get-apis \
    --region "$REGION" \
    --query "Items[?Name=='$API_NAME'].ApiId" --output text)
echo "    API ID: $API_ID"

# Lambda integration
INTEGRATION_ID=$(aws apigatewayv2 create-integration \
  --api-id "$API_ID" \
  --integration-type AWS_PROXY \
  --integration-uri "$LAMBDA_ARN" \
  --payload-format-version 2.0 \
  --region "$REGION" \
  --query IntegrationId --output text)

# POST /newsletter route
aws apigatewayv2 create-route \
  --api-id "$API_ID" \
  --route-key "POST /newsletter" \
  --target "integrations/$INTEGRATION_ID" \
  --region "$REGION" > /dev/null

# Auto-deploy stage
aws apigatewayv2 create-stage \
  --api-id "$API_ID" \
  --stage-name '$default' \
  --auto-deploy \
  --region "$REGION" > /dev/null 2>/dev/null || true

# Allow API Gateway to invoke Lambda
aws lambda add-permission \
  --function-name "$FUNCTION_NAME" \
  --statement-id "apigw-invoke-$(date +%s)" \
  --action lambda:InvokeFunction \
  --principal apigateway.amazonaws.com \
  --source-arn "arn:aws:execute-api:$REGION:$ACCOUNT_ID:$API_ID/*" \
  --region "$REGION" > /dev/null 2>/dev/null || true

API_URL="https://${API_ID}.execute-api.${REGION}.amazonaws.com/newsletter"

echo ""
echo "============================================================"
echo "  DEPLOY COMPLETE"
echo "============================================================"
echo "  API endpoint: $API_URL"
echo ""
echo "  Next steps:"
echo "  1. Verify your SES sender in the AWS console:"
echo "     https://console.aws.amazon.com/ses/home?region=$REGION#/verified-identities"
echo "     → Verify: $FROM_EMAIL"
echo ""
echo "  2. Paste this URL into blog.html (NEWSLETTER_API_URL):"
echo "     $API_URL"
echo ""
echo "  3. If SES is in sandbox mode, also verify the subscriber"
echo "     email or request production access in SES console."
echo "============================================================"
