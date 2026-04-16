export interface TrimResult {
  key: string;
  original: string;
  trimmed: string;
  changed: boolean;
}

export interface TrimOutput {
  results: TrimResult[];
  changedCount: number;
}

export type TrimMode = 'both' | 'leading' | 'trailing';

export function trimValue(value: string, mode: TrimMode = 'both'): string {
  switch (mode) {
    case 'leading':
      return value.trimStart();
    case 'trailing':
      return value.trimEnd();
    case 'both':
    default:
      return value.trim();
  }
}

export function trimEnv(
  env: Record<string, string>,
  mode: TrimMode = 'both'
): TrimOutput {
  const results: TrimResult[] = [];

  for (const [key, original] of Object.entries(env)) {
    const trimmed = trimValue(original, mode);
    const changed = trimmed !== original;
    results.push({ key, original, trimmed, changed });
  }

  return {
    results,
    changedCount: results.filter((r) => r.changed).length,
  };
}

export function serializeTrimmedEnv(results: TrimResult[]): string {
  return results
    .map(({ key, trimmed }) => `${key}=${trimmed}`)
    .join('\n');
}
