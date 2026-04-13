import * as fs from 'fs';
import * as path from 'path';

export interface MigrationEntry {
  key: string;
  oldValue: string | undefined;
  newValue: string | undefined;
  action: 'add' | 'remove' | 'rename' | 'update';
}

export interface MigrationPlan {
  source: string;
  target: string;
  entries: MigrationEntry[];
  timestamp: string;
}

export function buildMigrationPlan(
  sourceEnv: Record<string, string>,
  targetEnv: Record<string, string>,
  renames: Record<string, string> = {}
): MigrationEntry[] {
  const entries: MigrationEntry[] = [];
  const renamedOldKeys = new Set(Object.keys(renames));
  const renamedNewKeys = new Set(Object.values(renames));

  for (const [oldKey, newKey] of Object.entries(renames)) {
    entries.push({
      key: newKey,
      oldValue: sourceEnv[oldKey],
      newValue: targetEnv[newKey] ?? sourceEnv[oldKey],
      action: 'rename',
    });
  }

  for (const key of Object.keys(sourceEnv)) {
    if (renamedOldKeys.has(key)) continue;
    if (!(key in targetEnv)) {
      entries.push({ key, oldValue: sourceEnv[key], newValue: undefined, action: 'remove' });
    } else if (sourceEnv[key] !== targetEnv[key]) {
      entries.push({ key, oldValue: sourceEnv[key], newValue: targetEnv[key], action: 'update' });
    }
  }

  for (const key of Object.keys(targetEnv)) {
    if (renamedNewKeys.has(key)) continue;
    if (!(key in sourceEnv)) {
      entries.push({ key, oldValue: undefined, newValue: targetEnv[key], action: 'add' });
    }
  }

  return entries;
}

export function applyMigration(
  sourceEnv: Record<string, string>,
  plan: MigrationEntry[]
): Record<string, string> {
  const result: Record<string, string> = { ...sourceEnv };

  for (const entry of plan) {
    if (entry.action === 'remove') {
      delete result[entry.key];
    } else if (entry.action === 'add' || entry.action === 'update') {
      if (entry.newValue !== undefined) result[entry.key] = entry.newValue;
    } else if (entry.action === 'rename') {
      const oldKey = Object.entries({}).find(([, v]) => v === entry.key)?.[0];
      if (entry.newValue !== undefined) result[entry.key] = entry.newValue;
    }
  }

  return result;
}

export function serializeMigratedEnv(env: Record<string, string>): string {
  return Object.entries(env)
    .map(([k, v]) => `${k}=${v}`)
    .join('\n') + '\n';
}
