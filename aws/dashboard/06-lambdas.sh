#!/usr/bin/env bash
# Section 6 / 13 steps 7-10 — build and deploy the three functions with Function URLs.
# No VPC config, no provisioned concurrency, no API Gateway (section 12).

source "$(cd "$(dirname "$0")" && pwd)/_lib.sh"

printf '\n=== [6] Lambdas ===\n'
require_aws

: "${POOL_ID:?run 02-cognito.sh first — POOL_ID missing from .state.env}"
: "${APP_CLIENT_ID:?run 02-cognito.sh first — APP_CLIENT_ID missing from .state.env}"

BUILD_DIR="$DASH_DIR/build"
SRC_DIR="$DASH_DIR/lambda"
ENV_VARS="Variables={USER_POOL_ID=$POOL_ID,APP_CLIENT_ID=$APP_CLIENT_ID,TABLE_NAME=$TABLE_NAME,BUCKET_NAME=$BUCKET_NAME,ALLOWED_ORIGIN=$ALLOWED_ORIGIN}"

FN_CORS="$(cat <<EOF
{"AllowOrigins":["$ALLOWED_ORIGIN","$ALLOWED_ORIGIN_WWW"],
 "AllowMethods":["POST"],
 "AllowHeaders":["content-type","authorization"],
 "MaxAge":3000}
EOF
)"

to_native_path() {
  if command -v cygpath > /dev/null 2>&1; then cygpath -w "$1"; else printf '%s' "$1"; fi
}

make_zip() {
  local src_dir="$1" out="$2"
  rm -f "$out"
  if command -v zip > /dev/null 2>&1; then
    ( cd "$src_dir" && zip -qr "$out" . )
  elif command -v powershell.exe > /dev/null 2>&1; then
    powershell.exe -NoProfile -Command \
      "Compress-Archive -Path '$(to_native_path "$src_dir")\\*' -DestinationPath '$(to_native_path "$out")' -Force" \
      > /dev/null
  else
    die "Neither 'zip' nor PowerShell available to package the Lambda."
  fi
}

build_fn() {
  local src="$1" stage="$BUILD_DIR/$1"

  rm -rf "$stage"
  mkdir -p "$stage"
  cp "$SRC_DIR/$src/index.mjs" "$SRC_DIR/$src/package.json" "$stage/"
  cp "$SRC_DIR/_shared/common.mjs" "$stage/"

  ( cd "$stage" && npm install --omit=dev --no-audit --no-fund --silent )
  make_zip "$stage" "$BUILD_DIR/$src.zip"
  log "packaged $(du -h "$BUILD_DIR/$src.zip" 2>/dev/null | cut -f1 || echo '?') -> build/$src.zip"
}

deploy_fn() {
  local name="$1" src="$2" role_name="$3" timeout="$4" state_key="$5"
  local role_arn
  role_arn="$(aws iam get-role --role-name "$role_name" --query 'Role.Arn' --output text)"

  if aws lambda get-function --region "$AWS_REGION" --function-name "$name" > /dev/null 2>&1; then
    handle_existing "Lambda $name" "already deployed"
    aws lambda update-function-code --region "$AWS_REGION" --function-name "$name" \
      --zip-file "fileb://$(aws_path "$BUILD_DIR/$src.zip")" > /dev/null
    aws lambda wait function-updated --region "$AWS_REGION" --function-name "$name"
    aws lambda update-function-configuration --region "$AWS_REGION" --function-name "$name" \
      --timeout "$timeout" --memory-size 256 --environment "$ENV_VARS" > /dev/null
    ok "$name updated"
  else
    aws lambda create-function \
      --region "$AWS_REGION" \
      --function-name "$name" \
      --runtime nodejs20.x \
      --handler index.handler \
      --role "$role_arn" \
      --zip-file "fileb://$(aws_path "$BUILD_DIR/$src.zip")" \
      --timeout "$timeout" \
      --memory-size 256 \
      --environment "$ENV_VARS" \
      --tags Project=PolicyRaj,Component=dashboard > /dev/null
    ok "$name created (256 MB, ${timeout}s, no VPC)"
  fi

  aws lambda wait function-active-v2 --region "$AWS_REGION" --function-name "$name"

  local url
  url="$(aws lambda get-function-url-config --region "$AWS_REGION" --function-name "$name" \
    --query FunctionUrl --output text 2>/dev/null || true)"

  if [ -z "$url" ] || [ "$url" = "None" ]; then
    url="$(aws lambda create-function-url-config \
      --region "$AWS_REGION" \
      --function-name "$name" \
      --auth-type NONE \
      --cors "$FN_CORS" \
      --query FunctionUrl --output text)"

    # AuthType NONE still needs an explicit resource policy to be reachable.
    aws lambda add-permission \
      --region "$AWS_REGION" \
      --function-name "$name" \
      --statement-id FunctionURLAllowPublicAccess \
      --action lambda:InvokeFunctionUrl \
      --principal "*" \
      --function-url-auth-type NONE > /dev/null
    ok "function URL created"
  else
    aws lambda update-function-url-config --region "$AWS_REGION" --function-name "$name" \
      --auth-type NONE --cors "$FN_CORS" > /dev/null
    ok "function URL config refreshed"
  fi

  printf '    %s\n' "$url"
  save_state "$state_key" "$url"
}

mkdir -p "$BUILD_DIR"

step 1/6 "Building read";  build_fn "read"
step 2/6 "Building save";  build_fn "save"
step 3/6 "Building admin"; build_fn "admin"

step 4/6 "Deploying $READ_FN";  deploy_fn "$READ_FN"  "read"  "$READ_ROLE"  10 READ_URL
step 5/6 "Deploying $SAVE_FN";  deploy_fn "$SAVE_FN"  "save"  "$SAVE_ROLE"  10 SAVE_URL
step 6/6 "Deploying $ADMIN_FN"; deploy_fn "$ADMIN_FN" "admin" "$ADMIN_ROLE" 30 ADMIN_URL

# shellcheck disable=SC1090
source "$STATE_FILE"

cat <<EOF

=== Lambdas ready ===

Paste these into website/dashboard/config.js:

  userPoolId:  '$POOL_ID'
  clientId:    '$APP_CLIENT_ID'
  hostedUi:    '${HOSTED_UI_DOMAIN:-}'
  readUrl:     '${READ_URL:-}'
  saveUrl:     '${SAVE_URL:-}'
  adminUrl:    '${ADMIN_URL:-}'

Next: create the three test users from section 15, then run test/section15.sh.

EOF
