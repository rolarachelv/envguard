import { scopeEnv, listScopes } from './scoper';

const sampleEnv = {
  DB_HOST: 'localhost',
  DB_PORT: '5432',
  REDIS_HOST: '127.0.0.1',
  REDIS_PORT: '6379',
  APP_NAME: 'envguard',
  SECRET: 'topsecret',
};

describe('scopeEnv', () => {
  it('returns matching entries for a given scope', () => {
    const result = scopeEnv(sampleEnv, 'DB');
    expect(result.scope).toBe('DB_');
    expect(result.total).toBe(2);
    expect(result.entries).toEqual({ DB_HOST: 'localhost', DB_PORT: '5432' });
  });

  it('handles scope with trailing underscore', () => {
    const result = scopeEnv(sampleEnv, 'REDIS_');
    expect(result.total).toBe(2);
    expect(result.entries).toHaveProperty('REDIS_HOST');
  });

  it('strips prefix when option is set', () => {
    const result = scopeEnv(sampleEnv, 'DB', { stripPrefix: true });
    expect(result.entries).toEqual({ HOST: 'localhost', PORT: '5432' });
  });

  it('returns empty entries when no match', () => {
    const result = scopeEnv(sampleEnv, 'UNKNOWN');
    expect(result.total).toBe(0);
    expect(result.entries).toEqual({});
  });

  it('is case-insensitive for scope matching', () => {
    const result = scopeEnv(sampleEnv, 'db');
    expect(result.total).toBe(2);
  });
});

describe('listScopes', () => {
  it('returns sorted unique scope prefixes', () => {
    const scopes = listScopes(sampleEnv);
    expect(scopes).toEqual(['APP', 'DB', 'REDIS']);
  });

  it('excludes keys with no underscore', () => {
    const scopes = listScopes({ SECRET: 'x', DB_URL: 'y' });
    expect(scopes).toEqual(['DB']);
    expect(scopes).not.toContain('SECRET');
  });

  it('returns empty array for empty env', () => {
    expect(listScopes({})).toEqual([]);
  });
});
