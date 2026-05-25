# runreceipt PRD

Status: in-progress

## Summary

`runreceipt` wraps local commands and writes a compact receipt: command, cwd, environment allowlist, start/end time, exit code, stdout/stderr paths, and hashes. It gives humans and agents a durable proof of what actually ran.

## Problem

"Tests passed" is not very useful when nobody knows which command, directory, env, or output produced that claim. Developers need a frictionless way to capture command evidence for README examples, release checks, and agent handoffs.

## V1 Goals

- Run a command and record a receipt in JSON and Markdown.
- Capture stdout/stderr to files with hashes and byte counts.
- Support env allowlists and redaction.
- Provide `verify`, `show`, and `list` commands.
- Include fixtures and smoke tests for passing and failing commands.

## Non-Goals

- No remote attestation.
- No shell session replay UI.
- No hidden telemetry.

## CLI

```bash
runreceipt exec -- npm test
runreceipt show .runreceipt/latest.json
runreceipt verify .runreceipt/latest.json
```

## Safety

The wrapper must preserve the child process exit code and avoid recording full environment variables unless explicitly allowed.

## Inspiration

Inspired by test evidence, reproducible command logs, and the practical need to make agent verification claims inspectable.
