#!/usr/bin/env bash
# PolicyRaj — Add Google OAuth to Cognito
# Run AFTER setup.sh
# Prerequisites: Create OAuth credentials at console.cloud.google.com

set -e

REGION="ap-south-1"

# ── You must provide these from Google Cloud Console ─────────────────────────
read -rp "Enter Google Client ID:     " GOOGLE_CLIENT_ID
read -rp "Enter Google Client Secret: " GOOGLE_CLIENT_SECRET
read -rp "Enter your Cognito User Pool ID (from setup.sh output): " POOL_ID
read -rp "Enter your Cognito App Client ID (from setup.sh output): " CLIENT_ID

DOMAIN_PREFIX="policyraj-auth"

echo ""
echo "[1/2] Adding Google as Identity Provider..."
aws cognito-idp create-identity-provider \
  --region "$REGION" \
  --user-pool-id "$POOL_ID" \
  --provider-name "Google" \
  --provider-type "Google" \
  --provider-details "{
    \"client_id\": \"$GOOGLE_CLIENT_ID\",
    \"client_secret\": \"$GOOGLE_CLIENT_SECRET\",
    \"authorize_scopes\": \"profile email openid\"
  }" \
  --attribute-mapping '{
    "email": "email",
    "name": "name",
    "username": "sub"
  }'

echo "[2/2] Enabling Google provider on App Client..."
aws cognito-idp update-user-pool-client \
  --region "$REGION" \
  --user-pool-id "$POOL_ID" \
  --client-id "$CLIENT_ID" \
  --supported-identity-providers COGNITO Google \
  --callback-urls \
    "https://policyraj.in/dashboard.html" \
    "http://localhost:5500/dashboard.html" \
  --logout-urls \
    "https://policyraj.in/login.html" \
    "http://localhost:5500/login.html" \
  --allowed-o-auth-flows code \
  --allowed-o-auth-scopes openid email profile \
  --allowed-o-auth-flows-user-pool-client \
  > /dev/null

echo ""
echo "Google OAuth added successfully!"
echo ""
echo "Add this Authorized redirect URI to your Google Cloud project:"
echo "  https://${DOMAIN_PREFIX}.auth.${REGION}.amazoncognito.com/oauth2/idpresponse"
echo ""
