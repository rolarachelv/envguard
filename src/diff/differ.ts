import * as fs from 'fs';
import { parseEnvContent } from '../env/loader';

export interface DiffEntry {
  key: string;
  status: 'added' | 'removed' | 'changed' | 'unchanged';
  oldValue?: string;
  newValue?: string;
}

export interface DiffResult {
  baseFile: string;
  compareFile: string;
  entries: DiffEntry[];
  addedCount: number;
  removedCount: number;
  changedCount: number;
  unchangedCount: number;
}

export function diffEnvFiles(basePath: string, comparePath: string): DiffResult {
  const baseContent = fs.readFileSync(basePath, 'utf-8');
  const compareContent = fs.readFileSync(comparePath, 'utf-8');

  const baseEnv = parseEnvContent(baseContent);
  const compareEnv = parseEnvContent(compareContent);

  const allKeys = new Set([...Object.keys(baseEnv), ...Object.keys(compareEnv)]);
  const entries: DiffEntry[] = [];

  for (const key of allKeys) {
    const inBase = key in baseEnv;
    const inCompare = key in compareEnv;

    if (inBase && !inCompare) {
      entries.push({ key, status: 'removed', oldValue: baseEnv[key] });
    } else if (!inBase && inCompare) {
      entries.push({ key, status: 'added', newValue: compareEnv[key] });
    } else if (baseEnv[key] !== compareEnv[key]) {
      entries.push({ key, status: 'changed', oldValue: baseEnv[key], newValue: compareEnv[key] });
    } else {
      entries.push({ key, status: 'unchanged', oldValue: baseEnv[key], newValue: compareEnv[key] });
    }
  }

  entries.sort((a, b) => a.key.localeCompare(b.key));

  return {
    baseFile: basePath,
    compareFile: comparePath,
    entries,
    addedCount: entries.filter(e => e.status === 'added').length,
    removedCount: entries.filter(e => e.status === 'removed').length,
    changedCount: entries.filter(e => e.status === 'changed').length,
    unchangedCount: entries.filter(e => e.status === 'unchanged').length,
  };
}
