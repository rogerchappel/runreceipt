import path from 'node:path';
import { readJson } from './fs.js';
import { hashFile } from './hash.js';
import type { RunReceipt, VerifyResult } from './types.js';

export async function verifyReceipt(receiptPath: string): Promise<VerifyResult> {
  const absoluteReceiptPath = path.resolve(receiptPath);
  const receipt = await readJson<RunReceipt>(absoluteReceiptPath);
  const checks: VerifyResult['checks'] = [];

  checks.push({ name: 'schemaVersion', ok: receipt.schemaVersion === 1, expected: 1, actual: receipt.schemaVersion });
  checks.push({ name: 'command', ok: Array.isArray(receipt.command) && receipt.command.length > 0 });

  await checkStream('stdout', receipt.stdout.path, receipt.stdout.sha256, receipt.stdout.bytes);
  await checkStream('stderr', receipt.stderr.path, receipt.stderr.sha256, receipt.stderr.bytes);

  return {
    ok: checks.every((check) => check.ok),
    receiptPath: absoluteReceiptPath,
    checks,
    receipt
  };

  async function checkStream(name: string, streamPath: string, expectedHash: string, expectedBytes: number): Promise<void> {
    try {
      const actual = await hashFile(path.resolve(receipt.cwd, streamPath));
      checks.push({
        name: `${name}.sha256`,
        ok: actual.sha256 === expectedHash,
        expected: expectedHash,
        actual: actual.sha256
      });
      checks.push({
        name: `${name}.bytes`,
        ok: actual.bytes === expectedBytes,
        expected: expectedBytes,
        actual: actual.bytes
      });
    } catch (error) {
      checks.push({
        name,
        ok: false,
        expected: `${expectedBytes} bytes sha256:${expectedHash}`,
        actual: error instanceof Error ? error.message : 'unknown read error'
      });
    }
  }
}
