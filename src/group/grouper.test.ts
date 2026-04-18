import { describe, it, expect } from 'vitest';
import { groupEnv, getGroupKey } from './grouper';
import { formatGroupText, formatGroupJson } from './formatGroup';

describe('getGroupKey', () => {
  it('returns prefix before delimiter', () => {
    expect(getGroupKey('DB_HOST')).toBe('DB');
  });

  it('returns null when no delimiter found', () => {
    expect(getGroupKey('PORT')).toBeNull();
  });

  it('returns null when delimiter is first character', () => {
    expect(getGroupKey('_HIDDEN')).toBeNull();
  });

  it('supports custom delimiter', () => {
    expect(getGroupKey('aws.region', '.')).toBe('aws');
  });
});

describe('groupEnv', () => {
  const env = {
    DB_HOST: 'localhost',
    DB_PORT: '5432',
    REDIS_URL: 'redis://localhost',
    PORT: '3000',
  };

  it('groups keys by prefix', () => {
    const result = groupEnv(env);
    expect(result.groups['DB']).toEqual({ DB_HOST: 'localhost', DB_PORT: '5432' });
    expect(result.groups['REDIS']).toEqual({ REDIS_URL: 'redis://localhost' });
  });

  it('collects ungrouped keys', () => {
    const result = groupEnv(env);
    expect(result.ungrouped).toEqual({ PORT: '3000' });
  });

  it('handles empty env', () => {
    const result = groupEnv({});
    expect(result.groups).toEqual({});
    expect(result.ungrouped).toEqual({});
  });
});

describe('formatGroupText', () => {
  it('renders groups with headers', () => {
    const result = groupEnv({ DB_HOST: 'localhost', PORT: '3000' });
    const text = formatGroupText(result);
    expect(text).toContain('[DB]');
    expect(text).toContain('DB_HOST=localhost');
    expect(text).toContain('[(ungrouped)]');
    expect(text).toContain('PORT=3000');
  });
});

describe('formatGroupJson', () => {
  it('returns valid JSON', () => {
    const result = groupEnv({ DB_HOST: 'localhost' });
    const json = JSON.parse(formatGroupJson(result));
    expect(json.groups['DB']).toEqual({ DB_HOST: 'localhost' });
    expect(json.ungrouped).toEqual({});
  });
});
