export type ReceiptStream = {
  path: string;
  bytes: number;
  sha256: string;
};

export type ReceiptEnvironment = {
  allowed: string[];
  redacted: string[];
  values: Record<string, string>;
};

export type RunReceipt = {
  schemaVersion: 1;
  id: string;
  command: string[];
  commandDisplay: string;
  cwd: string;
  startTime: string;
  endTime: string;
  durationMs: number;
  exitCode: number | null;
  signal: NodeJS.Signals | null;
  env: ReceiptEnvironment;
  stdout: ReceiptStream;
  stderr: ReceiptStream;
  receipt: {
    jsonPath: string;
    markdownPath: string;
  };
};

export type ExecOptions = {
  command: string[];
  cwd: string;
  outDir: string;
  envAllowlist: string[];
  redactKeys: string[];
};

export type VerifyResult = {
  ok: boolean;
  receiptPath: string;
  checks: Array<{
    name: string;
    ok: boolean;
    expected?: string | number;
    actual?: string | number;
  }>;
  receipt?: RunReceipt;
};
