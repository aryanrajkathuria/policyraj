#!/usr/bin/env bash
# Shared helpers. Sourced by every numbered script — not run directly.

set -euo pipefail

DASH_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
STATE_FILE="$DASH_DIR/.state.env"

# shellcheck disable=SC1091
source "$DASH_DIR/config.env"

if [ -f "$STATE_FILE" ]; then
  # shellcheck disable=SC1090
  source "$STATE_FILE"
fi

log()  { printf '    %s\n' "$*"; }
step() { printf '\n[%s] %s\n' "$1" "$2"; }
ok()   { printf '    OK   %s\n' "$*"; }
warn() { printf '    WARN %s\n' "$*" >&2; }
die()  { printf '\nABORT: %s\n\n' "$*" >&2; exit 1; }

# Records a discovered/created id so later scripts can pick it up.
save_state() {
  local key="$1" value="$2"
  touch "$STATE_FILE"
  grep -v "^${key}=" "$STATE_FILE" > "${STATE_FILE}.tmp" 2>/dev/null || true
  mv "${STATE_FILE}.tmp" "$STATE_FILE"
  printf '%s=%s\n' "$key" "$value" >> "$STATE_FILE"
  log "saved ${key} to .state.env"
}

require_aws() {
  command -v aws >/dev/null 2>&1 || die "AWS CLI not found on PATH. Install it and run 'aws configure' first."

  ACCOUNT_ID="$(aws sts get-caller-identity --query Account --output text 2>/dev/null || true)"
  [ -n "$ACCOUNT_ID" ] && [ "$ACCOUNT_ID" != "None" ] \
    || die "No usable AWS credentials. Run 'aws configure' for the PolicyRaj account."

  local caller
  caller="$(aws sts get-caller-identity --query Arn --output text)"
  printf '    account %s  region %s\n    caller  %s\n' "$ACCOUNT_ID" "$AWS_REGION" "$caller"
}

# Existing resources are never overwritten. The script stops and hands the
# decision back, unless the operator has explicitly opted in with ADOPT=1.
handle_existing() {
  local what="$1" detail="$2"
  if [ "${ADOPT:-0}" = "1" ]; then
    warn "$what already exists ($detail) — adopting it because ADOPT=1"
    return 0
  fi
  die "$what already exists ($detail).
  This build must not modify anything that already exists.
  Check the console and decide:
    - if it belongs to this dashboard build and is correct, re-run with ADOPT=1
    - if it belongs to something else, change the name in config.env instead"
}
