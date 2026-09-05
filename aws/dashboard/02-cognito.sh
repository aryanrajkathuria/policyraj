#!/usr/bin/env bash
# Section 3 / 13 step 2-3 — Cognito user pool, app client, Hosted UI domain, admin group.
#
# READ THIS FIRST. aws/cognito/setup.sh in this repo also creates a pool named
# "policyraj-users". If that script was ever run, a pool of this name already exists
# and this script will STOP rather than touch it. It is a different pool, wired to
# policyraj.in, with its own post-confirmation trigger. Decide which pool the
# dashboard should use before overriding.
#
# This script never adds a DNS record and never adds a user to the admin group.

source "$(cd "$(dirname "$0")" && pwd)/_lib.sh"

printf '\n=== [2] Cognito ===\n'
require_aws

step 1/6 "Checking for an existing pool named $POOL_NAME"
FOUND="$(aws cognito-idp list-user-pools --max-results 60 --region "$AWS_REGION" \
  --query "UserPools[?Name=='${POOL_NAME}'].Id" --output text)"

if [ -n "$FOUND" ] && [ "$FOUND" != "None" ]; then
  handle_existing "Cognito user pool $POOL_NAME" "id $FOUND"
  POOL_ID="$FOUND"
else
  step 2/6 "Creating user pool"
  TMP="$(mktemp -d)"
  trap 'rm -rf "$TMP"' EXIT

  # Only email is Required, per section 3. Required flags are fixed for the life
  # of the pool — changing one later means recreating the pool and every user.
  cat > "$TMP/schema.json" <<'EOF'
[
  {"Name":"email","AttributeDataType":"String","Mutable":true,"Required":true},
  {"Name":"name","AttributeDataType":"String","Mutable":true,"Required":false},
  {"Name":"phone_number","AttributeDataType":"String","Mutable":true,"Required":false},
  {"Name":"pan","AttributeDataType":"String","Mutable":true,"Required":false,
   "StringAttributeConstraints":{"MinLength":"0","MaxLength":"20"}}
]
EOF

  cat > "$TMP/policies.json" <<'EOF'
{
  "PasswordPolicy": {
    "MinimumLength": 8,
    "RequireUppercase": true,
    "RequireNumbers": true,
    "RequireLowercase": false,
    "RequireSymbols": false
  }
}
EOF

  POOL_ID="$(aws cognito-idp create-user-pool \
    --region "$AWS_REGION" \
    --pool-name "$POOL_NAME" \
    --username-attributes email \
    --auto-verified-attributes email \
    --policies "file://$(aws_path "$TMP/policies.json")" \
    --schema "file://$(aws_path "$TMP/schema.json")" \
    --email-configuration EmailSendingAccount=COGNITO_DEFAULT \
    --user-pool-tags Project=PolicyRaj,Component=dashboard \
    --user-pool-tier LITE \
    --query 'UserPool.Id' --output text)"
  ok "user pool $POOL_ID"
fi

save_state POOL_ID "$POOL_ID"

step 3/6 "MFA: TOTP optional, SMS off"
aws cognito-idp set-user-pool-mfa-config \
  --region "$AWS_REGION" \
  --user-pool-id "$POOL_ID" \
  --mfa-configuration OPTIONAL \
  --software-token-mfa-configuration Enabled=true > /dev/null
ok "TOTP enabled, optional pool-wide"

step 4/6 "App client $APP_CLIENT_NAME"
CLIENT_ID="$(aws cognito-idp list-user-pool-clients --region "$AWS_REGION" \
  --user-pool-id "$POOL_ID" --max-results 60 \
  --query "UserPoolClients[?ClientName=='${APP_CLIENT_NAME}'].ClientId" --output text)"

if [ -n "$CLIENT_ID" ] && [ "$CLIENT_ID" != "None" ]; then
  handle_existing "App client $APP_CLIENT_NAME" "id $CLIENT_ID"
else
  # Public client, no secret -> Cognito requires PKCE on the authorization code flow.
  # Both apex and www callbacks are registered: the live site serves www, and a
  # callback mismatch is a hard sign-in failure.
  CLIENT_ID="$(aws cognito-idp create-user-pool-client \
    --region "$AWS_REGION" \
    --user-pool-id "$POOL_ID" \
    --client-name "$APP_CLIENT_NAME" \
    --no-generate-secret \
    --explicit-auth-flows ALLOW_REFRESH_TOKEN_AUTH \
    --supported-identity-providers COGNITO \
    --callback-urls "${ALLOWED_ORIGIN}/dashboard" "${ALLOWED_ORIGIN_WWW}/dashboard" \
    --logout-urls "${ALLOWED_ORIGIN}/" "${ALLOWED_ORIGIN_WWW}/" \
    --allowed-o-auth-flows code \
    --allowed-o-auth-scopes openid email profile \
    --allowed-o-auth-flows-user-pool-client \
    --id-token-validity 60 \
    --access-token-validity 60 \
    --refresh-token-validity 30 \
    --token-validity-units IdToken=minutes,AccessToken=minutes,RefreshToken=days \
    --query 'UserPoolClient.ClientId' --output text)"
  ok "app client $CLIENT_ID"
fi

save_state APP_CLIENT_ID "$CLIENT_ID"

step 5/6 "Hosted UI domain"
DOMAIN_TAKEN="$(aws cognito-idp describe-user-pool-domain --region "$AWS_REGION" \
  --domain "$HOSTED_UI_PREFIX" --query 'DomainDescription.UserPoolId' --output text 2>/dev/null || true)"

if [ -n "$DOMAIN_TAKEN" ] && [ "$DOMAIN_TAKEN" != "None" ]; then
  if [ "$DOMAIN_TAKEN" = "$POOL_ID" ]; then
    ok "domain already belongs to this pool"
  else
    die "Hosted UI prefix '$HOSTED_UI_PREFIX' is taken by pool $DOMAIN_TAKEN.
  Change HOSTED_UI_PREFIX in config.env and re-run."
  fi
else
  aws cognito-idp create-user-pool-domain \
    --region "$AWS_REGION" \
    --user-pool-id "$POOL_ID" \
    --domain "$HOSTED_UI_PREFIX" > /dev/null
  ok "https://${HOSTED_UI_PREFIX}.auth.${AWS_REGION}.amazoncognito.com"
fi
save_state HOSTED_UI_DOMAIN "https://${HOSTED_UI_PREFIX}.auth.${AWS_REGION}.amazoncognito.com"

step 6/6 "Admin group (empty — membership is a console action)"
if aws cognito-idp get-group --region "$AWS_REGION" --user-pool-id "$POOL_ID" \
     --group-name "$ADMIN_GROUP" > /dev/null 2>&1; then
  ok "group $ADMIN_GROUP already exists"
else
  aws cognito-idp create-group \
    --region "$AWS_REGION" \
    --user-pool-id "$POOL_ID" \
    --group-name "$ADMIN_GROUP" \
    --description "PolicyRaj owner — read-only visibility across all customers" \
    --precedence 0 > /dev/null
  ok "group $ADMIN_GROUP created, no members"
fi

cat <<EOF

=== Cognito ready ===

  USER_POOL_ID   $POOL_ID
  APP_CLIENT_ID  $CLIENT_ID
  Hosted UI      https://${HOSTED_UI_PREFIX}.auth.${AWS_REGION}.amazoncognito.com

Manual steps this script deliberately does NOT perform:

  1. Add the owner to the "$ADMIN_GROUP" group in the Cognito console.
     Self-signup can never place a user in a group, which is what keeps
     admin off the table for customers.

  2. Enforce TOTP MFA on that owner account (console: Users -> owner -> MFA).

  3. DNS for the optional custom Hosted UI domain auth.policyraj.com.
     PROPOSED, NOT APPLIED — requires your approval:
       - an ACM certificate for auth.policyraj.com in us-east-1
       - one new A/ALIAS record: auth.policyraj.com -> the CloudFront target
         that "aws cognito-idp create-user-pool-domain --custom-domain" returns
     This adds exactly one record. It touches no MX, TXT, DKIM or DMARC record.
     Until you approve it, the amazoncognito.com domain above works fine.

EOF
