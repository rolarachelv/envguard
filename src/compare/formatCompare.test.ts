import { formatCompareText, formatCompareJson } from './formatCompare';
import { EnvCompareReport } from './comparer';

const sampleReport: EnvCompareReport = {
  fileA: '.env.staging',
  fileB: '.env.production',
  results: [
    { key: 'API_KEY', status: 'mismatch', valueA: 'abc123', valueB: 'xyz789' },
    { key: 'DB_HOST', status: 'match', valueA: 'localhost', valueB: 'localhost' },
    { key: 'ONLY_STAGING', status: 'missing_in_b', valueA: 'true' },
    { key: 'ONLY_PROD', status: 'missing_in_a', valueB: 'secret' },
  ],
  totalKeys: 4,
  matchCount: 1,
  mismatchCount: 1,
  missingInACount: 1,
  missingInBCount: 1,
};

describe('formatCompareText', () => {
  it('includes both file names', () => {
    const output = formatCompareText(sampleReport);
    expect(output).toContain('.env.staging');
    expect(output).toContain('.env.production');
  });

  it('shows MATCH for equal keys', () => {
    const output = formatCompareText(sampleReport);
    expect(output).toContain('MATCH');
    expect(output).toContain('DB_HOST');
  });

  it('shows MISMATCH with masked values', () => {
    const output = formatCompareText(sampleReport);
    expect(output).toContain('MISMATCH');
    expect(output).toContain('API_KEY');
    expect(output).not.toContain('abc123');
    expect(output).not.toContain('xyz789');
  });

  it('shows summary counts', () => {
    const output = formatCompareText(sampleReport);
    expect(output).toContain('Total: 4');
    expect(output).toContain('Match: 1');
    expect(output).toContain('Mismatch: 1');
  });
});

describe('formatCompareJson', () => {
  it('returns valid JSON with all fields', () => {
    const output = formatCompareJson(sampleReport);
    const parsed = JSON.parse(output);
    expect(parsed.fileA).toBe('.env.staging');
    expect(parsed.totalKeys).toBe(4);
    expect(parsed.results).toHaveLength(4);
  });
});
