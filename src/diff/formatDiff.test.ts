import { maskValue, formatDiffText, formatDiffJson } from './formatDiff';
import { DiffResult } from './differ';

const sampleDiff: DiffResult[] = [
  { key: 'DATABASE_URL', status: 'changed', valueA: 'postgres://localhost/dev', valueB: 'postgres://prod-host/prod' },
  { key: 'API_KEY', status: 'missing_in_b', valueA: 'abc123', valueB: undefined },
  { key: 'NEW_FEATURE_FLAG', status: 'missing_in_a', valueA: undefined, valueB: 'true' },
  { key: 'APP_NAME', status: 'unchanged', valueA: 'myapp', valueB: 'myapp' },
];

describe('maskValue', () => {
  it('masks a value by showing only last 4 chars', () => {
    expect(maskValue('supersecret')).toBe('****cret');
  });

  it('masks short values entirely', () => {
    expect(maskValue('abc')).toBe('****');
  });

  it('returns empty string for undefined', () => {
    expect(maskValue(undefined)).toBe('');
  });
});

describe('formatDiffText', () => {
  it('includes changed keys with arrow notation', () => {
    const output = formatDiffText(sampleDiff);
    expect(output).toContain('~ DATABASE_URL');
  });

  it('marks missing_in_b keys with minus', () => {
    const output = formatDiffText(sampleDiff);
    expect(output).toContain('- API_KEY');
  });

  it('marks missing_in_a keys with plus', () => {
    const output = formatDiffText(sampleDiff);
    expect(output).toContain('+ NEW_FEATURE_FLAG');
  });

  it('marks unchanged keys with equals', () => {
    const output = formatDiffText(sampleDiff);
    expect(output).toContain('= APP_NAME');
  });

  it('masks sensitive values when maskSecrets is true', () => {
    const output = formatDiffText(sampleDiff, true);
    expect(output).not.toContain('postgres://localhost/dev');
    expect(output).toContain('****');
  });
});

describe('formatDiffJson', () => {
  it('returns a valid JSON-serializable object', () => {
    const result = formatDiffJson(sampleDiff);
    expect(() => JSON.stringify(result)).not.toThrow();
  });

  it('contains summary counts', () => {
    const result = formatDiffJson(sampleDiff);
    expect(result.summary.changed).toBe(1);
    expect(result.summary.added).toBe(1);
    expect(result.summary.removed).toBe(1);
    expect(result.summary.unchanged).toBe(1);
  });

  it('masks values when maskSecrets is true', () => {
    const result = formatDiffJson(sampleDiff, true);
    const changed = result.diffs.find((d: any) => d.key === 'DATABASE_URL');
    expect(changed.valueA).toContain('****');
  });
});
