#!/usr/bin/env bash
# Section 0 — "before you start" snapshot. READ ONLY. Creates nothing, changes nothing.
# Run this BEFORE 01-budget.sh. Test E7/E8 diffs against its output.
#
# A capture the credentials cannot read is recorded as NOT_CAPTURED and listed at
# the end. It never silently succeeds — a gap here means the matching regression
# test cannot be run, and that has to be visible.

source "$(cd "$(dirname "$0")" && pwd)/_lib.sh"

SNAP_DIR="$DASH_DIR/snapshot/$(date +%Y%m%d-%H%M%S)"
MISSING=()

capture() {
  local label="$1" out="$2"
  shift 2
  if "$@" > "$SNAP_DIR/$out" 2> "$SNAP_DIR/$out.err"; then
    rm -f "$SNAP_DIR/$out.err"
    ok "$label"
  else
    local reason
    reason="$(tr '\n' ' ' < "$SNAP_DIR/$out.err" | sed 's/  */ /g' | cut -c1-160)"
    printf 'NOT_CAPTURED\n' > "$SNAP_DIR/$out"
    warn "$label NOT captured — $reason"
    MISSING+=("$label")
  fi
}

printf '\n=== PolicyRaj Dashboard — pre-build snapshot ===\n'
require_aws
mkdir -p "$SNAP_DIR"

step 1/6 "Lambda functions"
capture "lambda functions" lambda-functions.json \
  aws lambda list-functions --region "$AWS_REGION" \
    --query 'sort_by(Functions,&FunctionName)[].{Name:FunctionName,Runtime:Runtime,Modified:LastModified}' \
    --output json

step 2/6 "DynamoDB tables"
capture "dynamodb tables" dynamodb-tables.json \
  aws dynamodb list-tables --region "$AWS_REGION" --output json

step 3/6 "S3 buckets"
capture "s3 buckets" s3-buckets.json \
  aws s3api list-buckets --query 'sort_by(Buckets,&Name)[].Name' --output json

step 4/6 "Route 53 records (all hosted zones)"
if aws route53 list-hosted-zones --output json > "$SNAP_DIR/route53-zones.json" 2> "$SNAP_DIR/route53.err"; then
  rm -f "$SNAP_DIR/route53.err"
  for zone_id in $(aws route53 list-hosted-zones --query 'HostedZones[].Id' --output text); do
    short="${zone_id##*/}"
    if aws route53 list-resource-record-sets --hosted-zone-id "$short" --output json \
         > "$SNAP_DIR/route53-records-${short}.json" 2> /dev/null; then
      log "zone $short captured"
    else
      warn "zone $short records NOT captured"
      MISSING+=("route53 records for zone $short")
    fi
  done
  ok "captured"
else
  REASON="$(tr '\n' ' ' < "$SNAP_DIR/route53.err" | sed 's/  */ /g' | cut -c1-160)"
  printf 'NOT_CAPTURED\n' > "$SNAP_DIR/route53-zones.json"
  warn "Route 53 NOT captured — $REASON"
  MISSING+=("route 53 hosted zones and records")
fi

step 5/6 "SES and SNS configuration (for the E6 comparison)"
capture "ses identities" ses-identities.json \
  aws sesv2 list-email-identities --region "$AWS_REGION" --output json
capture "sns topics" sns-topics.json \
  aws sns list-topics --region "$AWS_REGION" --output json

step 6/6 "Cognito user pools and API Gateways"
capture "cognito user pools" cognito-pools.json \
  aws cognito-idp list-user-pools --max-results 60 --region "$AWS_REGION" --output json
capture "api gateways" apigateway-apis.json \
  aws apigatewayv2 get-apis --region "$AWS_REGION" --output json

ln -sfn "$SNAP_DIR" "$DASH_DIR/snapshot/latest" 2>/dev/null || true
save_state SNAPSHOT_DIR "$SNAP_DIR"

printf '\n=== snapshot saved to %s ===\n' "$SNAP_DIR"

if [ "${#MISSING[@]}" -gt 0 ]; then
  printf '\n!!! INCOMPLETE SNAPSHOT — %s capture(s) failed:\n' "${#MISSING[@]}"
  for item in "${MISSING[@]}"; do printf '      - %s\n' "$item"; done
  printf '\n    These are permission gaps on the calling identity, not build failures.\n'
  printf '    The regression test that diffs each missing item CANNOT be run, and must\n'
  printf '    be reported as "not run", never as passing.\n'
fi

printf '\nReview cognito-pools.json before running 02-cognito.sh.\n\n'
