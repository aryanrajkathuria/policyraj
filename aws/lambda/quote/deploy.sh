#!/usr/bin/env bash
# PolicyRaj — Quote Lambda Deploy
# Run once. Needs AWS CLI configured + SES email verified.
#
# Before running:
#   1. Verify sachin@policyraj.com in SES:
#      aws ses verify-email-identity --email-address sachin@policyraj.com --region ap-south-1
#   2. Sign up at twilio.com, get Account SID + Auth Token
#   3. Join WhatsApp sandbox: https://console.twilio.com/us1/develop/sms/try-it-out/whatsapp-learn
#   4. Fill in the TWILIO_* values below

set -e

REGION="ap-south-1"
FUNCTION_NAME="policyraj-quote"
TABLE_NAME="policyraj-leads"

# ── Fill these in ─────────────────────────────────────────────────────────────
TWILIO_SID="PASTE_YOUR_TWILIO_ACCOUNT_SID"
TWILIO_TOKEN="PASTE_YOUR_TWILIO_AUTH_TOKEN"
TWILIO_WA_FROM="whatsapp:+14155238886"   # Twilio sandbox number (change for production)
TWILIO_WA_TO="whatsapp:+919013976999"
FROM_EMAIL="sachin@policyraj.com"
ALLOWED_ORIGIN="https://policyraj.in"
# ─────────────────────────────────────────────────────────────────────────────

echo ""
echo "=== PolicyRaj Quote Lambda Deploy ==="
echo "Region: $REGION"
echo ""

# 1. DynamoDB table
echo "[1/5] Creating DynamoDB table..."
aws dynamodb create-table \
  --region "$REGION" \
  --table-name "$TABLE_NAME" \
  --attribute-definitions AttributeName=leadId,AttributeType=S \
  --key-schema AttributeName=leadId,KeyType=HASH \
  --billing-mode PAY_PER_REQUEST \
  --tags Key=Project,Value=PolicyRaj 2>/dev/null \
  && echo "    Created: $TABLE_NAME" \
  || echo "    Already exists: $TABLE_NAME"

# 2. IAM role
echo "[2/5] Creating IAM role..."
ACCOUNT_ID=$(aws sts get-caller-identity --query Account --output text)
ROLE_NAME="policyraj-quote-role"

ROLE_ARN=$(aws iam get-role --role-name "$ROLE_NAME" --query 'Role.Arn' --output text 2>/dev/null || true)

if [ -z "$ROLE_ARN" ]; then
  cat > /tmp/trust.json <<'EOF'
{
  "Version": "2012-10-17",
  "Statement": [{"Effect":"Allow","Principal":{"Service":"lambda.amazonaws.com"},"Action":"sts:AssumeRole"}]
}
EOF
  ROLE_ARN=$(aws iam create-role \
    --role-name "$ROLE_NAME" \
    --assume-role-policy-document file:///tmp/trust.json \
    --query 'Role.Arn' --output text)

  aws iam attach-role-policy --role-name "$ROLE_NAME" \
    --policy-arn "arn:aws:iam::aws:policy/service-role/AWSLambdaBasicExecutionRole"
  aws iam attach-role-policy --role-name "$ROLE_NAME" \
    --policy-arn "arn:aws:iam::aws:policy/AmazonDynamoDBFullAccess"
  aws iam attach-role-policy --role-name "$ROLE_NAME" \
    --policy-arn "arn:aws:iam::aws:policy/AmazonSESFullAccess"

  echo "    Role created: $ROLE_ARN"
  sleep 10
else
  echo "    Role exists: $ROLE_ARN"
fi

# 3. Package Lambda
echo "[3/5] Packaging Lambda..."
cd "$(dirname "$0")"
zip -q quote.zip index.mjs
echo "    Packaged: quote.zip"

# 4. Deploy Lambda
echo "[4/5] Deploying Lambda function..."
LAMBDA_ARN=$(aws lambda get-function --function-name "$FUNCTION_NAME" --region "$REGION" \
  --query 'Configuration.FunctionArn' --output text 2>/dev/null || true)

ENV_VARS="Variables={DYNAMO_TABLE=$TABLE_NAME,FROM_EMAIL=$FROM_EMAIL,NOTIFY_EMAIL=$FROM_EMAIL,TWILIO_SID=$TWILIO_SID,TWILIO_TOKEN=$TWILIO_TOKEN,TWILIO_WA_FROM=$TWILIO_WA_FROM,TWILIO_WA_TO=$TWILIO_WA_TO,ALLOWED_ORIGIN=$ALLOWED_ORIGIN}"

if [ -z "$LAMBDA_ARN" ]; then
  LAMBDA_ARN=$(aws lambda create-function \
    --region "$REGION" \
    --function-name "$FUNCTION_NAME" \
    --runtime "nodejs20.x" \
    --handler "index.handler" \
    --role "$ROLE_ARN" \
    --zip-file fileb://quote.zip \
    --timeout 15 \
    --environment "$ENV_VARS" \
    --query 'FunctionArn' --output text)
  echo "    Created: $LAMBDA_ARN"
else
  aws lambda update-function-code \
    --region "$REGION" \
    --function-name "$FUNCTION_NAME" \
    --zip-file fileb://quote.zip > /dev/null
  sleep 3
  aws lambda update-function-configuration \
    --region "$REGION" \
    --function-name "$FUNCTION_NAME" \
    --environment "$ENV_VARS" > /dev/null
  echo "    Updated: $LAMBDA_ARN"
fi

# 5. HTTP API Gateway
echo "[5/5] Setting up API Gateway..."
API_ID=$(aws apigatewayv2 get-apis --region "$REGION" \
  --query "Items[?Name=='policyraj-quote-api'].ApiId" --output text 2>/dev/null)

if [ -z "$API_ID" ]; then
  API_ID=$(aws apigatewayv2 create-api \
    --region "$REGION" \
    --name "policyraj-quote-api" \
    --protocol-type HTTP \
    --cors-configuration "AllowOrigins=$ALLOWED_ORIGIN,AllowMethods=POST OPTIONS,AllowHeaders=Content-Type" \
    --query 'ApiId' --output text)

  # Lambda integration
  INTEGRATION_ID=$(aws apigatewayv2 create-integration \
    --region "$REGION" \
    --api-id "$API_ID" \
    --integration-type AWS_PROXY \
    --integration-uri "arn:aws:apigateway:${REGION}:lambda:path/2015-03-31/functions/${LAMBDA_ARN}/invocations" \
    --payload-format-version "2.0" \
    --query 'IntegrationId' --output text)

  aws apigatewayv2 create-route \
    --region "$REGION" \
    --api-id "$API_ID" \
    --route-key "POST /quote" \
    --target "integrations/$INTEGRATION_ID" > /dev/null

  aws apigatewayv2 create-stage \
    --region "$REGION" \
    --api-id "$API_ID" \
    --stage-name "prod" \
    --auto-deploy > /dev/null

  aws lambda add-permission \
    --function-name "$FUNCTION_NAME" \
    --statement-id "APIGWInvoke" \
    --action "lambda:InvokeFunction" \
    --principal "apigateway.amazonaws.com" \
    --source-arn "arn:aws:execute-api:${REGION}:${ACCOUNT_ID}:${API_ID}/*/*/quote" > /dev/null

  echo "    Created API: $API_ID"
else
  echo "    Existing API: $API_ID"
fi

API_URL="https://${API_ID}.execute-api.${REGION}.amazonaws.com/prod/quote"

echo ""
echo "============================================"
echo "  DEPLOY COMPLETE"
echo "============================================"
echo ""
echo "  API URL: $API_URL"
echo ""
echo "  Paste this URL into: website/js/quote-api.js"
echo "    const QUOTE_API_URL = '$API_URL';"
echo ""
echo "  Also make sure to:"
echo "  1. Verify SES email: aws ses verify-email-identity \\"
echo "       --email-address sachin@policyraj.com --region ap-south-1"
echo "  2. Fill TWILIO_SID and TWILIO_TOKEN above (then re-run)"
echo ""
