import * as fs from 'fs';
import * as path from 'path';
import { parseEnvContent } from '../env/loader';

export type MergeStrategy = 'first-wins' | 'last-wins' | 'error-on-conflict';

export interface MergeConflict {
  key: string;
  values: string[];
  sources: string[];
}

export interface MergeResult {
  merged: Record<string, string>;
  conflicts: MergeConflict[];
  sources: string[];
}

export function mergeEnvFiles(
  filePaths: string[],
  strategy: MergeStrategy = 'last-wins'
): MergeResult {
  const sources: string[] = filePaths.map((f) => path.basename(f));
  const maps: Record<string, string>[] = filePaths.map((f) => {
    const content = fs.readFileSync(f, 'utf-8');
    return parseEnvContent(content);
  });

  const merged: Record<string, string> = {};
  const conflictMap: Record<string, { values: string[]; sources: string[] }> = {};

  for (let i = 0; i < maps.length; i++) {
    const envMap = maps[i];
    const source = sources[i];
    for (const [key, value] of Object.entries(envMap)) {
      if (key in merged && merged[key] !== value) {
        if (!conflictMap[key]) {
          conflictMap[key] = { values: [merged[key]], sources: [] };
          // find first source that set this key
          for (let j = 0; j < i; j++) {
            if (key in maps[j]) {
              conflictMap[key].sources.push(sources[j]);
              break;
            }
          }
        }
        conflictMap[key].values.push(value);
        conflictMap[key].sources.push(source);

        if (strategy === 'error-on-conflict') {
          throw new Error(
            `Merge conflict on key "${key}" between ${conflictMap[key].sources.join(', ')}`
          );
        } else if (strategy === 'last-wins') {
          merged[key] = value;
        }
        // 'first-wins': keep existing value
      } else {
        merged[key] = value;
      }
    }
  }

  const conflicts: MergeConflict[] = Object.entries(conflictMap).map(
    ([key, { values, sources: s }]) => ({ key, values, sources: s })
  );

  return { merged, conflicts, sources };
}
