export interface DedupeResult {
  entries: Record<string, string>;
  duplicates: Array<{ key: string; values: string[]; kept: string }>;
}

export type DedupeStrategy = 'first' | 'last';

export function dedupeEnv(
  raw: string,
  strategy: DedupeStrategy = 'last'
): DedupeResult {
  const lines = raw.split('\n');
  const seen = new Map<string, string[]>();

  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const eqIdx = trimmed.indexOf('=');
    if (eqIdx === -1) continue;
    const key = trimmed.slice(0, eqIdx).trim();
    const value = trimmed.slice(eqIdx + 1).trim();
    if (!seen.has(key)) seen.set(key, []);
    seen.get(key)!.push(value);
  }

  const entries: Record<string, string> = {};
  const duplicates: DedupeResult['duplicates'] = [];

  for (const [key, values] of seen.entries()) {
    const kept = strategy === 'first' ? values[0] : values[values.length - 1];
    entries[key] = kept;
    if (values.length > 1) {
      duplicates.push({ key, values, kept });
    }
  }

  return { entries, duplicates };
}
