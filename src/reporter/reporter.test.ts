import { describe, it, expect } from 'vitest';
import { generateReport } from './reporter';
import { ValidationResult } from '../validator/validator';

const passingResult: ValidationResult = {
  valid: true,
  errors: [],
  warnings: [{ field: 'PORT', message: 'Using default value for PORT: "3000"' }],
};

const failingResult: ValidationResult = {
  valid: false,
  errors: [
    { field: 'DATABASE_URL', message: 'Missing required variable: DATABASE_URL', type: 'missing' },
    { field: 'NODE_ENV', message: 'NODE_ENV must be one of [development, production, test]', type: 'invalid_enum' },
  ],
  warnings: [],
};

describe('generateReport', () => {
  it('returns success message for valid result in text format', () => {
    const report = generateReport(passingResult);
    expect(report).toContain('✅ Validation passed.');
  });

  it('returns failure message for invalid result in text format', () => {
    const report = generateReport(failingResult);
    expect(report).toContain('❌ Validation failed');
    expect(report).toContain('2 error(s)');
  });

  it('includes error details in text report', () => {
    const report = generateReport(failingResult);
    expect(report).toContain('[MISSING]');
    expect(report).toContain('DATABASE_URL');
    expect(report).toContain('[INVALID_ENUM]');
  });

  it('hides warnings summary when verbose is false', () => {
    const report = generateReport(passingResult, { verbose: false });
    expect(report).toContain('1 warning(s)');
    expect(report).not.toContain('[WARN]');
  });

  it('shows warning details when verbose is true', () => {
    const report = generateReport(passingResult, { verbose: true });
    expect(report).toContain('[WARN]');
    expect(report).toContain('Using default value for PORT');
  });

  it('returns valid JSON for json format', () => {
    const report = generateReport(failingResult, { format: 'json' });
    const parsed = JSON.parse(report);
    expect(parsed.valid).toBe(false);
    expect(parsed.errors).toHaveLength(2);
  });

  it('json format includes all fields', () => {
    const report = generateReport(passingResult, { format: 'json' });
    const parsed = JSON.parse(report);
    expect(parsed).toHaveProperty('valid');
    expect(parsed).toHaveProperty('errors');
    expect(parsed).toHaveProperty('warnings');
  });
});
