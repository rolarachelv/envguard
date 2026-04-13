import { describe, it, expect } from 'vitest';
import { validateEnvAgainstSchema } from './validator';
import { SchemaField } from '../schema/parser';

const baseSchema: Record<string, SchemaField> = {
  DATABASE_URL: { type: 'string', required: true },
  PORT: { type: 'number', required: false, default: '3000' },
  DEBUG: { type: 'boolean', required: false },
  NODE_ENV: { type: 'string', required: true, enum: ['development', 'production', 'test'] },
  API_KEY: { type: 'string', required: true, pattern: '^[A-Za-z0-9]{32}$' },
};

describe('validateEnvAgainstSchema', () => {
  it('returns valid when all required fields are present and correct', () => {
    const env = {
      DATABASE_URL: 'postgres://localhost/db',
      NODE_ENV: 'production',
      API_KEY: 'a'.repeat(32),
    };
    const result = validateEnvAgainstSchema(env, baseSchema);
    expect(result.valid).toBe(true);
    expect(result.errors).toHaveLength(0);
  });

  it('reports error for missing required field', () => {
    const env = { NODE_ENV: 'development', API_KEY: 'a'.repeat(32) };
    const result = validateEnvAgainstSchema(env, baseSchema);
    expect(result.valid).toBe(false);
    expect(result.errors[0].type).toBe('missing');
    expect(result.errors[0].field).toBe('DATABASE_URL');
  });

  it('reports error for invalid number type', () => {
    const env = { DATABASE_URL: 'postgres://localhost/db', NODE_ENV: 'test', API_KEY: 'a'.repeat(32), PORT: 'not-a-number' };
    const result = validateEnvAgainstSchema(env, baseSchema);
    expect(result.errors.some(e => e.type === 'invalid_type' && e.field === 'PORT')).toBe(true);
  });

  it('reports error for invalid enum value', () => {
    const env = { DATABASE_URL: 'url', NODE_ENV: 'staging', API_KEY: 'a'.repeat(32) };
    const result = validateEnvAgainstSchema(env, baseSchema);
    expect(result.errors.some(e => e.type === 'invalid_enum' && e.field === 'NODE_ENV')).toBe(true);
  });

  it('reports error for pattern mismatch', () => {
    const env = { DATABASE_URL: 'url', NODE_ENV: 'test', API_KEY: 'short-key' };
    const result = validateEnvAgainstSchema(env, baseSchema);
    expect(result.errors.some(e => e.type === 'pattern_mismatch' && e.field === 'API_KEY')).toBe(true);
  });

  it('warns about undocumented variables', () => {
    const env = { DATABASE_URL: 'url', NODE_ENV: 'test', API_KEY: 'a'.repeat(32), UNKNOWN_VAR: 'value' };
    const result = validateEnvAgainstSchema(env, baseSchema);
    expect(result.warnings.some(w => w.field === 'UNKNOWN_VAR')).toBe(true);
  });

  it('warns when optional field uses default value', () => {
    const env = { DATABASE_URL: 'url', NODE_ENV: 'test', API_KEY: 'a'.repeat(32) };
    const result = validateEnvAgainstSchema(env, baseSchema);
    expect(result.warnings.some(w => w.field === 'PORT')).toBe(true);
  });
});
