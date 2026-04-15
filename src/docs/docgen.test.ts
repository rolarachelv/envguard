import { describe, it, expect } from 'vitest';
import { buildDocEntry, generateDocs } from './docgen';
import { SchemaField } from '../schema/parser';

const sampleFields: SchemaField[] = [
  { key: 'DATABASE_URL', type: 'string', required: true, description: 'Postgres connection string', example: 'postgres://localhost/db' },
  { key: 'PORT', type: 'number', required: false, default: '3000', description: 'Server port' },
  { key: 'ENABLE_CACHE', type: 'boolean', required: false },
];

describe('buildDocEntry', () => {
  it('maps required field correctly', () => {
    const entry = buildDocEntry(sampleFields[0]);
    expect(entry.key).toBe('DATABASE_URL');
    expect(entry.required).toBe(true);
    expect(entry.type).toBe('string');
    expect(entry.example).toBe('postgres://localhost/db');
    expect(entry.defaultValue).toBeUndefined();
  });

  it('maps optional field with default', () => {
    const entry = buildDocEntry(sampleFields[1]);
    expect(entry.required).toBe(false);
    expect(entry.defaultValue).toBe('3000');
  });

  it('defaults type to string when not provided', () => {
    const field: SchemaField = { key: 'FOO', required: false };
    const entry = buildDocEntry(field);
    expect(entry.type).toBe('string');
  });
});

describe('generateDocs', () => {
  it('returns an entry for each field', () => {
    const output = generateDocs(sampleFields);
    expect(output.entries).toHaveLength(3);
  });

  it('includes a generatedAt timestamp', () => {
    const output = generateDocs(sampleFields);
    expect(output.generatedAt).toBeTruthy();
    expect(new Date(output.generatedAt).getFullYear()).toBeGreaterThanOrEqual(2024);
  });
});
