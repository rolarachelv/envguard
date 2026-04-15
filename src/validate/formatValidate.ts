import { ValidationResult } from '../validator/validator';

export interface FormattedValidationEntry {
  key: string;
  status: 'ok' | 'missing' | 'invalid';
  message?: string;
}

function buildEntries(result: ValidationResult): FormattedValidationEntry[] {
  const entries: FormattedValidationEntry[] = [];

  for (const key of result.missing) {
    entries.push({ key, status: 'missing', message: 'Required variable is missing' });
  }

  for (const err of result.errors) {
    entries.push({ key: err.key, status: 'invalid', message: err.message });
  }

  for (const key of result.valid) {
    entries.push({ key, status: 'ok' });
  }

  return entries.sort((a, b) => a.key.localeCompare(b.key));
}

export function formatValidateText(result: ValidationResult): string {
  const entries = buildEntries(result);
  const lines: string[] = [];

  lines.push('Validation Report');
  lines.push('=================');

  for (const entry of entries) {
    const icon = entry.status === 'ok' ? '✓' : entry.status === 'missing' ? '✗' : '!';
    const detail = entry.message ? ` — ${entry.message}` : '';
    lines.push(`  [${icon}] ${entry.key}${detail}`);
  }

  lines.push('');
  const total = entries.length;
  const passed = entries.filter(e => e.status === 'ok').length;
  const failed = total - passed;
  lines.push(`Result: ${passed}/${total} passed, ${failed} issue(s) found.`);

  return lines.join('\n');
}

export function formatValidateJson(result: ValidationResult): string {
  const entries = buildEntries(result);
  const summary = {
    total: entries.length,
    passed: entries.filter(e => e.status === 'ok').length,
    missing: result.missing.length,
    invalid: result.errors.length,
  };
  return JSON.stringify({ summary, entries }, null, 2);
}
