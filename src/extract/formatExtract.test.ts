import { formatExtractText, formatExtractJson } from './formatExtract';
import { ExtractResult } from './extractor';

const fullResult: ExtractResult = {
  extracted: { APP_NAME: 'myapp', APP_PORT: '3000' },
  found: ['APP_NAME', 'APP_PORT'],
  missing: ['DB_HOST'],
};

const emptyResult: ExtractResult = {
  extracted: {},
  found: [],
  missing: [],
};

describe('formatExtractText', () => {
  it('includes found count', () => {
    const output = formatExtractText(fullResult);
    expect(output).toContain('Extracted: 2 key(s)');
  });

  it('lists found keys with values', () => {
    const output = formatExtractText(fullResult);
    expect(output).toContain('APP_NAME=myapp');
    expect(output).toContain('APP_PORT=3000');
  });

  it('lists missing keys', () => {
    const output = formatExtractText(fullResult);
    expect(output).toContain('Missing (1):');
    expect(output).toContain('- DB_HOST');
  });

  it('handles empty result gracefully', () => {
    const output = formatExtractText(emptyResult);
    expect(output).toContain('Extracted: 0 key(s)');
    expect(output).not.toContain('Found:');
    expect(output).not.toContain('Missing');
  });
});

describe('formatExtractJson', () => {
  it('returns valid JSON', () => {
    const output = formatExtractJson(fullResult);
    expect(() => JSON.parse(output)).not.toThrow();
  });

  it('includes extracted map', () => {
    const parsed = JSON.parse(formatExtractJson(fullResult));
    expect(parsed.extracted).toEqual({ APP_NAME: 'myapp', APP_PORT: '3000' });
  });

  it('includes summary counts', () => {
    const parsed = JSON.parse(formatExtractJson(fullResult));
    expect(parsed.summary.foundCount).toBe(2);
    expect(parsed.summary.missingCount).toBe(1);
  });

  it('includes missing array', () => {
    const parsed = JSON.parse(formatExtractJson(fullResult));
    expect(parsed.missing).toContain('DB_HOST');
  });
});
