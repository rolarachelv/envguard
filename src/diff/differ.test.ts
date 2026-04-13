import { describe, it, expect } from 'vitest';
import { diffEnvFiles } from './differ';
import { formatDiffText, formatDiffJson } from './formatDiff';

const base = { API_URL: 'http://old.example.com', SECRET: 'abc123', SHARED: 'same' };
const compare = { API_URL: 'http://new.example.com', NEW_VAR: 'hello', SHARED: 'same' };

describe('diffEnvFiles', () => {
  it('detects added keys', () => {
    const result = diffEnvFiles(base, compare);
    const added = result.entries.filter((e) => e.status === 'added');
    expect(added).toHaveLength(1);
    expect(added[0].key).toBe('NEW_VAR');
  });

  it('detects removed keys', () => {
    const result = diffEnvFiles(base, compare);
    const removed = result.entries.filter((e) => e.status === 'removed');
    expect(removed).toHaveLength(1);
    expect(removed[0].key).toBe('SECRET');
  });

  it('detects changed keys', () => {
    const result = diffEnvFiles(base, compare);
    const changed = result.entries.filter((e) => e.status === 'changed');
    expect(changed).toHaveLength(1);
    expect(changed[0].key).toBe('API_URL');
  });

  it('detects unchanged keys', () => {
    const result = diffEnvFiles(base, compare);
    const unchanged = result.entries.filter((e) => e.status === 'unchanged');
    expect(unchanged).toHaveLength(1);
    expect(unchanged[0].key).toBe('SHARED');
  });

  it('includes required flag from schema', () => {
    const schema = { SECRET: { type: 'string' as const, required: true } };
    const result = diffEnvFiles(base, compare, schema);
    const secretEntry = result.entries.find((e) => e.key === 'SECRET');
    expect(secretEntry?.required).toBe(true);
  });

  it('returns correct counts', () => {
    const result = diffEnvFiles(base, compare);
    expect(result.addedCount).toBe(1);
    expect(result.removedCount).toBe(1);
    expect(result.changedCount).toBe(1);
    expect(result.unchangedCount).toBe(1);
  });
});

describe('formatDiffText', () => {
  it('includes summary header', () => {
    const result = diffEnvFiles(base, compare);
    const text = formatDiffText(result);
    expect(text).toContain('Env Diff Summary');
    expect(text).toContain('Added:     1');
    expect(text).toContain('Removed:   1');
  });

  it('masks values in output', () => {
    const result = diffEnvFiles(base, compare);
    const text = formatDiffText(result);
    expect(text).not.toContain('http://old.example.com');
    expect(text).not.toContain('abc123');
  });
});

describe('formatDiffJson', () => {
  it('returns valid JSON with summary and changes', () => {
    const result = diffEnvFiles(base, compare);
    const json = JSON.parse(formatDiffJson(result));
    expect(json.summary.added).toBe(1);
    expect(json.changes).toBeInstanceOf(Array);
    expect(json.changes.length).toBe(3);
  });
});
