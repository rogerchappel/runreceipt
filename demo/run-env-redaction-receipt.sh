#!/usr/bin/env bash
set -euo pipefail

repo_root="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
tmp="$(mktemp -d)"
trap 'rm -rf "$tmp"' EXIT

cd "$repo_root"

npm run build >/dev/null

export RUNRECEIPT_DEMO_MODE="content-sweep"
export RUNRECEIPT_DEMO_TOKEN="demo-token-never-share"
export RUNRECEIPT_DEMO_SHA="abc123demo"

node dist/cli.js exec \
  --out-dir "$tmp/receipts" \
  --env RUNRECEIPT_DEMO_MODE,RUNRECEIPT_DEMO_TOKEN,RUNRECEIPT_DEMO_SHA \
  --redact RUNRECEIPT_DEMO_SHA \
  -- node -e "console.log('env receipt demo ok')"

node dist/cli.js show "$tmp/receipts/latest.json" > "$tmp/show.txt"
node dist/cli.js verify "$tmp/receipts/latest.json" > "$tmp/verify.txt"

grep -q "env receipt demo ok" "$tmp/receipts/latest.md"
grep -q "RUNRECEIPT_DEMO_MODE" "$tmp/receipts/latest.md"
grep -q "content-sweep" "$tmp/receipts/latest.md"
grep -q "RUNRECEIPT_DEMO_TOKEN" "$tmp/receipts/latest.md"
grep -q "RUNRECEIPT_DEMO_SHA" "$tmp/receipts/latest.md"
grep -q "\\[REDACTED\\]" "$tmp/receipts/latest.md"
grep -q "envRedacted: RUNRECEIPT_DEMO_SHA, RUNRECEIPT_DEMO_TOKEN" "$tmp/show.txt"
grep -q "OK" "$tmp/verify.txt"

echo "Receipt JSON: $tmp/receipts/latest.json"
echo "Receipt Markdown: $tmp/receipts/latest.md"
echo "Verify output: $tmp/verify.txt"
