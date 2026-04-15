import { describe, it, expect } from 'vitest';
import { formatDocsText, formatDocsJson } from './formatDocs';
import { DocOutput } from './docgen';

const sampleOutput: DocOutput = {
  generatedAt: '2024-06-01T12:00:00.000Z',
  entries: [
    { key: 'API_KEY', type: 'string', required: true, description: 'External API key', example: 'abc123' },
    { key: 'TIMEOUT', type: 'number', required: false, defaultValue: '5000', description: 'Request timeout ms' },
    { key: 'DEBUG', type: 'boolean', required: false },
  ],
};

describe('formatDocsText', () => {
  it('includes header and generated date', () => {
    const result = formatDocsText(sampleOutput);
    expect(result).toContain('Environment Variable Documentation');
    expect(result).toContain('2024-06-01T12:00:00.000Z');
  });

  it('includes all variable keys', () => {
    const result = formatDocsText(sampleOutput);
    expect(result).toContain('API_KEY');
    expect(result).toContain('TIMEOUT');
    expect(result).toContain('DEBUG');
  });

  it('shows total count', () => {
    const result = formatDocsText(sampleOutput);
    expect(result).toContain('Total: 3 variable(s)');
  });
});

describe('formatDocsJson', () => {
  it('produces valid JSON', () => {
    const result = formatDocsJson(sampleOutput);
    expect(() => JSON.parse(result)).not.toThrow();
  });

  it('includes variables array', () => {
    const parsed = JSON.parse(formatDocsJson(sampleOutput));
    expect(parsed.variables).toHaveLength(3);
    expect(parsed.variables[0].key).toBe('API_KEY');
  });

  it('includes generatedAt field', () => {
    const parsed = JSON.parse(formatDocsJson(sampleOutput));
    expect(parsed.generatedAt).toBe('2024-06-01T12:00:00.000Z');
  });
});
