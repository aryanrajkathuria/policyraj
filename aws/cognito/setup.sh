#!/usr/bin/env bash
# PolicyRaj — Cognito User Pool Setup
# Run once from your AWS CLI machine (Mumbai region)
# After running: paste the output IDs into website/js/auth.js

set -e

REGION="ap-south-1"
POOL_NAME="policyraj-users"
CLIENT_NAME="policyraj-web"
DOMAIN_PREFIX="policyraj-auth"   # becomes policyraj-auth.auth.ap-south-1.amazoncognito.com

echo ""
echo "=== PolicyRaj Cognito Setup ==="
echo "Region: $REGION"
echo ""

# ── 1. Create User Pool ──────────────────────────────────────────────────────
echo "[1/5] Creating User Pool..."
POOL_ID=$(aws cognito-idp create-user-pool \
  --region "$REGION" \
  --pool-name "$POOL_NAME" \
  --auto-verified-attributes email \
  --username-attributes email \
  --verification-message-template '{
    "DefaultEmailOption": "CONFIRM_WITH_CODE",
    "EmailMessage": "Your PolicyRaj verification code is {####}. Valid for 10 minutes.",
    "EmailSubject": "Verify your PolicyRaj account"
  }' \
  --password-policy '{
    "MinimumLength": 8,
    "RequireUppercase": true,
    "RequireLowercase": true,
    "RequireNumbers": true,
    "RequireSymbols": false
  }' \
  --schema '[
    {"Name":"name","AttributeDataType":"String","Mutable":true,"Required":true},
    {"Name":"phone_number","AttributeDataType":"String","Mutable":true,"Required":false}
  ]' \
  --email-configuration '{
    "EmailSendingAccount": "COGNITO_DEFAULT"
  }' \
  --user-pool-tags '{"Project":"PolicyRaj"}' \
  --query 'UserPool.Id' \
  --output text)

echo "    User Pool ID: $POOL_ID"

# ── 2. Create App Client ─────────────────────────────────────────────────────
echo "[2/5] Creating App Client..."
CLIENT_ID=$(aws cognito-idp create-user-pool-client \
  --region "$REGION" \
  --user-pool-id "$POOL_ID" \
  --client-name "$CLIENT_NAME" \
  --no-generate-secret \
  --explicit-auth-flows \
    ALLOW_USER_PASSWORD_AUTH \
    ALLOW_USER_SRP_AUTH \
    ALLOW_CUSTOM_AUTH \
    ALLOW_REFRESH_TOKEN_AUTH \
  --supported-identity-providers COGNITO \
  --callback-urls \
    "https://policyraj.in/dashboard.html" \
    "http://localhost:5500/dashboard.html" \
  --logout-urls \
    "https://policyraj.in/login.html" \
    "http://localhost:5500/login.html" \
  --allowed-o-auth-flows code \
  --allowed-o-auth-scopes openid email profile \
  --allowed-o-auth-flows-user-pool-client \
  --query 'UserPoolClient.ClientId' \
  --output text)

echo "    Client ID: $CLIENT_ID"

# ── 3. Set Custom Domain ─────────────────────────────────────────────────────
echo "[3/5] Setting Cognito domain..."
aws cognito-idp create-user-pool-domain \
  --region "$REGION" \
  --user-pool-id "$POOL_ID" \
  --domain "$DOMAIN_PREFIX" \
  > /dev/null
echo "    Domain: https://${DOMAIN_PREFIX}.auth.${REGION}.amazoncognito.com"

# ── 4. Create DynamoDB users table ──────────────────────────────────────────
echo "[4/5] Creating DynamoDB table (policyraj-users)..."
aws dynamodb create-table \
  --region "$REGION" \
  --table-name "policyraj-users" \
  --attribute-definitions AttributeName=userId,AttributeType=S \
  --key-schema AttributeName=userId,KeyType=HASH \
  --billing-mode PAY_PER_REQUEST \
  --tags Key=Project,Value=PolicyRaj \
  > /dev/null
echo "    Table: policyraj-users (on-demand)"

# ── 5. Create Post-Confirmation Lambda trigger ───────────────────────────────
echo "[5/5] Creating post-confirmation Lambda trigger..."

LAMBDA_ROLE_ARN=$(aws iam get-role --role-name policyraj-newsletter-role --query 'Role.Arn' --output text 2>/dev/null || true)

if [ -z "$LAMBDA_ROLE_ARN" ]; then
  echo "    Creating IAM role policyraj-cognito-role..."
  cat > /tmp/trust.json <<'EOF'
{
  "Version": "2012-10-17",
  "Statement": [{
    "Effect": "Allow",
    "Principal": {"Service": ["lambda.amazonaws.com"]},
    "Action": "sts:AssumeRole"
  }]
}
EOF
  LAMBDA_ROLE_ARN=$(aws iam create-role \
    --role-name "policyraj-cognito-role" \
    --assume-role-policy-document file:///tmp/trust.json \
    --query 'Role.Arn' --output text)

  aws iam attach-role-policy \
    --role-name "policyraj-cognito-role" \
    --policy-arn "arn:aws:iam::aws:policy/service-role/AWSLambdaBasicExecutionRole"

  aws iam attach-role-policy \
    --role-name "policyraj-cognito-role" \
    --policy-arn "arn:aws:iam::aws:policy/AmazonDynamoDBFullAccess"

  sleep 8  # IAM propagation
fi

# Inline trigger Lambda
mkdir -p /tmp/post-confirm
cat > /tmp/post-confirm/index.mjs <<'EOF'
import { DynamoDBClient, PutItemCommand } from '@aws-sdk/client-dynamodb';
const db = new DynamoDBClient({ region: process.env.AWS_REGION });

export const handler = async (event) => {
  const { sub, email, name } = event.request.userAttributes;
  await db.send(new PutItemCommand({
    TableName: 'policyraj-users',
    Item: {
      userId:    { S: sub },
      email:     { S: email },
      name:      { S: name || '' },
      createdAt: { S: new Date().toISOString() },
      policies:  { L: [] },
    },
    ConditionExpression: 'attribute_not_exists(userId)',
  })).catch(() => {});
  return event;
};
EOF

cd /tmp/post-confirm && zip -q post-confirm.zip index.mjs && cd -

TRIGGER_ARN=$(aws lambda create-function \
  --region "$REGION" \
  --function-name "policyraj-post-confirm" \
  --runtime "nodejs20.x" \
  --handler "index.handler" \
  --role "$LAMBDA_ROLE_ARN" \
  --zip-file fileb:///tmp/post-confirm/post-confirm.zip \
  --query 'FunctionArn' \
  --output text)

aws lambda add-permission \
  --function-name "policyraj-post-confirm" \
  --statement-id "CognitoTrigger" \
  --action "lambda:InvokeFunction" \
  --principal "cognito-idp.amazonaws.com" \
  --source-arn "arn:aws:cognito-idp:${REGION}:$(aws sts get-caller-identity --query Account --output text):userpool/${POOL_ID}" \
  > /dev/null

aws cognito-idp update-user-pool \
  --region "$REGION" \
  --user-pool-id "$POOL_ID" \
  --lambda-config "PostConfirmation=$TRIGGER_ARN"

echo ""
echo "=========================================="
echo "  SETUP COMPLETE — Copy these values:"
echo "=========================================="
echo ""
echo "  userPoolId: '$POOL_ID'"
echo "  clientId:   '$CLIENT_ID'"
echo "  domain:     '${DOMAIN_PREFIX}.auth.${REGION}.amazoncognito.com'"
echo ""
echo "  Paste these into: website/js/auth.js (COGNITO object)"
echo ""
echo "  Optional next step: Add Google OAuth provider"
echo "  Run: bash add-google-provider.sh"
echo ""
