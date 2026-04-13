import { SchemaDefinition } from '../schema/parser';
import { EnvMap } from '../env/loader';
import { ValidationResult } from '../validator/validator';

export interface AuditEntry {
  key: string;
  status: 'missing' | 'extra' | 'invalid' | 'ok';
  message: string;
}

export interface AuditReport {
  timestamp: string;
  envFile: string;
  schemaFile: string;
  entries: AuditEntry[];
  summary: {
    total: number;
    missing: number;
    extra: number;
    invalid: number;
    ok: number;
  };
}

export function auditEnv(
  envMap: EnvMap,
  schema: SchemaDefinition,
  validationResult: ValidationResult,
  envFile: string,
  schemaFile: string
): AuditReport {
  const entries: AuditEntry[] = [];

  for (const key of Object.keys(schema)) {
    const error = validationResult.errors.find((e) => e.key === key);
    if (error) {
      entries.push({
        key,
        status: error.message.toLowerCase().includes('missing') ? 'missing' : 'invalid',
        message: error.message,
      });
    } else {
      entries.push({ key, status: 'ok', message: 'Valid' });
    }
  }

  for (const key of Object.keys(envMap)) {
    if (!schema[key]) {
      entries.push({
        key,
        status: 'extra',
        message: `Key "${key}" is not defined in schema`,
      });
    }
  }

  const summary = entries.reduce(
    (acc, e) => {
      acc[e.status]++;
      acc.total++;
      return acc;
    },
    { total: 0, missing: 0, extra: 0, invalid: 0, ok: 0 }
  );

  return {
    timestamp: new Date().toISOString(),
    envFile,
    schemaFile,
    entries,
    summary,
  };
}
