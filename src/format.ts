import path from 'node:path';
import type { RunReceipt, VerifyResult } from './types.js';

export function shellQuote(value: string): string {
  if (/^[A-Za-z0-9_./:=@+-]+$/.test(value)) {
    return value;
  }

  return `'${value.replaceAll("'", "'\\''")}'`;
}

export function formatCommand(command: string[]): string {
  return command.map(shellQuote).join(' ');
}

export function renderMarkdown(receipt: RunReceipt): string {
  const envRows = Object.entries(receipt.env.values)
    .map(([key, value]) => `| ${escapeCell(key)} | ${escapeCell(value)} |`)
    .join('\n') || '| _none_ | _none_ |';

  return `# Run Receipt ${receipt.id}

| Field | Value |
| --- | --- |
| Command | \`${escapeBackticks(receipt.commandDisplay)}\` |
| CWD | \`${escapeBackticks(receipt.cwd)}\` |
| Started | ${receipt.startTime} |
| Ended | ${receipt.endTime} |
| Duration | ${receipt.durationMs} ms |
| Exit code | ${receipt.exitCode ?? 'signal'} |
| Signal | ${receipt.signal ?? 'none'} |

## Output

| Stream | Path | Bytes | SHA-256 |
| --- | --- | ---: | --- |
| stdout | \`${receipt.stdout.path}\` | ${receipt.stdout.bytes} | \`${receipt.stdout.sha256}\` |
| stderr | \`${receipt.stderr.path}\` | ${receipt.stderr.bytes} | \`${receipt.stderr.sha256}\` |

## Environment

Allowed keys: ${receipt.env.allowed.length > 0 ? receipt.env.allowed.map((key) => `\`${key}\``).join(', ') : '_none_'}

Redacted keys: ${receipt.env.redacted.length > 0 ? receipt.env.redacted.map((key) => `\`${key}\``).join(', ') : '_none_'}

| Key | Value |
| --- | --- |
${envRows}
`;
}

export function renderShow(receipt: RunReceipt): string {
  return [
    `id: ${receipt.id}`,
    `command: ${receipt.commandDisplay}`,
    `cwd: ${receipt.cwd}`,
    `started: ${receipt.startTime}`,
    `ended: ${receipt.endTime}`,
    `durationMs: ${receipt.durationMs}`,
    `exitCode: ${receipt.exitCode ?? 'signal'}`,
    `stdout: ${receipt.stdout.path} (${receipt.stdout.bytes} bytes sha256:${receipt.stdout.sha256})`,
    `stderr: ${receipt.stderr.path} (${receipt.stderr.bytes} bytes sha256:${receipt.stderr.sha256})`,
    `envAllowed: ${receipt.env.allowed.join(', ') || 'none'}`,
    `envRedacted: ${receipt.env.redacted.join(', ') || 'none'}`
  ].join('\n');
}

export function renderList(receipts: RunReceipt[], rootDir: string): string {
  if (receipts.length === 0) {
    return 'No receipts found.';
  }

  return receipts
    .map((receipt) => {
      const jsonPath = path.relative(process.cwd(), path.resolve(rootDir, receipt.receipt.jsonPath));
      return `${receipt.startTime}  exit=${receipt.exitCode ?? 'signal'}  ${receipt.id}  ${receipt.commandDisplay}  ${jsonPath}`;
    })
    .join('\n');
}

export function renderVerify(result: VerifyResult): string {
  const status = result.ok ? 'OK' : 'FAILED';
  const lines = [`${status}: ${result.receiptPath}`];

  for (const check of result.checks) {
    if (check.ok) {
      lines.push(`PASS ${check.name}`);
    } else {
      lines.push(`FAIL ${check.name} expected=${check.expected ?? 'n/a'} actual=${check.actual ?? 'n/a'}`);
    }
  }

  return lines.join('\n');
}

function escapeCell(value: string): string {
  return value.replaceAll('|', '\\|').replaceAll('\n', '<br>');
}

function escapeBackticks(value: string): string {
  return value.replaceAll('`', '\\`');
}
