# Basic runreceipt Example

Capture a command:

```sh
runreceipt exec -- npm test
```

Inspect the latest receipt:

```sh
runreceipt show .runreceipt/latest.json
```

Verify captured output hashes and byte counts:

```sh
runreceipt verify .runreceipt/latest.json
```

Record selected environment keys without dumping the full process environment:

```sh
runreceipt exec --env CI,GITHUB_SHA --redact GITHUB_SHA -- npm test
```
