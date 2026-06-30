# Env Redaction Hooks

Short post drafts for the `runreceipt` environment capture demo.

## Hooks

1. Terminal output is only half the story. `runreceipt` can record a command
   receipt with selected environment context, then verify the captured output
   later.
2. Environment capture should be explicit. In the demo, only
   `RUNRECEIPT_DEMO_MODE`, `RUNRECEIPT_DEMO_TOKEN`, and
   `RUNRECEIPT_DEMO_SHA` are allowlisted, and the token/SHA values are
   redacted.
3. A good handoff artifact says what ran, what it printed, which env keys were
   intentionally included, and whether the receipt still verifies.

## Demo CTA

```sh
bash demo/run-env-redaction-receipt.sh
```

## Video Beats

1. Open `examples/env-redaction-receipt.md`.
2. Run the demo script.
3. Open the printed Markdown receipt path.
4. Point out `RUNRECEIPT_DEMO_MODE=content-sweep`.
5. Point out `[REDACTED]` for the token-like and explicitly redacted keys.
6. Show `runreceipt verify` returning `OK`.

## Guardrails

- Do not show real environment values.
- Do not imply that `runreceipt` captures the full environment.
- Receipts are local files; review them before sharing outside the workspace.
