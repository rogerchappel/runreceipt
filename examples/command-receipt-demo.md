# Command Receipt Demo

This demo captures a safe command, inspects the latest receipt, and verifies the
captured output hashes. It uses `--out-dir` so the run can be deleted without
touching the default `.runreceipt/` directory.

## Setup

```sh
npm install
npm run build
rm -rf /tmp/runreceipt-demo
```

## Run the demo

Capture a deterministic command:

```sh
node dist/cli.js exec --out-dir /tmp/runreceipt-demo -- node -e "console.log('receipt demo ok')"
```

Show the human-readable summary:

```sh
node dist/cli.js show /tmp/runreceipt-demo/latest.json
```

Verify the captured stdout and stderr byte counts and hashes:

```sh
node dist/cli.js verify /tmp/runreceipt-demo/latest.json
```

List captured runs:

```sh
node dist/cli.js list --dir /tmp/runreceipt-demo
```

## Expected proof points

- `exec` writes a JSON receipt and Markdown receipt under
  `/tmp/runreceipt-demo/runs/<id>/`.
- `show` prints the command, exit status, receipt paths, and captured output
  metadata.
- `verify` returns success when the output files still match the receipt hashes.

## Cleanup

```sh
rm -rf /tmp/runreceipt-demo
```
