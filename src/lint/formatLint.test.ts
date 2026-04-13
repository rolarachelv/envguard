import { describe, it, expect } from 'vitest';
import { formatLintText, formatLintJson } from './formatLint';
import { LintResult } from './linter';

const cleanResult: LintResult = {
  issues: [],
  errorCount: 0,
  warningCount: 0,
  infoCount: 0,
};

const dirtyResult: LintResult = {
  issues: [
    { key: 'DATABASE_URL', severity: 'error', message: 'Not a valid URL.' },
    { key: 'API_TOKEN', severity: 'warning', message: 'Looks sensitive but not marked.' },
    { key: 'APP_NAME', severity: 'info', message: 'No description provided.' },
  ],
  errorCount: 1,
  warningCount: 1,
  infoCount: 1,
};

describe('formatLintText', () => {
  it('returns success message when no issues', () => {
    const output = formatLintText(cleanResult);
    expect(output).toContain('No lint issues found');
  });

  it('includes error, warning, and info sections', () => {
    const output = formatLintText(dirtyResult);
    expect(output).toContain('Errors:');
    expect(output).toContain('Warnings:');
    expect(output).toContain('Infos:');
  });

  it('includes summary line', () => {
    const output = formatLintText(dirtyResult);
    expect(output).toContain('1 error(s)');
    expect(output).toContain('1 warning(s)');
    expect(output).toContain('1 info(s)');
  });

  it('includes issue messages', () => {
    const output = formatLintText(dirtyResult);
    expect(output).toContain('Not a valid URL.');
    expect(output).toContain('Looks sensitive but not marked.');
  });
});

describe('formatLintJson', () => {
  it('returns valid JSON', () => {
    const output = formatLintJson(dirtyResult);
    expect(() => JSON.parse(output)).not.toThrow();
  });

  it('includes summary and issues', () => {
    const parsed = JSON.parse(formatLintJson(dirtyResult));
    expect(parsed.summary.errors).toBe(1);
    expect(parsed.summary.warnings).toBe(1);
    expect(parsed.issues).toHaveLength(3);
  });

  it('returns empty issues array for clean result', () => {
    const parsed = JSON.parse(formatLintJson(cleanResult));
    expect(parsed.issues).toHaveLength(0);
  });
});
