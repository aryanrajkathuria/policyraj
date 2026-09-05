#!/usr/bin/env bash
# Section 0 — "before you start" snapshot. READ ONLY. Creates nothing, changes nothing.
# Run this BEFORE 01-budget.sh. Test E7/E8 diffs against its output.

source "$(cd "$(dirname "$0")" && pwd)/_lib.sh"

SNAP_DIR="$DASH_DIR/snapshot/$(date +%Y%m%d-%H%M%S)"

printf '\n=== PolicyRaj Dashboard — pre-build snapshot ===\n'
require_aws
mkdir -p "$SNAP_DIR"

step 1/6 "Lambda functions"
aws lambda list-functions --region "$AWS_REGION" \
  --query 'sort_by(Functions,&FunctionName)[].{Name:FunctionName,Runtime:Runtime,Modified:LastModified}' \
  --output json > "$SNAP_DIR/lambda-functions.json"
ok "$(grep -c '"Name"' "$SNAP_DIR/lambda-functions.json" || true) functions"

step 2/6 "DynamoDB tables"
aws dynamodb list-tables --region "$AWS_REGION" --output json > "$SNAP_DIR/dynamodb-tables.json"
ok "captured"

step 3/6 "S3 buckets"
aws s3api list-buckets --query 'sort_by(Buckets,&Name)[].Name' --output json > "$SNAP_DIR/s3-buckets.json"
ok "captured"

step 4/6 "Route 53 records (all hosted zones)"
aws route53 list-hosted-zones --output json > "$SNAP_DIR/route53-zones.json"
for zone_id in $(aws route53 list-hosted-zones --query 'HostedZones[].Id' --output text); do
  short="${zone_id##*/}"
  aws route53 list-resource-record-sets --hosted-zone-id "$short" --output json \
    > "$SNAP_DIR/route53-records-${short}.json"
  log "zone $short captured"
done
ok "captured"

step 5/6 "SES and SNS configuration (for the E6 comparison)"
aws sesv2 list-email-identities --region "$AWS_REGION" --output json \
  > "$SNAP_DIR/ses-identities.json" 2>/dev/null || warn "sesv2 list failed — capture SES manually"
aws sns list-topics --region "$AWS_REGION" --output json \
  > "$SNAP_DIR/sns-topics.json" 2>/dev/null || warn "sns list failed"
ok "captured"

step 6/6 "Cognito user pools and API Gateways"
aws cognito-idp list-user-pools --max-results 60 --region "$AWS_REGION" --output json \
  > "$SNAP_DIR/cognito-pools.json"
aws apigatewayv2 get-apis --region "$AWS_REGION" --output json \
  > "$SNAP_DIR/apigateway-apis.json" 2>/dev/null || true
ok "captured"

ln -sfn "$SNAP_DIR" "$DASH_DIR/snapshot/latest" 2>/dev/null || true
save_state SNAPSHOT_DIR "$SNAP_DIR"

printf '\n=== snapshot saved to %s ===\n\n' "$SNAP_DIR"
printf 'Review cognito-pools.json now. If a pool named %s already exists,\n' "$POOL_NAME"
printf 'stop and decide before running 02-cognito.sh — see the note in that script.\n\n'
