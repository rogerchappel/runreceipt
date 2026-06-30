# Env Redaction Receipt Demo

This demo shows the privacy boundary in `runreceipt`: environment values are
not captured by default, selected keys can be allowlisted, and token-like or
explicitly redacted keys are written as `[REDACTED]`.

Run it from the repository root:

```sh
bash demo/run-env-redaction-receipt.sh
```

The script builds the CLI, sets three temporary demo variables, captures a safe
Node command, then verifies the generated receipt.

## What to inspect

- `RUNRECEIPT_DEMO_MODE` is allowlisted and visible as `content-sweep`.
- `RUNRECEIPT_DEMO_TOKEN` is allowlisted but redacted by the default token
  pattern.
- `RUNRECEIPT_DEMO_SHA` is allowlisted and redacted by the explicit
  `--redact RUNRECEIPT_DEMO_SHA` flag.
- `runreceipt verify` checks that the captured stdout and stderr metadata still
  match the saved receipt.

The script writes receipts under a temporary directory and prints the JSON,
Markdown, and verification-output paths before cleanup.
