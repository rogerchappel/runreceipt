# Release readiness

Use this checklist before cutting a release or asking for a release review.

## Receipt verification scope

`runreceipt verify` checks:

- JSON schema version and command presence.
- Non-negative duration and sane start/end timestamps.
- JSON and Markdown receipt artifacts still exist.
- stdout and stderr byte counts and SHA-256 hashes still match captured files.

## Local verification

```sh
npm install
npm run check
npm run test
npm run smoke
npm run package:smoke
npm run release:check
```

## Package contents

Run `npm run package:smoke` when available and review the dry-run file list for only the built runtime, README, license, and other intentional release assets.

## Notes

- Keep README examples aligned with the fixture-backed smoke command.
- Do not publish until CI is green on the release branch.
- Update CHANGELOG.md with user-facing changes before tagging.
