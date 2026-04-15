import { loadEnvFile } from '../env/loader';

export interface PromoteOptions {
  overwrite: boolean;
  keys?: string[];
}

export interface PromoteResult {
  promoted: Array<{ key: string; fromValue: string; toValue: string | undefined }>;
  skipped: Array<{ key: string; reason: string }>;
  merged: Record<string, string>;
}

export function promoteEnv(
  sourceEnv: Record<string, string>,
  targetEnv: Record<string, string>,
  options: PromoteOptions
): PromoteResult {
  const promoted: PromoteResult['promoted'] = [];
  const skipped: PromoteResult['skipped'] = [];

  const keysToPromote = options.keys && options.keys.length > 0
    ? options.keys
    : Object.keys(sourceEnv);

  const merged: Record<string, string> = { ...targetEnv };

  for (const key of keysToPromote) {
    if (!(key in sourceEnv)) {
      skipped.push({ key, reason: 'key not found in source' });
      continue;
    }

    const fromValue = sourceEnv[key];
    const toValue = targetEnv[key];

    if (toValue !== undefined && !options.overwrite) {
      skipped.push({ key, reason: 'key already exists in target (use --overwrite to replace)' });
      continue;
    }

    promoted.push({ key, fromValue, toValue });
    merged[key] = fromValue;
  }

  return { promoted, skipped, merged };
}

export function serializePromotedEnv(env: Record<string, string>): string {
  return Object.entries(env)
    .map(([key, value]) => `${key}=${value}`)
    .join('\n') + '\n';
}
