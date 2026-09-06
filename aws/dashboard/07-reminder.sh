#!/usr/bin/env bash
# Renewal reminders — execution role, Lambda, and the daily EventBridge schedule.
#
# Creates NEW resources only. Nothing that already exists is modified: not the
# read/save/admin roles, not their functions, not the table, not the bucket, and
# not the SES identity. The function calls ses:SendEmail as sachin@policyraj.in
# at runtime; the policyraj.in domain identity, its MAIL FROM subdomain and its
# DKIM/SPF/DMARC records are never read or written by this script (section 0).
#
# No API Gateway, no VPC config, no provisioned concurrency, no new GSI —
# the schedule is the only trigger (section 12).
#
# Usage:  ./07-reminder.sh [role|lambda|schedule|all]
#         Each stage is idempotent and safe to re-run.

source "$(cd "$(dirname "$0")" && pwd)/_lib.sh"

STAGE="${1:-all}"
case "$STAGE" in
  role|lambda|schedule|all) ;;
  *) die "unknown stage '$STAGE' — use role, lambda, schedule or all" ;;
esac

printf '\n=== [7] Renewal reminders (stage: %s) ===\n' "$STAGE"
require_aws

BASIC_EXEC="arn:aws:iam::aws:policy/service-role/AWSLambdaBasicExecutionRole"
BUILD_DIR="$DASH_DIR/build"
SRC_DIR="$DASH_DIR/lambda"
TMP="$(mktemp -d)"
trap 'rm -rf "$TMP"' EXIT

FN_ARN="arn:aws:lambda:${AWS_REGION}:${ACCOUNT_ID}:function:${REMINDER_FN}"
RULE_ARN="arn:aws:events:${AWS_REGION}:${ACCOUNT_ID}:rule/${REMINDER_RULE}"

# ── role ────────────────────────────────────────────────────────────────────
do_role() {
  step 1/1 "Execution role $REMINDER_ROLE"

  if aws iam get-role --role-name "$REMINDER_ROLE" > /dev/null 2>&1; then
    handle_existing "IAM role $REMINDER_ROLE" "already exists"
  else
    aws iam create-role \
      --role-name "$REMINDER_ROLE" \
      --assume-role-policy-document "file://$(aws_path "$DASH_DIR/iam/trust-policy.json")" \
      --description "PolicyRaj dashboard - renewal reminders" \
      --tags Key=Project,Value=PolicyRaj Key=Component,Value=dashboard > /dev/null
    ok "role $REMINDER_ROLE created"
  fi

  sed "s/__ACCOUNT_ID__/$ACCOUNT_ID/g" "$DASH_DIR/iam/reminder-policy.json" > "$TMP/reminder-policy.json"

  aws iam put-role-policy \
    --role-name "$REMINDER_ROLE" \
    --policy-name "${REMINDER_ROLE}-inline" \
    --policy-document "file://$(aws_path "$TMP/reminder-policy.json")"
  ok "inline policy attached from iam/reminder-policy.json"

  aws iam attach-role-policy --role-name "$REMINDER_ROLE" --policy-arn "$BASIC_EXEC"
  ok "AWSLambdaBasicExecutionRole attached"

  save_state REMINDER_ROLE_ARN \
    "$(aws iam get-role --role-name "$REMINDER_ROLE" --query 'Role.Arn' --output text)"

  printf '\n    Scan + UpdateItem on the table, SendEmail as %s, nothing else.\n' "$REMINDER_FROM"
  printf '    No s3, no cognito, no GetItem, no wildcards.\n\n'
}

# ── lambda ──────────────────────────────────────────────────────────────────
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

do_lambda() {
  local stage="$BUILD_DIR/reminder"

  step 1/3 "Building reminder bundle"
  rm -rf "$stage"
  mkdir -p "$stage"
  # No common.mjs here: it builds a Cognito JWT verifier at module load, and a
  # scheduled function has no caller to authenticate.
  cp "$SRC_DIR/reminder/index.mjs" "$SRC_DIR/reminder/package.json" "$stage/"
  ( cd "$stage" && npm install --omit=dev --no-audit --no-fund --silent )
  make_zip "$stage" "$BUILD_DIR/reminder.zip"
  ok "packaged $(du -h "$BUILD_DIR/reminder.zip" 2>/dev/null | cut -f1 || echo '?') -> build/reminder.zip"

  step 2/3 "Deploying $REMINDER_FN"
  local role_arn
  role_arn="$(aws iam get-role --role-name "$REMINDER_ROLE" --query 'Role.Arn' --output text)"

  local env_vars
  env_vars="Variables={TABLE_NAME=$TABLE_NAME,REMINDER_FROM=$REMINDER_FROM,REMINDER_SENDER_NAME=$REMINDER_SENDER_NAME}"

  if aws lambda get-function --region "$AWS_REGION" --function-name "$REMINDER_FN" > /dev/null 2>&1; then
    handle_existing "Lambda $REMINDER_FN" "already deployed"
    aws lambda update-function-code --region "$AWS_REGION" --function-name "$REMINDER_FN" \
      --zip-file "fileb://$(aws_path "$BUILD_DIR/reminder.zip")" > /dev/null
    aws lambda wait function-updated --region "$AWS_REGION" --function-name "$REMINDER_FN"
    aws lambda update-function-configuration --region "$AWS_REGION" --function-name "$REMINDER_FN" \
      --timeout 120 --memory-size 256 --environment "$env_vars" > /dev/null
    ok "$REMINDER_FN updated"
  else
    aws lambda create-function \
      --region "$AWS_REGION" \
      --function-name "$REMINDER_FN" \
      --runtime nodejs22.x \
      --handler index.handler \
      --role "$role_arn" \
      --zip-file "fileb://$(aws_path "$BUILD_DIR/reminder.zip")" \
      --timeout 120 \
      --memory-size 256 \
      --environment "$env_vars" \
      --tags Project=PolicyRaj,Component=dashboard > /dev/null
    ok "$REMINDER_FN created (nodejs22.x, 256 MB, 120s, no VPC)"
  fi

  step 3/3 "Waiting for ACTIVE"
  aws lambda wait function-active-v2 --region "$AWS_REGION" --function-name "$REMINDER_FN"
  ok "active"

  # Deliberately no Function URL: the schedule is the only way in.
  printf '\n    No Function URL created. EventBridge is the only trigger.\n\n'
}

# ── schedule ────────────────────────────────────────────────────────────────
do_schedule() {
  step 1/3 "EventBridge rule $REMINDER_RULE"

  if aws events describe-rule --region "$AWS_REGION" --name "$REMINDER_RULE" > /dev/null 2>&1; then
    handle_existing "EventBridge rule $REMINDER_RULE" "already exists"
  fi

  aws events put-rule \
    --region "$AWS_REGION" \
    --name "$REMINDER_RULE" \
    --schedule-expression "$REMINDER_SCHEDULE" \
    --state ENABLED \
    --description "PolicyRaj dashboard - daily renewal reminder sweep" \
    --tags Key=Project,Value=PolicyRaj Key=Component,Value=dashboard > /dev/null
  ok "rule set to $REMINDER_SCHEDULE (09:00 IST)"

  step 2/3 "Allowing EventBridge to invoke the function"
  # Scoped to this one rule. Re-running is a no-op once the statement exists.
  if aws lambda add-permission \
    --region "$AWS_REGION" \
    --function-name "$REMINDER_FN" \
    --statement-id AllowInvokeFromReminderSchedule \
    --action lambda:InvokeFunction \
    --principal events.amazonaws.com \
    --source-arn "$RULE_ARN" > /dev/null 2>&1; then
    ok "invoke permission added"
  else
    ok "invoke permission already present"
  fi

  step 3/3 "Pointing the rule at the function"
  aws events put-targets \
    --region "$AWS_REGION" \
    --rule "$REMINDER_RULE" \
    --targets "Id=reminder,Arn=$FN_ARN" > /dev/null
  ok "target set"

  save_state REMINDER_RULE_ARN "$RULE_ARN"
  printf '\n'
}

case "$STAGE" in
  role)     do_role ;;
  lambda)   do_lambda ;;
  schedule) do_schedule ;;
  all)      do_role; do_lambda; do_schedule ;;
esac

printf '=== stage %s complete ===\n\n' "$STAGE"
