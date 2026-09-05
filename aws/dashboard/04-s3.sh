#!/usr/bin/env bash
# Section 5 / 13 step 5 — document bucket: private, versioned, encrypted, CORS, lifecycle.

source "$(cd "$(dirname "$0")" && pwd)/_lib.sh"

printf '\n=== [4] S3 ===\n'
require_aws

step 1/6 "Bucket $BUCKET_NAME"
if aws s3api head-bucket --bucket "$BUCKET_NAME" > /dev/null 2>&1; then
  handle_existing "S3 bucket $BUCKET_NAME" "already exists"
else
  aws s3api create-bucket \
    --bucket "$BUCKET_NAME" \
    --region "$AWS_REGION" \
    --create-bucket-configuration "LocationConstraint=$AWS_REGION" > /dev/null
  ok "created in $AWS_REGION"
fi

step 2/6 "Block all public access"
aws s3api put-public-access-block \
  --bucket "$BUCKET_NAME" \
  --public-access-block-configuration \
    "BlockPublicAcls=true,IgnorePublicAcls=true,BlockPublicPolicy=true,RestrictPublicBuckets=true"
ok "all four blocks on"

step 3/6 "Versioning"
aws s3api put-bucket-versioning --bucket "$BUCKET_NAME" --versioning-configuration Status=Enabled
ok "enabled"

step 4/6 "Default encryption (SSE-S3)"
aws s3api put-bucket-encryption --bucket "$BUCKET_NAME" --server-side-encryption-configuration \
  '{"Rules":[{"ApplyServerSideEncryptionByDefault":{"SSEAlgorithm":"AES256"},"BucketKeyEnabled":true}]}'
ok "AES256"

step 5/6 "CORS (named origins only, never *)"
TMP="$(mktemp -d)"
trap 'rm -rf "$TMP"' EXIT

cat > "$TMP/cors.json" <<EOF
{
  "CORSRules": [
    {
      "AllowedHeaders": ["*"],
      "AllowedMethods": ["GET", "PUT", "HEAD"],
      "AllowedOrigins": ["$ALLOWED_ORIGIN", "$ALLOWED_ORIGIN_WWW"],
      "ExposeHeaders": ["ETag"],
      "MaxAgeSeconds": 3000
    }
  ]
}
EOF

aws s3api put-bucket-cors --bucket "$BUCKET_NAME" --cors-configuration "file://$(aws_path "$TMP/cors.json")"
ok "$ALLOWED_ORIGIN and $ALLOWED_ORIGIN_WWW"

step 6/6 "Lifecycle — Standard-IA after 90 days"
cat > "$TMP/lifecycle.json" <<'EOF'
{
  "Rules": [
    {
      "ID": "policy-pdfs-to-standard-ia",
      "Status": "Enabled",
      "Filter": { "Prefix": "users/" },
      "Transitions": [ { "Days": 90, "StorageClass": "STANDARD_IA" } ]
    }
  ]
}
EOF

aws s3api put-bucket-lifecycle-configuration \
  --bucket "$BUCKET_NAME" --lifecycle-configuration "file://$(aws_path "$TMP/lifecycle.json")"
ok "transition rule applied"

cat <<EOF

=== S3 ready ===
    Versioning is ON and the spec defines no expiry for noncurrent versions,
    so replaced/deleted PDFs are retained and keep costing storage. That is
    as specified. Raise it if you want a noncurrent-version rule later.

EOF
