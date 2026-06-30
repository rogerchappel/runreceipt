# RunReceipt Video Brief

## Angle

Show how a local command can leave behind a receipt with captured output,
metadata, and a verification step.

## 60-second outline

1. Open with the problem: terminal output is easy to lose after a test or build
   run.
2. Run `node dist/cli.js exec --out-dir /tmp/runreceipt-demo -- node -e
   "console.log('receipt demo ok')"`.
3. Show `/tmp/runreceipt-demo/latest.md` as the shareable Markdown receipt.
4. Run `node dist/cli.js verify /tmp/runreceipt-demo/latest.json` to prove the
   saved output still matches the receipt.
5. Mention the privacy boundary: environment keys are not captured unless they
   are allowlisted with `--env`.

## Alternate env-redaction beat

Run `bash demo/run-env-redaction-receipt.sh` when the story needs to show
selected environment context. The receipt includes `RUNRECEIPT_DEMO_MODE` and
redacts `RUNRECEIPT_DEMO_TOKEN` plus `RUNRECEIPT_DEMO_SHA`.

## Social hooks

- Local command receipts for tests, builds, and handoffs: run it, save the
  output, verify it later.
- `runreceipt exec -- npm test` turns a one-off shell run into JSON and
  Markdown evidence.
- The useful detail is the verify step: stdout and stderr hashes can be checked
  after the run.

## Guardrails to say out loud

- This is an early-stage local CLI.
- It records allowlisted environment keys only.
- Receipts are files in the workspace; review them before sharing publicly.
