import { EnvMap } from '../env/loader';

export type TransformRule = {
  key: string;
  operation: 'uppercase' | 'lowercase' | 'trim' | 'prefix' | 'suffix' | 'replace';
  value?: string;
  from?: string;
  to?: string;
};

export type TransformResult = {
  key: string;
  original: string;
  transformed: string;
  operation: TransformRule['operation'];
};

export function applyTransform(value: string, rule: TransformRule): string {
  switch (rule.operation) {
    case 'uppercase':
      return value.toUpperCase();
    case 'lowercase':
      return value.toLowerCase();
    case 'trim':
      return value.trim();
    case 'prefix':
      return `${rule.value ?? ''}${value}`;
    case 'suffix':
      return `${value}${rule.value ?? ''}`;
    case 'replace':
      if (rule.from === undefined || rule.to === undefined) return value;
      return value.split(rule.from).join(rule.to);
    default:
      return value;
  }
}

export function transformEnv(
  env: EnvMap,
  rules: TransformRule[]
): { result: EnvMap; changes: TransformResult[] } {
  const result: EnvMap = { ...env };
  const changes: TransformResult[] = [];

  for (const rule of rules) {
    const original = env[rule.key];
    if (original === undefined) continue;

    const transformed = applyTransform(original, rule);
    if (transformed !== original) {
      result[rule.key] = transformed;
      changes.push({ key: rule.key, original, transformed, operation: rule.operation });
    }
  }

  return { result, changes };
}
