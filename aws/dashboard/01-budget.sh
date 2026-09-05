#!/usr/bin/env bash
# Section 12/13 step 1 — cost guardrail. Run this FIRST, before any resource exists.
# Creates a NEW budget only. Touches no existing budget, no SNS topic (email subscribers
# are delivered by AWS Budgets directly, so this never goes near the SES/SNS setup).

source "$(cd "$(dirname "$0")" && pwd)/_lib.sh"

printf '\n=== [1] AWS Budget alert ===\n'
require_aws

EXISTING="$(aws budgets describe-budget \
  --account-id "$ACCOUNT_ID" \
  --budget-name "$BUDGET_NAME" \
  --region us-east-1 \
  --query 'Budget.BudgetName' --output text 2>/dev/null || true)"

if [ -n "$EXISTING" ] && [ "$EXISTING" != "None" ]; then
  handle_existing "Budget $BUDGET_NAME" "found in account $ACCOUNT_ID"
  printf '\n=== budget already present, nothing to do ===\n\n'
  exit 0
fi

TMP="$(mktemp -d)"
trap 'rm -rf "$TMP"' EXIT

cat > "$TMP/budget.json" <<EOF
{
  "BudgetName": "$BUDGET_NAME",
  "BudgetLimit": { "Amount": "$BUDGET_AMOUNT", "Unit": "$BUDGET_CURRENCY" },
  "TimeUnit": "MONTHLY",
  "BudgetType": "COST"
}
EOF

cat > "$TMP/notifications.json" <<EOF
[
  {
    "Notification": {
      "NotificationType": "ACTUAL",
      "ComparisonOperator": "GREATER_THAN",
      "Threshold": 80,
      "ThresholdType": "PERCENTAGE"
    },
    "Subscribers": [ { "SubscriptionType": "EMAIL", "Address": "$BUDGET_EMAIL" } ]
  },
  {
    "Notification": {
      "NotificationType": "FORECASTED",
      "ComparisonOperator": "GREATER_THAN",
      "Threshold": 100,
      "ThresholdType": "PERCENTAGE"
    },
    "Subscribers": [ { "SubscriptionType": "EMAIL", "Address": "$BUDGET_EMAIL" } ]
  }
]
EOF

aws budgets create-budget \
  --account-id "$ACCOUNT_ID" \
  --budget "file://$(aws_path "$TMP/budget.json")" \
  --notifications-with-subscribers "file://$(aws_path "$TMP/notifications.json")" \
  --region us-east-1

ok "budget $BUDGET_NAME created at $BUDGET_AMOUNT $BUDGET_CURRENCY/month"
log "alerts to $BUDGET_EMAIL at 80% actual and 100% forecast"
save_state BUDGET_CREATED "yes"

printf '\nThis is an account-wide cost budget, so it measures all spend in the\n'
printf 'account, not just the dashboard. Existing spend counts against it.\n\n'
