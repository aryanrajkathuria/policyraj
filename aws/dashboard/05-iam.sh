#!/usr/bin/env bash
# Section 9 / 13 step 6 — one execution role per Lambda, least privilege, no wildcards.
# The admin role gets Scan/Query/GetItem and s3:GetObject and nothing else. The
# absence of write permissions there is a guarantee, not a convention.

source "$(cd "$(dirname "$0")" && pwd)/_lib.sh"

printf '\n=== [5] IAM roles ===\n'
require_aws

BASIC_EXEC="arn:aws:iam::aws:policy/service-role/AWSLambdaBasicExecutionRole"
TMP="$(mktemp -d)"
trap 'rm -rf "$TMP"' EXIT

create_role() {
  local role_name="$1" policy_file="$2" label="$3"

  if aws iam get-role --role-name "$role_name" > /dev/null 2>&1; then
    handle_existing "IAM role $role_name" "already exists"
  else
    aws iam create-role \
      --role-name "$role_name" \
      --assume-role-policy-document "file://$(aws_path "$DASH_DIR/iam/trust-policy.json")" \
      --description "PolicyRaj dashboard - $label" \
      --tags Key=Project,Value=PolicyRaj Key=Component,Value=dashboard > /dev/null
    ok "role $role_name created"
  fi

  sed "s/__ACCOUNT_ID__/$ACCOUNT_ID/g" "$DASH_DIR/iam/$policy_file" > "$TMP/$policy_file"

  aws iam put-role-policy \
    --role-name "$role_name" \
    --policy-name "${role_name}-inline" \
    --policy-document "file://$(aws_path "$TMP/$policy_file")"
  ok "inline policy attached from iam/$policy_file"

  aws iam attach-role-policy --role-name "$role_name" --policy-arn "$BASIC_EXEC"
  ok "AWSLambdaBasicExecutionRole attached"

  save_state "$(printf '%s' "$label" | tr '[:lower:]' '[:upper:]')_ROLE_ARN" \
    "$(aws iam get-role --role-name "$role_name" --query 'Role.Arn' --output text)"
}

step 1/3 "Read role"
create_role "$READ_ROLE" "read-policy.json" "read"

step 2/3 "Save role"
create_role "$SAVE_ROLE" "save-policy.json" "save"

step 3/3 "Admin role (read-only)"
create_role "$ADMIN_ROLE" "admin-policy.json" "admin"

printf '\n    waiting 10s for IAM propagation before Lambda creation\n'
sleep 10

printf '\n=== IAM ready ===\n'
printf '    Admin role has no PutItem, no UpdateItem, no DeleteItem,\n'
printf '    no s3:PutObject and no s3:DeleteObject. Test BA10 depends on that.\n\n'
