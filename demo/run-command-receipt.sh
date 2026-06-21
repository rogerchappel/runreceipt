#!/usr/bin/env bash
set -euo pipefail

repo_root="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
tmp="$(mktemp -d)"
trap 'rm -rf "$tmp"' EXIT

cd "$repo_root"

npm run build >/dev/null

node dist/cli.js exec --out-dir "$tmp/receipts" -- node -e "console.log('receipt demo ok')"
node dist/cli.js show "$tmp/receipts/latest.json" > "$tmp/show.txt"
node dist/cli.js verify "$tmp/receipts/latest.json" > "$tmp/verify.txt"
node dist/cli.js list --dir "$tmp/receipts" > "$tmp/list.txt"

grep -q "receipt demo ok" "$tmp/receipts/latest.md"
grep -q "OK" "$tmp/verify.txt"
grep -q "exitCode: 0" "$tmp/show.txt"

echo "Receipt JSON: $tmp/receipts/latest.json"
echo "Receipt Markdown: $tmp/receipts/latest.md"
echo "Verify output: $tmp/verify.txt"
