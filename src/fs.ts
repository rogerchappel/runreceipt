import { mkdir, readFile, readdir, stat, writeFile } from 'node:fs/promises';
import path from 'node:path';

export async function ensureDir(dir: string): Promise<void> {
  await mkdir(dir, { recursive: true });
}

export async function writeJson(filePath: string, value: unknown): Promise<void> {
  await writeFile(filePath, `${JSON.stringify(value, null, 2)}\n`, 'utf8');
}

export async function readJson<T>(filePath: string): Promise<T> {
  return JSON.parse(await readFile(filePath, 'utf8')) as T;
}

export async function listReceiptFiles(rootDir: string): Promise<string[]> {
  const runsDir = path.join(rootDir, 'runs');
  const entries = await readdir(runsDir, { withFileTypes: true }).catch(() => []);
  const files: string[] = [];

  for (const entry of entries) {
    if (!entry.isDirectory()) {
      continue;
    }

    const candidate = path.join(runsDir, entry.name, 'receipt.json');
    try {
      const info = await stat(candidate);
      if (info.isFile()) {
        files.push(candidate);
      }
    } catch {
      // Missing or partial run directories are ignored by list.
    }
  }

  return files.sort();
}
