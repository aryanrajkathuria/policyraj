#!/usr/bin/env bash
# Section 15 test plan. Prints the real status code and response body for every
# test, then a pass/fail table. Nothing here is simulated.
#
# Setup first (section 15 "Setup"):
#   1. Create test-a@policyraj.com, test-b@policyraj.com, test-admin@policyraj.com
#      in the Cognito console. Add test-admin to the "admin" group.
#   2. Sign in as each and copy the id token out of sessionStorage.
#   3. Create >=2 policies under A and >=1 under B, each with a real uploaded PDF.
#   4. Export the tokens, then run this script:
#        export TOKEN_A=... TOKEN_B=... TOKEN_X=...
#        ./test/section15.sh
#
# Tests that cannot be automated are listed as MANUAL at the end. Run those by
# hand and record the result — do not report them as passing.

source "$(cd "$(dirname "$0")/.." && pwd)/_lib.sh"

: "${READ_URL:?run 06-lambdas.sh first — READ_URL missing from .state.env}"
: "${SAVE_URL:?run 06-lambdas.sh first — SAVE_URL missing from .state.env}"
: "${ADMIN_URL:?run 06-lambdas.sh first — ADMIN_URL missing from .state.env}"
: "${TOKEN_A:?export TOKEN_A before running}"
: "${TOKEN_B:?export TOKEN_B before running}"
: "${TOKEN_X:?export TOKEN_X before running}"

BODY_FILE="$(mktemp)"
trap 'rm -f "$BODY_FILE"' EXIT

PASSES=0
FAILS=0
RESULTS=()

# api <url> <token|-> <json>
api() {
  local url="$1" token="$2" payload="$3"
  if [ "$token" = "-" ]; then
    HTTP_STATUS="$(curl -sS -o "$BODY_FILE" -w '%{http_code}' -X POST "$url" \
      -H 'content-type: application/json' -d "$payload")"
  else
    HTTP_STATUS="$(curl -sS -o "$BODY_FILE" -w '%{http_code}' -X POST "$url" \
      -H 'content-type: application/json' -H "authorization: Bearer $token" -d "$payload")"
  fi
  HTTP_BODY="$(head -c 400 "$BODY_FILE")"
}

json_get() { node -e "let s='';process.stdin.on('data',d=>s+=d).on('end',()=>{try{const o=JSON.parse(s);console.log(eval('o.$1')??'')}catch{console.log('')}})" < "$BODY_FILE"; }

record() {
  local id="$1" expected="$2" actual="$3" note="$4" verdict
  if [ "$actual" = "$expected" ] || [[ "$expected" == *"|$actual|"* ]]; then
    verdict="PASS"; PASSES=$((PASSES + 1))
  else
    verdict="FAIL"; FAILS=$((FAILS + 1))
  fi
  RESULTS+=("$id|$verdict|expected $expected, got $actual|$note")
  printf '  %-5s %-4s  expected %-12s got %-4s  %s\n' "$id" "$verdict" "$expected" "$actual" "$note"
  printf '        body: %s\n' "$HTTP_BODY"
}

section() { printf '\n--- %s ---\n' "$*"; }

printf '\n=== PolicyRaj dashboard — section 15 test run — %s ===\n' "$(date -u +%Y-%m-%dT%H:%M:%SZ)"

section "A. Authentication"
api "$READ_URL" - '{"action":"getDashboard"}';                 record A1 401 "$HTTP_STATUS" "no Authorization header"
api "$READ_URL" "garbage" '{"action":"getDashboard"}';          record A2 401 "$HTTP_STATUS" "Bearer garbage"
TAMPERED="$(printf '%s' "$TOKEN_A" | sed 's/./X/44')"
api "$READ_URL" "$TAMPERED" '{"action":"getDashboard"}';        record A3 401 "$HTTP_STATUS" "tampered payload byte"
if [ -n "${ACCESS_TOKEN_A:-}" ]; then
  api "$READ_URL" "$ACCESS_TOKEN_A" '{"action":"getDashboard"}'; record A4 401 "$HTTP_STATUS" "access token, verifier wants id"
else
  printf '  A4    SKIP  export ACCESS_TOKEN_A to run this one\n'
fi
if [ -n "${EXPIRED_TOKEN:-}" ]; then
  api "$READ_URL" "$EXPIRED_TOKEN" '{"action":"getDashboard"}';  record A5 401 "$HTTP_STATUS" "expired token"
else
  printf '  A5    MANUAL  keep a token for >1h, then re-run with EXPIRED_TOKEN set\n'
fi
api "$READ_URL" "$TOKEN_A" '{"action":"getDashboard"}';         record A6 200 "$HTTP_STATUS" "valid TOKEN_A"

POLICY_A="$(json_get "policies[0].policyId")"
api "$READ_URL" "$TOKEN_B" '{"action":"getDashboard"}'
POLICY_B="$(json_get "policies[0].policyId")"
printf '\n  discovered POLICY_A=%s  POLICY_B=%s\n' "$POLICY_A" "$POLICY_B"
[ -n "$POLICY_A" ] && [ -n "$POLICY_B" ] || die "both users need at least one policy before section B can run"

section "B. Ownership isolation — SECURITY CRITICAL"
api "$READ_URL" "$TOKEN_A" '{"action":"getDashboard"}'
if printf '%s' "$HTTP_BODY" | grep -q "$POLICY_B"; then
  record B1 "absent" "present" "User B policy leaked into User A dashboard"
else
  record B1 "absent" "absent" "User A sees only their own policies"
fi

api "$READ_URL" "$TOKEN_A" "{\"action\":\"getDownloadUrl\",\"policyId\":\"$POLICY_B\"}"
record B2 404 "$HTTP_STATUS" "A requests B's download URL"

api "$SAVE_URL" "$TOKEN_A" "{\"action\":\"updatePolicy\",\"policyId\":\"$POLICY_B\",\"data\":{\"insurer\":\"HACKED\"}}"
record B3 404 "$HTTP_STATUS" "A updates B's policy — verify B's item in console too"

api "$SAVE_URL" "$TOKEN_A" "{\"action\":\"deletePolicy\",\"policyId\":\"$POLICY_B\"}"
record B4 404 "$HTTP_STATUS" "A deletes B's policy — verify B's item still exists"

api "$SAVE_URL" "$TOKEN_A" '{"action":"updateProfile","userId":"00000000-0000-4000-8000-000000000000","data":{"city":"IsolationCheck"}}'
record B5 200 "$HTTP_STATUS" "extra userId in body must be ignored"

SUB_B="$(printf '%s' "$TOKEN_B" | cut -d. -f2 | tr '_-' '/+' | base64 -d 2>/dev/null | node -e "let s='';process.stdin.on('data',d=>s+=d).on('end',()=>{try{console.log(JSON.parse(s+'}').sub||'')}catch{try{console.log(JSON.parse(s).sub)}catch{console.log('')}}})" || true)"
api "$SAVE_URL" "$TOKEN_A" "{\"action\":\"confirmUpload\",\"policyId\":\"$POLICY_A\",\"s3Key\":\"users/${SUB_B:-unknown}/policies/x.pdf\"}"
record B6 "|400|403|" "$HTTP_STATUS" "A confirms an upload under B's prefix"

printf '  B7    MANUAL  take a presigned URL for A, edit the path to B'"'"'s object, expect SignatureDoesNotMatch\n'

section "B2. Admin access control — SECURITY CRITICAL"
api "$ADMIN_URL" "$TOKEN_A" '{"action":"listCustomers"}';       record BA1 403 "$HTTP_STATUS" "customer token on admin function"
api "$ADMIN_URL" - '{"action":"listCustomers"}';                record BA2 401 "$HTTP_STATUS" "no token on admin function"
printf '  BA3   MANUAL  sign up a fresh user, decode its id token, confirm no admin group\n'

api "$SAVE_URL" "$TOKEN_A" '{"action":"updateProfile","data":{"cognito:groups":["admin"],"isAdmin":true,"city":"EscalationCheck"}}'
record BA4 200 "$HTTP_STATUS" "privilege fields must be dropped — re-fetch A's token and confirm no admin group"

api "$ADMIN_URL" "$TOKEN_X" '{"action":"listCustomers"}';       record BA5 200 "$HTTP_STATUS" "owner lists customers"
api "$ADMIN_URL" "$TOKEN_X" '{"action":"getActivityFeed","limit":50}'; record BA6 200 "$HTTP_STATUS" "owner reads activity feed"

SUB_A="$(printf '%s' "$TOKEN_A" | cut -d. -f2 | tr '_-' '/+' | base64 -d 2>/dev/null | node -e "let s='';process.stdin.on('data',d=>s+=d).on('end',()=>{try{console.log(JSON.parse(s).sub)}catch{console.log('')}})" || true)"
api "$ADMIN_URL" "$TOKEN_X" "{\"action\":\"getDocumentUrl\",\"userId\":\"$SUB_A\",\"policyId\":\"$POLICY_A\"}"
record BA7 200 "$HTTP_STATUS" "owner opens a customer document"
printf '  BA8   MANUAL  check CloudWatch for admin_document_access with adminSub, targetUserId, timestamp\n'

for action in updateProfile createPolicy deletePolicy getUploadUrl; do
  api "$ADMIN_URL" "$TOKEN_X" "{\"action\":\"$action\"}"
  record "BA9" "|400|404|" "$HTTP_STATUS" "write action '$action' must not exist on admin function"
done

printf '  BA10  MANUAL  temporarily add a write call to the admin Lambda, expect AccessDeniedException, then remove it\n'
api "$READ_URL" "$TOKEN_X" "{\"action\":\"getDownloadUrl\",\"policyId\":\"$POLICY_A\"}"
record BA11 404 "$HTTP_STATUS" "admin privilege must not leak into the customer read function"
printf '  BA12  MANUAL  open /dashboard/admin and confirm no create, edit, upload or delete control\n'

section "C. Input validation"
api "$SAVE_URL" "$TOKEN_A" "{\"action\":\"getUploadUrl\",\"policyId\":\"$POLICY_A\",\"fileName\":\"x.pdf\",\"contentType\":\"text/html\"}"
record C1 400 "$HTTP_STATUS" "non-PDF content type rejected"

api "$SAVE_URL" "$TOKEN_A" "{\"action\":\"getUploadUrl\",\"policyId\":\"$POLICY_A\",\"fileName\":\"../../etc/passwd\",\"contentType\":\"application/pdf\"}"
KEY="$(json_get s3Key)"
if [ "$HTTP_STATUS" = "200" ] && [[ "$KEY" == users/${SUB_A}/* ]] && [[ "$KEY" != *".."* ]]; then
  record C2 "sanitized" "sanitized" "key=$KEY"
else
  record C2 "sanitized" "unsafe" "key=$KEY"
fi

LONG_NAME="$(printf 'a%.0s' $(seq 1 300)).pdf"
api "$SAVE_URL" "$TOKEN_A" "{\"action\":\"getUploadUrl\",\"policyId\":\"$POLICY_A\",\"fileName\":\"$LONG_NAME\",\"contentType\":\"application/pdf\"}"
KEY="$(json_get s3Key)"
FNAME="${KEY##*/}"
if [ "$HTTP_STATUS" = "200" ] && [ "${#FNAME}" -le 100 ]; then
  record C3 "<=100" "${#FNAME}" "300-char filename truncated"
else
  record C3 "<=100" "${#FNAME}" "filename not capped"
fi

api "$SAVE_URL" "$TOKEN_A" '{"action":"createPolicy","policyId":"11111111-1111-4111-8111-111111111111","data":{"insurer":"ClientIdTest","policyNumber":"C4"}}'
NEW_ID="$(json_get policyId)"
if [ "$NEW_ID" != "11111111-1111-4111-8111-111111111111" ] && [ -n "$NEW_ID" ]; then
  record C4 "server-generated" "server-generated" "returned $NEW_ID"
else
  record C4 "server-generated" "client-supplied" "returned $NEW_ID"
fi

api "$SAVE_URL" "$TOKEN_A" '{"action":"updateProfile","data":{"isAdmin":true,"city":"WhitelistCheck"}}'
record C5 200 "$HTTP_STATUS" "isAdmin must be dropped — confirm it is absent on the item in the console"

api "$SAVE_URL" "$TOKEN_A" '{"action":"updatePolicy","policyId":"22222222-2222-4222-8222-222222222222","data":{"insurer":"Ghost"}}'
record C6 404 "$HTTP_STATUS" "no ghost item created"

api "$SAVE_URL" "$TOKEN_A" "{\"action\":\"confirmUpload\",\"policyId\":\"$POLICY_A\",\"s3Key\":\"users/${SUB_A}/policies/${POLICY_A}/never-uploaded.pdf\"}"
record C7 400 "$HTTP_STATUS" "HEAD check fails for an object that was never uploaded"

section "D. Upload and download — MANUAL, needs a real browser and real PDFs"
cat <<'EOF'
  D1    MANUAL  2 MB PDF through getUploadUrl -> PUT -> confirmUpload
  D2    MANUAL  download it back, byte-identical
  D3    MANUAL  15 MB file rejected by the size check
  D4    MANUAL  wait 10 min, reuse the download URL, expect AccessDenied
  D5    MANUAL  open the bare S3 object URL, expect AccessDenied
  D6    MANUAL  upload from https://policyraj.com, no CORS error
  D7    MANUAL  same upload from another origin, blocked by CORS
EOF

section "E. Regression — MANUAL, this is the section that protects the live site"
cat <<'EOF'
  E1    MANUAL  load https://policyraj.com, no visual change
  E2    MANUAL  submit the existing contact form, still writes to the original table
  E3    MANUAL  notification email arrives, inbox not spam
  E4    MANUAL  check headers: SPF, DKIM, DMARC pass, MAIL FROM unchanged
  E5    MANUAL  open the Veera chatbot, works as before
  E6    MANUAL  compare SES and SNS console against the snapshot
EOF
if [ -n "${SNAPSHOT_DIR:-}" ] && [ -d "$SNAPSHOT_DIR" ]; then
  printf '\n  E7/E8 diffing against %s\n' "$SNAPSHOT_DIR"
  aws lambda list-functions --region "$AWS_REGION" \
    --query 'sort_by(Functions,&FunctionName)[].{Name:FunctionName,Runtime:Runtime,Modified:LastModified}' \
    --output json > /tmp/now-lambda.json
  diff "$SNAPSHOT_DIR/lambda-functions.json" /tmp/now-lambda.json || true
  aws s3api list-buckets --query 'sort_by(Buckets,&Name)[].Name' --output json > /tmp/now-buckets.json
  diff "$SNAPSHOT_DIR/s3-buckets.json" /tmp/now-buckets.json || true
  aws dynamodb list-tables --region "$AWS_REGION" --output json > /tmp/now-tables.json
  diff "$SNAPSHOT_DIR/dynamodb-tables.json" /tmp/now-tables.json || true
  printf '  Only the three new Lambdas, one new bucket and one new table should appear.\n'
  printf '  E7: re-run route53 list-resource-record-sets per zone and diff manually.\n'
else
  printf '  E7/E8 SKIP  no snapshot found — 00-snapshot.sh was not run before the build\n'
fi

section "F. Cost guardrails"
NAT="$(aws ec2 describe-nat-gateways --region "$AWS_REGION" --query 'length(NatGateways)' --output text 2>/dev/null || echo ERR)"
record F1 0 "$NAT" "NAT gateways"
ELB="$(aws elbv2 describe-load-balancers --region "$AWS_REGION" --query 'length(LoadBalancers)' --output text 2>/dev/null || echo ERR)"
record F2 0 "$ELB" "load balancers"
RDS="$(aws rds describe-db-instances --region "$AWS_REGION" --query 'length(DBInstances)' --output text 2>/dev/null || echo ERR)"
record F3 0 "$RDS" "RDS instances"

VPC_COUNT=0
for fn in "$READ_FN" "$SAVE_FN" "$ADMIN_FN"; do
  V="$(aws lambda get-function-configuration --region "$AWS_REGION" --function-name "$fn" \
    --query 'length(VpcConfig.SubnetIds)' --output text 2>/dev/null || echo 0)"
  [ "$V" = "None" ] && V=0
  VPC_COUNT=$((VPC_COUNT + V))
done
record F4 0 "$VPC_COUNT" "subnets attached across all three Lambdas"

BILLING="$(aws dynamodb describe-table --region "$AWS_REGION" --table-name "$TABLE_NAME" \
  --query 'Table.BillingModeSummary.BillingMode' --output text 2>/dev/null || echo ERR)"
record F5 PAY_PER_REQUEST "$BILLING" "table billing mode"

GSI="$(aws dynamodb describe-table --region "$AWS_REGION" --table-name "$TABLE_NAME" \
  --query 'length(GlobalSecondaryIndexes)' --output text 2>/dev/null || echo 0)"
[ "$GSI" = "None" ] && GSI=0
record F6 0 "$GSI" "GSIs on the table"

printf '  F7    NOTE  this build creates no API Gateway. The account already had\n'
printf '              policyraj-quote-api from the earlier quote backend — check the\n'
printf '              section 0 snapshot and confirm the list is unchanged, not empty.\n'

BUDGET="$(aws budgets describe-budget --account-id "$(aws sts get-caller-identity --query Account --output text)" \
  --budget-name "$BUDGET_NAME" --region us-east-1 --query 'Budget.BudgetName' --output text 2>/dev/null || echo MISSING)"
record F8 "$BUDGET_NAME" "$BUDGET" "budget alert present"

printf '\n\n=== RESULTS ===\n\n'
printf '%-6s %-6s %-34s %s\n' "TEST" "RESULT" "DETAIL" "NOTE"
for row in "${RESULTS[@]}"; do
  IFS='|' read -r id verdict detail note <<< "$row"
  printf '%-6s %-6s %-34s %s\n' "$id" "$verdict" "$detail" "$note"
done

printf '\nautomated: %s passed, %s failed\n' "$PASSES" "$FAILS"
printf 'Tests marked MANUAL above are NOT included in that count and must be run by hand.\n\n'

if [ "$FAILS" -gt 0 ]; then
  printf 'Failures in section B or B2 are security issues, not bugs. Stop and fix before shipping.\n\n'
  exit 1
fi
