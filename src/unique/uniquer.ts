import { EnvMap } from "../env/loader";

export interface UniqueResult {
  key: string;
  value: string;
  duplicateValues: string[];
  occurrences: number;
}

export interface UniqueEnvResult {
  unique: Record<string, string>;
  duplicates: UniqueResult[];
}

/**
 * Finds keys whose values are duplicated across the env map.
 * Two keys are considered value-duplicates if they share the same trimmed value.
 */
export function findValueDuplicates(env: EnvMap): UniqueResult[] {
  const valueToKeys: Record<string, string[]> = {};

  for (const [key, value] of Object.entries(env)) {
    const normalized = value.trim();
    if (!valueToKeys[normalized]) {
      valueToKeys[normalized] = [];
    }
    valueToKeys[normalized].push(key);
  }

  const results: UniqueResult[] = [];

  for (const [value, keys] of Object.entries(valueToKeys)) {
    if (keys.length > 1) {
      for (const key of keys) {
        results.push({
          key,
          value,
          duplicateValues: keys.filter((k) => k !== key),
          occurrences: keys.length,
        });
      }
    }
  }

  return results.sort((a, b) => a.key.localeCompare(b.key));
}

/**
 * Returns only keys with unique values (no two keys share the same value).
 */
export function uniqueEnv(env: EnvMap): UniqueEnvResult {
  const duplicates = findValueDuplicates(env);
  const duplicateKeys = new Set(duplicates.map((d) => d.key));

  const unique: Record<string, string> = {};
  for (const [key, value] of Object.entries(env)) {
    if (!duplicateKeys.has(key)) {
      unique[key] = value;
    }
  }

  return { unique, duplicates };
}
