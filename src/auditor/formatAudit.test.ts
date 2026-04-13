import { formatAuditText, formatAuditJson } from './formatAudit';
import { AuditReport } from './auditor';

const mockReport: AuditReport = {
  timestamp: '2024-01-15T10:00:00.000Z',
  envFile: '.env',
  schemaFile: 'schema.json',
  entries: [
    { key: 'PORT', status: 'ok', message: 'Valid' },
    { key: 'SECRET', status: 'missing', message: 'Missing required field: SECRET' },
    { key: 'UNKNOWN', status: 'extra', message: 'Key "UNKNOWN" is not defined in schema' },
    { key: 'TIMEOUT', status: 'invalid', message: 'Expected number, got string' },
  ],
  summary: { total: 4, ok: 1, missing: 1, extra: 1, invalid: 1 },
};

describe('formatAuditText', () => {
  let output: string;

  beforeEach(() => {
    output = formatAuditText(mockReport);
  });

  it('includes the report header', () => {
    expect(output).toContain('EnvGuard Audit Report');
  });

  it('includes timestamp and file paths', () => {
    expect(output).toContain('2024-01-15T10:00:00.000Z');
    expect(output).toContain('.env');
    expect(output).toContain('schema.json');
  });

  it('renders ok entries with checkmark', () => {
    expect(output).toContain('✔ [OK');
    expect(output).toContain('PORT');
  });

  it('renders missing entries with cross', () => {
    expect(output).toContain('✘ [MISSING');
    expect(output).toContain('SECRET');
  });

  it('renders extra entries with warning', () => {
    expect(output).toContain('⚠ [EXTRA');
    expect(output).toContain('UNKNOWN');
  });

  it('includes summary section', () => {
    expect(output).toContain('Summary:');
    expect(output).toContain('Total   : 4');
    expect(output).toContain('Missing : 1');
  });
});

describe('formatAuditJson', () => {
  it('returns valid JSON', () => {
    const json = formatAuditJson(mockReport);
    expect(() => JSON.parse(json)).not.toThrow();
  });

  it('preserves all report fields', () => {
    const parsed = JSON.parse(formatAuditJson(mockReport));
    expect(parsed.envFile).toBe('.env');
    expect(parsed.entries).toHaveLength(4);
    expect(parsed.summary.total).toBe(4);
  });
});
