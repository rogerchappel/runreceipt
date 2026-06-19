import assert from 'node:assert/strict';
import { mkdtemp, readFile, rm, unlink, writeFile } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import test from 'node:test';
import { execWithReceipt, renderList, verifyReceipt } from '../dist/index.js';

test('execWithReceipt captures output, hashes, env, and child exit code', async () => {
  const cwd = await mkdtemp(path.join(os.tmpdir(), 'runreceipt-'));

  try {
    const receipt = await execWithReceipt({
      command: [process.execPath, '-e', 'console.log("hello"); console.error("warn"); process.exit(7);'],
      cwd,
      outDir: '.runreceipt',
      envAllowlist: ['PATH'],
      redactKeys: []
    });

    assert.equal(receipt.exitCode, 7);
    assert.equal(receipt.command[0], process.execPath);
    assert.equal(receipt.cwd, cwd);
    assert.ok(receipt.stdout.bytes > 0);
    assert.ok(receipt.stderr.bytes > 0);
    assert.match(receipt.stdout.sha256, /^[a-f0-9]{64}$/);
    assert.match(receipt.stderr.sha256, /^[a-f0-9]{64}$/);
    assert.equal((await readFile(path.join(cwd, receipt.stdout.path), 'utf8')).trim(), 'hello');
    assert.equal((await readFile(path.join(cwd, receipt.stderr.path), 'utf8')).trim(), 'warn');

    const latestResult = await verifyReceipt(path.join(cwd, '.runreceipt', 'latest.json'));
    const runResult = await verifyReceipt(path.join(cwd, receipt.receipt.jsonPath));
    assert.equal(latestResult.ok, true);
    assert.equal(runResult.ok, true);

    const listOutput = renderList([receipt], path.join(cwd, '.runreceipt'));
    assert.match(listOutput, /\.runreceipt\/runs\/.+\/receipt\.json$/);
  } finally {
    await rm(cwd, { recursive: true, force: true });
  }
});

test('verifyReceipt reports tampered output', async () => {
  const cwd = await mkdtemp(path.join(os.tmpdir(), 'runreceipt-'));

  try {
    const receipt = await execWithReceipt({
      command: [process.execPath, '-e', 'process.stdout.write("original")'],
      cwd,
      outDir: '.runreceipt',
      envAllowlist: [],
      redactKeys: []
    });

    await writeFile(path.join(cwd, receipt.stdout.path), 'tampered', 'utf8');
    const result = await verifyReceipt(path.join(cwd, receipt.receipt.jsonPath));

    assert.equal(result.ok, false);
    assert.ok(result.checks.some((check) => check.name === 'stdout.sha256' && !check.ok));
  } finally {
    await rm(cwd, { recursive: true, force: true });
  }
});

test('verifyReceipt reports missing markdown artifact', async () => {
  const cwd = await mkdtemp(path.join(os.tmpdir(), 'runreceipt-'));

  try {
    const receipt = await execWithReceipt({
      command: [process.execPath, '-e', 'process.stdout.write("ok")'],
      cwd,
      outDir: '.runreceipt',
      envAllowlist: [],
      redactKeys: []
    });

    await unlink(path.join(cwd, receipt.receipt.markdownPath));
    const result = await verifyReceipt(path.join(cwd, receipt.receipt.jsonPath));

    assert.equal(result.ok, false);
    assert.ok(result.checks.some((check) => check.name === 'receipt.markdownPath' && !check.ok));
  } finally {
    await rm(cwd, { recursive: true, force: true });
  }
});

test('verifyReceipt reports impossible timing metadata', async () => {
  const cwd = await mkdtemp(path.join(os.tmpdir(), 'runreceipt-'));

  try {
    const receipt = await execWithReceipt({
      command: [process.execPath, '-e', 'process.stdout.write("ok")'],
      cwd,
      outDir: '.runreceipt',
      envAllowlist: [],
      redactKeys: []
    });
    const receiptPath = path.join(cwd, receipt.receipt.jsonPath);
    const tampered = {
      ...receipt,
      startTime: '2026-06-20T10:00:00.000Z',
      endTime: '2026-06-20T09:59:59.000Z',
      durationMs: -1
    };
    await writeFile(receiptPath, JSON.stringify(tampered, null, 2), 'utf8');

    const result = await verifyReceipt(receiptPath);

    assert.equal(result.ok, false);
    assert.ok(result.checks.some((check) => check.name === 'timeRange' && !check.ok));
    assert.ok(result.checks.some((check) => check.name === 'durationMs' && !check.ok));
  } finally {
    await rm(cwd, { recursive: true, force: true });
  }
});
