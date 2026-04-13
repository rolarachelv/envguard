import { SchemaField } from '../schema/parser';

export type DiffStatus = 'added' | 'removed' | 'changed' | 'unchanged';

export interface DiffEntry {
  key: string;
  status: DiffStatus;
  baseValue?: string;
  compareValue?: string;
  required?: boolean;
}

export interface EnvDiffResult {
  entries: DiffEntry[];
  addedCount: number;
  removedCount: number;
  changedCount: number;
  unchangedCount: number;
}

/**
 * Compares two env variable maps and returns a structured diff result.
 */
export function diffEnvFiles(
  base: Record<string, string>,
  compare: Record<string, string>,
  schema?: Record<string, SchemaField>
): EnvDiffResult {
  const allKeys = new Set([...Object.keys(base), ...Object.keys(compare)]);
  const entries: DiffEntry[] = [];

  for (const key of allKeys) {
    const baseValue = base[key];
    const compareValue = compare[key];
    const required = schema?.[key]?.required;

    let status: DiffStatus;
    if (baseValue === undefined) {
      status = 'added';
    } else if (compareValue === undefined) {
      status = 'removed';
    } else if (baseValue !== compareValue) {
      status = 'changed';
    } else {
      status = 'unchanged';
    }

    entries.push({ key, status, baseValue, compareValue, required });
  }

  entries.sort((a, b) => a.key.localeCompare(b.key));

  return {
    entries,
    addedCount: entries.filter((e) => e.status === 'added').length,
    removedCount: entries.filter((e) => e.status === 'removed').length,
    changedCount: entries.filter((e) => e.status === 'changed').length,
    unchangedCount: entries.filter((e) => e.status === 'unchanged').length,
  };
}
