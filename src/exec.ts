import { spawn } from 'node:child_process';
import { copyFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { createWriteStream } from 'node:fs';
import { captureEnvironment } from './env.js';
import { ensureDir, writeJson } from './fs.js';
import { formatCommand, renderMarkdown } from './format.js';
import { hashFile } from './hash.js';
import type { ExecOptions, RunReceipt } from './types.js';

export async function execWithReceipt(options: ExecOptions): Promise<RunReceipt> {
  if (options.command.length === 0) {
    throw new Error('No command provided. Use: runreceipt exec -- <command> [args...]');
  }

  const start = new Date();
  const id = buildRunId(start);
  const rootDir = path.resolve(options.cwd, options.outDir);
  const runDir = path.join(rootDir, 'runs', id);
  await ensureDir(runDir);

  const stdoutPath = path.join(runDir, 'stdout.txt');
  const stderrPath = path.join(runDir, 'stderr.txt');
  const stdoutStream = createWriteStream(stdoutPath);
  const stderrStream = createWriteStream(stderrPath);

  const childResult = await new Promise<{ exitCode: number | null; signal: NodeJS.Signals | null }>((resolve, reject) => {
    const child = spawn(options.command[0] ?? '', options.command.slice(1), {
      cwd: options.cwd,
      env: process.env,
      stdio: ['inherit', 'pipe', 'pipe']
    });

    child.stdout?.on('data', (chunk: Buffer) => {
      process.stdout.write(chunk);
      stdoutStream.write(chunk);
    });
    child.stderr?.on('data', (chunk: Buffer) => {
      process.stderr.write(chunk);
      stderrStream.write(chunk);
    });
    child.once('error', reject);
    child.once('exit', (exitCode, signal) => resolve({ exitCode, signal }));
  });

  await Promise.all([closeStream(stdoutStream), closeStream(stderrStream)]);

  const end = new Date();
  const stdout = await hashFile(stdoutPath);
  const stderr = await hashFile(stderrPath);
  const jsonPath = path.join(runDir, 'receipt.json');
  const markdownPath = path.join(runDir, 'receipt.md');
  const receipt: RunReceipt = {
    schemaVersion: 1,
    id,
    command: options.command,
    commandDisplay: formatCommand(options.command),
    cwd: options.cwd,
    startTime: start.toISOString(),
    endTime: end.toISOString(),
    durationMs: end.getTime() - start.getTime(),
    exitCode: childResult.exitCode,
    signal: childResult.signal,
    env: captureEnvironment(process.env, options.envAllowlist, options.redactKeys),
    stdout: {
      path: path.relative(options.cwd, stdoutPath),
      bytes: stdout.bytes,
      sha256: stdout.sha256
    },
    stderr: {
      path: path.relative(options.cwd, stderrPath),
      bytes: stderr.bytes,
      sha256: stderr.sha256
    },
    receipt: {
      jsonPath: path.relative(options.cwd, jsonPath),
      markdownPath: path.relative(options.cwd, markdownPath)
    }
  };

  await writeJson(jsonPath, receipt);
  await writeFile(markdownPath, renderMarkdown(receipt), 'utf8');
  await copyFile(jsonPath, path.join(rootDir, 'latest.json'));
  await copyFile(markdownPath, path.join(rootDir, 'latest.md'));

  return receipt;
}

function buildRunId(start: Date): string {
  const stamp = start.toISOString().replaceAll(':', '').replaceAll('.', '-');
  const suffix = Math.random().toString(36).slice(2, 8);
  return `${stamp}-${suffix}`;
}

async function closeStream(stream: NodeJS.WritableStream): Promise<void> {
  await new Promise<void>((resolve, reject) => {
    stream.once('error', reject);
    stream.end(resolve);
  });
}
