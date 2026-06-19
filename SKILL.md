# runreceipt

Use this skill when an agent needs durable proof of a local command run, especially for test claims, release checks, README examples, or handoff notes.

## When To Use

- Before saying tests, builds, or smoke checks passed.
- When a release candidate needs exact verification evidence.
- When a command result should be shared without exposing a full shell log.
- When a failing command needs a compact artifact for follow-up debugging.

## Required Inputs

- The command to run, passed after `--`.
- A working directory where the command is safe to execute.
- Optional environment allowlist keys for values that should appear in the receipt.
- Optional redaction keys for values that must not appear in captured output.

## Side Effects

`runreceipt exec` runs the requested command locally and writes receipts under `.runreceipt/` by default. It captures stdout and stderr to files and writes JSON and Markdown metadata. It does not upload artifacts, publish packages, or call remote services by itself.

## Approval Boundaries

Ask for approval before wrapping commands that mutate external services, deploy, publish, send messages, modify credentials, or perform destructive filesystem actions. Local test, build, lint, and smoke commands can usually be wrapped directly when they are already part of the user's requested workflow.

## Examples

```bash
runreceipt exec -- npm test
runreceipt exec --env NODE_ENV,CI --out-dir evidence/release -- npm run release:check
runreceipt verify evidence/release/latest.json
runreceipt show --json evidence/release/latest.json
```

## Validation Workflow

1. Run the command with `runreceipt exec -- <command>`.
2. Check the wrapper's exit code, which mirrors the child process.
3. Run `runreceipt verify .runreceipt/latest.json`.
4. Include the JSON path, Markdown path, exit code, and verification result in the handoff.

## Safety Notes

- Environment values are omitted unless explicitly allowlisted.
- Captured streams may still include secrets printed by the child process; use `--redact` for known keys and review receipts before sharing.
- Receipts prove what the wrapper observed locally; they are not remote attestation or tamper-proof notarization.
