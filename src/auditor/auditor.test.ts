import { auditEnv, AuditReport } from './auditor';
import { SchemaDefinition } from '../schema/parser';
import { EnvMap } from '../env/loader';
import { ValidationResult } from '../validator/validator';

const schema: SchemaDefinition = {
  PORT: { type: 'number', required: true },
  NODE_ENV: { type: 'string', required: true },
  DEBUG: { type: 'boolean', required: false },
};

const envMap: EnvMap = {
  PORT: '3000',
  NODE_ENV: 'production',
  EXTRA_KEY: 'surprise',
};

const validationResult: ValidationResult = {
  valid: false,
  errors: [
    { key: 'DEBUG', message: 'Missing required field: DEBUG' },
  ],
};

describe('auditEnv', () => {
  let report: AuditReport;

  beforeEach(() => {
    report = auditEnv(envMap, schema, validationResult, '.env', 'schema.json');
  });

  it('marks valid keys as ok', () => {
    const portEntry = report.entries.find((e) => e.key === 'PORT');
    expect(portEntry?.status).toBe('ok');
  });

  it('marks missing required keys', () => {
    const debugEntry = report.entries.find((e) => e.key === 'DEBUG');
    expect(debugEntry?.status).toBe('missing');
  });

  it('marks extra keys not in schema', () => {
    const extraEntry = report.entries.find((e) => e.key === 'EXTRA_KEY');
    expect(extraEntry?.status).toBe('extra');
  });

  it('computes correct summary counts', () => {
    expect(report.summary.ok).toBe(2);
    expect(report.summary.missing).toBe(1);
    expect(report.summary.extra).toBe(1);
    expect(report.summary.total).toBe(4);
  });

  it('includes envFile and schemaFile in report', () => {
    expect(report.envFile).toBe('.env');
    expect(report.schemaFile).toBe('schema.json');
  });

  it('includes a timestamp', () => {
    expect(report.timestamp).toMatch(/^\d{4}-\d{2}-\d{2}T/);
  });
});
