# runreceipt

Local-first command receipts with captured output and verification

## Status

This repository is early-stage. Confirm the current support, release, and
security posture before using it in production.

## Install

Install from a checked-out repository:

```sh
npm install
npm run build
npm link
```

The CLI binary is `runreceipt`.

## Use

Capture a command and write JSON and Markdown receipts:

```sh
runreceipt exec -- npm test
```

Receipts are written to `.runreceipt/runs/<id>/`, with convenience copies at
`.runreceipt/latest.json` and `.runreceipt/latest.md`.

Inspect the latest receipt:

```sh
runreceipt show .runreceipt/latest.json
```

Verify captured stdout/stderr hashes and byte counts:

```sh
runreceipt verify .runreceipt/latest.json
```

List receipts:

```sh
runreceipt list --dir .runreceipt
```

Capture selected environment keys:

```sh
runreceipt exec --env CI,GITHUB_SHA --redact GITHUB_SHA -- npm test
```

`runreceipt` never records the full environment by default. It stores only
allowlisted keys and redacts sensitive-looking keys such as tokens, passwords,
credentials, and API keys.

## Verify

Run the local validation script before opening a pull request:

```sh
bash scripts/validate.sh
```

`scripts/validate.sh` runs the repository's standard local checks when they are defined and will also run `agent-qc ready` when `agent-qc` is installed. Missing `agent-qc` is treated as a skip, not a failure.

For the full local release gate:

```sh
npm run release:check
```

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md) for contribution expectations. Changes
should be small, reviewable, and verified before review.

## Security

See [SECURITY.md](SECURITY.md) for vulnerability reporting guidance.

## License

MIT
