import { EnvMap } from '../env/loader';
import { SchemaField } from '../schema/parser';

export interface DefaultResult {
  key: string;
  originalValue: string | undefined;
  appliedValue: string;
  wasApplied: boolean;
}

export interface DefaultsOutput {
  env: EnvMap;
  results: DefaultResult[];
}

export function applyDefaults(
  env: EnvMap,
  schema: Record<string, SchemaField>
): DefaultsOutput {
  const result: EnvMap = { ...env };
  const results: DefaultResult[] = [];

  for (const [key, field] of Object.entries(schema)) {
    const hasValue = key in env && env[key] !== undefined && env[key] !== '';
    const hasDefault = field.default !== undefined;

    if (!hasValue && hasDefault) {
      const appliedValue = String(field.default);
      result[key] = appliedValue;
      results.push({
        key,
        originalValue: env[key],
        appliedValue,
        wasApplied: true,
      });
    } else {
      results.push({
        key,
        originalValue: env[key],
        appliedValue: env[key] ?? '',
        wasApplied: false,
      });
    }
  }

  return { env: result, results };
}

export function serializeDefaultedEnv(env: EnvMap): string {
  return Object.entries(env)
    .map(([k, v]) => `${k}=${v}`)
    .join('\n');
}
