import { loadEnvFile } from '../env/loader';

export type DiffStatus = 'changed' | 'unchanged' | 'missing_in_a' | 'missing_in_b';

export interface DiffResult {
  key: string;
  status: DiffStatus;
  valueA: string | undefined;
  valueB: string | undefined;
}

/**
 * Compares two .env files and returns a list of differences.
 * @param pathA - Path to the first (base) .env file
 * @param pathB - Path to the second (target) .env file
 */
export function diffEnvFiles(pathA: string, pathB: string): DiffResult[] {
  const envA = loadEnvFile(pathA);
  const envB = loadEnvFile(pathB);

  const allKeys = new Set([...Object.keys(envA), ...Object.keys(envB)]);
  const results: DiffResult[] = [];

  for (const key of allKeys) {
    const valA = envA[key];
    const valB = envB[key];

    let status: DiffStatus;

    if (valA === undefined) {
      status = 'missing_in_a';
    } else if (valB === undefined) {
      status = 'missing_in_b';
    } else if (valA !== valB) {
      status = 'changed';
    } else {
      status = 'unchanged';
    }

    results.push({ key, status, valueA: valA, valueB: valB });
  }

  return results.sort((a, b) => a.key.localeCompare(b.key));
}
