#!/usr/bin/env node
import path from 'node:path';
import { execWithReceipt } from './exec.js';
import { parseCsv } from './env.js';
import { listReceiptFiles, readJson } from './fs.js';
import { renderList, renderShow, renderVerify } from './format.js';
import { verifyReceipt } from './verify.js';
import type { RunReceipt } from './types.js';

type ParsedGlobal = {
  json: boolean;
  args: string[];
};

async function main(argv: string[]): Promise<number> {
  const [command, ...rest] = argv;

  if (!command || command === '-h' || command === '--help') {
    printHelp();
    return 0;
  }

  if (command === '--version' || command === '-v') {
    console.log('0.1.0');
    return 0;
  }

  if (command === 'exec') {
    return runExec(rest);
  }

  if (command === 'show') {
    return runShow(rest);
  }

  if (command === 'verify') {
    return runVerify(rest);
  }

  if (command === 'list') {
    return runList(rest);
  }

  throw new Error(`Unknown command "${command}". Run runreceipt --help.`);
}

async function runExec(args: string[]): Promise<number> {
  const envFlags: string[] = [];
  const redactFlags: string[] = [];
  let outDir = '.runreceipt';
  const commandStart = args.indexOf('--');
  const optionArgs = commandStart >= 0 ? args.slice(0, commandStart) : [];
  const command = commandStart >= 0 ? args.slice(commandStart + 1) : args;

  for (let index = 0; index < optionArgs.length; index += 1) {
    const arg = optionArgs[index];
    if (arg === '--out-dir') {
      outDir = requireValue(optionArgs, ++index, '--out-dir');
    } else if (arg === '--env') {
      envFlags.push(requireValue(optionArgs, ++index, '--env'));
    } else if (arg === '--redact') {
      redactFlags.push(requireValue(optionArgs, ++index, '--redact'));
    } else {
      throw new Error(`Unknown exec option "${arg}".`);
    }
  }

  const receipt = await execWithReceipt({
    command,
    cwd: process.cwd(),
    outDir,
    envAllowlist: parseCsv(envFlags),
    redactKeys: parseCsv(redactFlags)
  });
  console.error(`runreceipt: wrote ${receipt.receipt.jsonPath}`);
  return receipt.exitCode ?? (receipt.signal ? 128 : 1);
}

async function runShow(args: string[]): Promise<number> {
  const parsed = parseGlobal(args);
  const receiptPath = parsed.args[0] ?? path.join('.runreceipt', 'latest.json');
  const receipt = await readJson<RunReceipt>(receiptPath);
  console.log(parsed.json ? JSON.stringify(receipt, null, 2) : renderShow(receipt));
  return 0;
}

async function runVerify(args: string[]): Promise<number> {
  const parsed = parseGlobal(args);
  const receiptPath = parsed.args[0] ?? path.join('.runreceipt', 'latest.json');
  const result = await verifyReceipt(receiptPath);
  console.log(parsed.json ? JSON.stringify(result, null, 2) : renderVerify(result));
  return result.ok ? 0 : 1;
}

async function runList(args: string[]): Promise<number> {
  const parsed = parseGlobal(args);
  let rootDir = '.runreceipt';

  for (let index = 0; index < parsed.args.length; index += 1) {
    const arg = parsed.args[index];
    if (arg === '--dir') {
      rootDir = requireValue(parsed.args, ++index, '--dir');
    } else {
      throw new Error(`Unknown list option "${arg}".`);
    }
  }

  const receipts = await Promise.all((await listReceiptFiles(rootDir)).map((file) => readJson<RunReceipt>(file)));
  receipts.sort((left, right) => left.startTime.localeCompare(right.startTime));
  console.log(parsed.json ? JSON.stringify(receipts, null, 2) : renderList(receipts, rootDir));
  return 0;
}

function parseGlobal(args: string[]): ParsedGlobal {
  const rest: string[] = [];
  let json = false;

  for (const arg of args) {
    if (arg === '--json') {
      json = true;
    } else {
      rest.push(arg);
    }
  }

  return { json, args: rest };
}

function requireValue(args: string[], index: number, flag: string): string {
  const value = args[index];
  if (!value) {
    throw new Error(`${flag} requires a value.`);
  }
  return value;
}

function printHelp(): void {
  console.log(`runreceipt

Usage:
  runreceipt exec [--env KEY[,KEY]] [--redact KEY[,KEY]] [--out-dir DIR] -- <command> [args...]
  runreceipt show [--json] [receipt.json]
  runreceipt verify [--json] [receipt.json]
  runreceipt list [--json] [--dir .runreceipt]
`);
}

main(process.argv.slice(2)).then((code) => {
  process.exitCode = code;
}).catch((error: unknown) => {
  console.error(error instanceof Error ? error.message : String(error));
  process.exitCode = 1;
});
