import { describe, it, expect } from 'vitest';
import { searchEnv, matchesQuery } from './searcher';

const sampleEnv: Record<string, string> = {
  DATABASE_URL: 'postgres://localhost:5432/mydb',
  REDIS_URL: 'redis://localhost:6379',
  APP_SECRET: 'supersecret',
  APP_NAME: 'myapp',
  DEBUG: 'true',
};

describe('matchesQuery', () => {
  it('matches case-insensitively by default', () => {
    expect(matchesQuery('DATABASE_URL', 'database', false)).toBe(true);
    expect(matchesQuery('DATABASE_URL', 'DATABASE', false)).toBe(true);
  });

  it('matches case-sensitively when enabled', () => {
    expect(matchesQuery('DATABASE_URL', 'database', true)).toBe(false);
    expect(matchesQuery('DATABASE_URL', 'DATABASE', true)).toBe(true);
  });

  it('returns false when no match', () => {
    expect(matchesQuery('APP_NAME', 'xyz', false)).toBe(false);
  });
});

describe('searchEnv', () => {
  it('finds matches in keys', () => {
    const result = searchEnv(sampleEnv, 'APP', { searchKeys: true, searchValues: false });
    expect(result.total).toBe(2);
    expect(result.matches.every(m => m.matchedOn === 'key')).toBe(true);
  });

  it('finds matches in values', () => {
    const result = searchEnv(sampleEnv, 'localhost', { searchKeys: false, searchValues: true });
    expect(result.total).toBe(2);
    expect(result.matches.every(m => m.matchedOn === 'value')).toBe(true);
  });

  it('finds matches in both key and value', () => {
    const env = { APP_URL: 'https://app.example.com' };
    const result = searchEnv(env, 'app', { searchKeys: true, searchValues: true });
    expect(result.total).toBe(1);
    expect(result.matches[0].matchedOn).toBe('both');
  });

  it('returns empty results when nothing matches', () => {
    const result = searchEnv(sampleEnv, 'ZZZNOMATCH');
    expect(result.total).toBe(0);
    expect(result.matches).toHaveLength(0);
  });

  it('includes query in result', () => {
    const result = searchEnv(sampleEnv, 'DEBUG');
    expect(result.query).toBe('DEBUG');
  });
});
