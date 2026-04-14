import { EnvMap } from '../env/loader';

export interface RenameRule {
  from: string;
  to: string;
}

export interface RenameResult {
  renamed: Array<{ from: string; to: string; value: string }>;
  notFound: string[];
  conflicts: string[];
  output: EnvMap;
}

export function renameEnvKeys(
  env: EnvMap,
  rules: RenameRule[]
): RenameResult {
  const renamed: RenameResult['renamed'] = [];
  const notFound: string[] = [];
  const conflicts: string[] = [];
  const output: EnvMap = { ...env };

  for (const rule of rules) {
    const { from, to } = rule;

    if (!(from in output)) {
      notFound.push(from);
      continue;
    }

    if (to in output && to !== from) {
      conflicts.push(to);
      continue;
    }

    const value = output[from];
    delete output[from];
    output[to] = value;
    renamed.push({ from, to, value });
  }

  return { renamed, notFound, conflicts, output };
}
