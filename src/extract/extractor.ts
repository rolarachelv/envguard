import { EnvMap } from '../env/loader';

export interface ExtractOptions {
  keys: string[];
  strict?: boolean;
}

export interface ExtractResult {
  extracted: EnvMap;
  missing: string[];
  found: string[];
}

export function extractEnv(env: EnvMap, options: ExtractOptions): ExtractResult {
  const { keys, strict = false } = options;
  const extracted: EnvMap = {};
  const missing: string[] = [];
  const found: string[] = [];

  for (const key of keys) {
    if (Object.prototype.hasOwnProperty.call(env, key)) {
      extracted[key] = env[key];
      found.push(key);
    } else {
      missing.push(key);
      if (strict) {
        throw new Error(`Key "${key}" not found in environment`);
      }
    }
  }

  return { extracted, missing, found };
}

export function serializeExtractedEnv(extracted: EnvMap): string {
  return Object.entries(extracted)
    .map(([key, value]) => `${key}=${value}`)
    .join('\n');
}
