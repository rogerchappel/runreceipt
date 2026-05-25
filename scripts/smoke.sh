#!/usr/bin/env bash
set -euo pipefail

repo_root="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
tmp_dir="$(mktemp -d)"
trap 'rm -rf "$tmp_dir"' EXIT

cd "$tmp_dir"

node "$repo_root/dist/cli.js" exec --env PATH --redact PATH --out-dir receipts -- node -e 'console.log("smoke stdout"); console.error("smoke stderr")'
node "$repo_root/dist/cli.js" show receipts/latest.json >/dev/null
node "$repo_root/dist/cli.js" verify receipts/latest.json
node "$repo_root/dist/cli.js" list --dir receipts >/dev/null

set +e
node "$repo_root/dist/cli.js" exec --out-dir receipts -- node -e 'process.exit(13)'
exit_code=$?
set -e

if [ "$exit_code" -ne 13 ]; then
  printf 'Expected failing child exit code 13, got %s\n' "$exit_code" >&2
  exit 1
fi
