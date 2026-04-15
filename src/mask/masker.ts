export type MaskMode = 'full' | 'partial' | 'hash';

export interface MaskOptions {
  mode?: MaskMode;
  visibleChars?: number;
  maskChar?: string;
}

export interface MaskedEntry {
  key: string;
  original: string;
  masked: string;
  wasMasked: boolean;
}

export interface MaskResult {
  entries: MaskedEntry[];
  totalMasked: number;
}

import { createHash } from 'crypto';

export function maskValue(
  value: string,
  options: MaskOptions = {}
): string {
  const { mode = 'full', visibleChars = 4, maskChar = '*' } = options;

  if (value.length === 0) return value;

  switch (mode) {
    case 'full':
      return maskChar.repeat(value.length);
    case 'partial': {
      if (value.length <= visibleChars) return maskChar.repeat(value.length);
      const visible = value.slice(-visibleChars);
      return maskChar.repeat(value.length - visibleChars) + visible;
    }
    case 'hash':
      return createHash('sha256').update(value).digest('hex').slice(0, 8);
    default:
      return maskChar.repeat(value.length);
  }
}

export function maskEnv(
  env: Record<string, string>,
  keys: string[],
  options: MaskOptions = {}
): MaskResult {
  const entries: MaskedEntry[] = Object.entries(env).map(([key, original]) => {
    const wasMasked = keys.includes(key);
    const masked = wasMasked ? maskValue(original, options) : original;
    return { key, original, masked, wasMasked };
  });

  return {
    entries,
    totalMasked: entries.filter((e) => e.wasMasked).length,
  };
}
