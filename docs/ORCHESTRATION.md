# Orchestration

`runreceipt` is designed for humans and agents that need durable proof for local command execution.

## Flow

1. `runreceipt exec` runs a child command without a shell.
2. stdout and stderr are streamed to the terminal and captured to files.
3. The CLI writes JSON and Markdown receipts under `.runreceipt/runs/<id>/`.
4. `.runreceipt/latest.json` and `.runreceipt/latest.md` are updated for quick handoff.
5. `runreceipt verify` recomputes hashes and byte counts from captured output.

## Safety Defaults

- The full environment is never recorded.
- Only explicitly allowlisted environment keys are stored.
- Sensitive-looking keys and explicit redaction keys are stored as `[REDACTED]`.
- Child process exit codes are preserved by the CLI.
- Commands are spawned directly, so shell expansion is caller-controlled.

## Agent Handoff

Agents can include `.runreceipt/latest.md` in review notes when they claim checks passed. Reviewers can run `runreceipt verify .runreceipt/latest.json` to confirm the captured output files still match the receipt.
