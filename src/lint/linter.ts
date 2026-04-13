import { EnvSchema, SchemaField } from '../schema/parser';

export type LintSeverity = 'error' | 'warning' | 'info';

export interface LintIssue {
  key: string;
  severity: LintSeverity;
  message: string;
}

export interface LintResult {
  issues: LintIssue[];
  errorCount: number;
  warningCount: number;
  infoCount: number;
}

const SENSITIVE_PATTERNS = /secret|password|passwd|token|api_?key|private/i;
const PLACEHOLDER_PATTERNS = /^(changeme|replace_?me|todo|fixme|example|your[_-]|<.*>)$/i;

function lintField(key: string, field: SchemaField, value: string | undefined): LintIssue[] {
  const issues: LintIssue[] = [];

  if (!field.description) {
    issues.push({ key, severity: 'info', message: `Field "${key}" has no description in schema.` });
  }

  if (SENSITIVE_PATTERNS.test(key) && !field.sensitive) {
    issues.push({
      key,
      severity: 'warning',
      message: `Field "${key}" looks sensitive but is not marked as sensitive in schema.`,
    });
  }

  if (value !== undefined && PLACEHOLDER_PATTERNS.test(value.trim())) {
    issues.push({
      key,
      severity: 'warning',
      message: `Field "${key}" appears to contain a placeholder value: "${value}".`,
    });
  }

  if (field.type === 'url' && value) {
    try {
      new URL(value);
    } catch {
      issues.push({ key, severity: 'error', message: `Field "${key}" is not a valid URL: "${value}".` });
    }
  }

  return issues;
}

export function lintEnv(
  env: Record<string, string>,
  schema: EnvSchema
): LintResult {
  const issues: LintIssue[] = [];

  for (const [key, field] of Object.entries(schema.fields)) {
    const value = env[key];
    issues.push(...lintField(key, field, value));
  }

  return {
    issues,
    errorCount: issues.filter((i) => i.severity === 'error').length,
    warningCount: issues.filter((i) => i.severity === 'warning').length,
    infoCount: issues.filter((i) => i.severity === 'info').length,
  };
}
