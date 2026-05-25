const DEFAULT_REDACT_PATTERNS = [/secret/i, /token/i, /password/i, /passwd/i, /credential/i, /api[_-]?key/i];

export function parseCsv(values: string[]): string[] {
  return values
    .flatMap((value) => value.split(','))
    .map((value) => value.trim())
    .filter(Boolean);
}

export function captureEnvironment(
  source: NodeJS.ProcessEnv,
  allowlist: string[],
  redactKeys: string[]
): { allowed: string[]; redacted: string[]; values: Record<string, string> } {
  const uniqueAllowed = [...new Set(allowlist)].sort();
  const uniqueRedact = [...new Set(redactKeys)].sort();
  const values: Record<string, string> = {};
  const redacted = new Set<string>();

  for (const key of uniqueAllowed) {
    if (source[key] === undefined) {
      continue;
    }

    if (shouldRedact(key, uniqueRedact)) {
      values[key] = '[REDACTED]';
      redacted.add(key);
    } else {
      values[key] = String(source[key]);
    }
  }

  return {
    allowed: uniqueAllowed,
    redacted: [...redacted].sort(),
    values
  };
}

function shouldRedact(key: string, explicitRedactKeys: string[]): boolean {
  return explicitRedactKeys.includes(key) || DEFAULT_REDACT_PATTERNS.some((pattern) => pattern.test(key));
}
