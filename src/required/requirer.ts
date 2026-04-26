import { EnvMap } from '../env/loader';

export interface RequiredResult {
  key: string;
  present: boolean;
  value?: string;
}

export interface RequiredSummary {
  results: RequiredResult[];
  missingCount: number;
  presentCount: number;
  allPresent: boolean;
}

/**
 * Checks whether all specified required keys exist in the env map.
 * A key is considered present if it exists and has a non-empty value.
 */
export function checkRequired(
  env: EnvMap,
  keys: string[]
): RequiredSummary {
  const results: RequiredResult[] = keys.map((key) => {
    const value = env[key];
    const present = value !== undefined && value.trim() !== '';
    return { key, present, value: present ? value : undefined };
  });

  const missingCount = results.filter((r) => !r.present).length;
  const presentCount = results.filter((r) => r.present).length;

  return {
    results,
    missingCount,
    presentCount,
    allPresent: missingCount === 0,
  };
}
