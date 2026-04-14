import { describe, it, expect } from 'vitest';
import {
  generateDefaultValue,
  generateEnvFromSchema,
  serializeGeneratedEnv,
} from './generator';
import type { SchemaField } from '../schema/parser';

describe('generateDefaultValue', () => {
  it('returns field default when provided', () => {
    const field: SchemaField = { type: 'string', default: 'hello' };
    expect(generateDefaultValue(field)).toBe('hello');
  });

  it('returns first enum value when no default', () => {
    const field: SchemaField = { type: 'string', enum: ['dev', 'prod'] };
    expect(generateDefaultValue(field)).toBe('dev');
  });

  it('returns type-based default for boolean', () => {
    const field: SchemaField = { type: 'boolean' };
    expect(generateDefaultValue(field)).toBe('false');
  });

  it('returns type-based default for number', () => {
    const field: SchemaField = { type: 'number' };
    expect(generateDefaultValue(field)).toBe('0');
  });

  it('returns empty string for unknown type', () => {
    const field: SchemaField = { type: 'string' };
    expect(generateDefaultValue(field)).toBe('');
  });
});

describe('generateEnvFromSchema', () => {
  const fields: Record<string, SchemaField> = {
    PORT: { type: 'number', default: '3000', description: 'Server port' },
    DEBUG: { type: 'boolean' },
    API_URL: { type: 'url', description: 'API endpoint' },
  };

  it('generates entries for all schema fields', () => {
    const result = generateEnvFromSchema(fields, {});
    expect(result.entries).toHaveLength(3);
    expect(result.addedCount).toBe(3);
    expect(result.skippedCount).toBe(0);
  });

  it('skips existing keys when overwriteExisting is false', () => {
    const result = generateEnvFromSchema(fields, { PORT: '8080' });
    const portEntry = result.entries.find((e) => e.key === 'PORT');
    expect(portEntry?.value).toBe('8080');
    expect(portEntry?.wasExisting).toBe(true);
    expect(result.skippedCount).toBe(1);
    expect(result.addedCount).toBe(2);
  });

  it('overwrites existing keys when overwriteExisting is true', () => {
    const result = generateEnvFromSchema(fields, { PORT: '8080' }, { overwriteExisting: true });
    const portEntry = result.entries.find((e) => e.key === 'PORT');
    expect(portEntry?.value).toBe('3000');
    expect(result.addedCount).toBe(3);
  });

  it('includes comments when includeComments is true', () => {
    const result = generateEnvFromSchema(fields, {}, { includeComments: true });
    const portEntry = result.entries.find((e) => e.key === 'PORT');
    expect(portEntry?.comment).toBe('Server port');
  });

  it('omits comments when includeComments is false', () => {
    const result = generateEnvFromSchema(fields, {}, { includeComments: false });
    expect(result.entries.every((e) => e.comment === undefined)).toBe(true);
  });
});

describe('serializeGeneratedEnv', () => {
  it('serializes entries with comments', () => {
    const result = generateEnvFromSchema(
      { PORT: { type: 'number', default: '3000', description: 'Server port' } },
      {},
      { includeComments: true }
    );
    const output = serializeGeneratedEnv(result);
    expect(output).toContain('# Server port');
    expect(output).toContain('PORT=3000');
  });

  it('ends with a newline', () => {
    const result = generateEnvFromSchema({ X: { type: 'string' } }, {});
    expect(serializeGeneratedEnv(result).endsWith('\n')).toBe(true);
  });
});
