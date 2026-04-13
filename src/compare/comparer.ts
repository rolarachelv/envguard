import { loadEnvFile } from '../env/loader';

export interface CompareResult {
  key: string;
  status: 'match' | 'mismatch' | 'missing_in_b' | 'missing_in_a';
  valueA?: string;
  valueB?: string;
}

export interface EnvCompareReport {
  fileA: string;
  fileB: string;
  results: CompareResult[];
  totalKeys: number;
  matchCount: number;
  mismatchCount: number;
  missingInACount: number;
  missingInBCount: number;
}

export function compareEnvFiles(
  fileA: string,
  fileB: string
): EnvCompareReport {
  const envA = loadEnvFile(fileA);
  const envB = loadEnvFile(fileB);

  const allKeys = new Set([...Object.keys(envA), ...Object.keys(envB)]);
  const results: CompareResult[] = [];

  for (const key of allKeys) {
    const inA = key in envA;
    const inB = key in envB;

    if (inA && inB) {
      results.push({
        key,
        status: envA[key] === envB[key] ? 'match' : 'mismatch',
        valueA: envA[key],
        valueB: envB[key],
      });
    } else if (inA && !inB) {
      results.push({ key, status: 'missing_in_b', valueA: envA[key] });
    } else {
      results.push({ key, status: 'missing_in_a', valueB: envB[key] });
    }
  }

  results.sort((a, b) => a.key.localeCompare(b.key));

  return {
    fileA,
    fileB,
    results,
    totalKeys: allKeys.size,
    matchCount: results.filter(r => r.status === 'match').length,
    mismatchCount: results.filter(r => r.status === 'mismatch').length,
    missingInACount: results.filter(r => r.status === 'missing_in_a').length,
    missingInBCount: results.filter(r => r.status === 'missing_in_b').length,
  };
}
