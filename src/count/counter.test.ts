import { countByPrefix, countEnv } from './counter';

describe('countByPrefix', () => {
  it('groups keys by prefix', () => {
    const env = { DB_HOST: 'localhost', DB_PORT: '5432', APP_NAME: 'myapp' };
    const result = countByPrefix(env);
    expect(result['DB']).toBe(2);
    expect(result['APP']).toBe(1);
  });

  it('assigns keys without underscore to (no prefix)', () => {
    const env = { HOST: 'localhost', PORT: '8080' };
    const result = countByPrefix(env);
    expect(result['(no prefix)']).toBe(2);
  });

  it('handles empty env', () => {
    expect(countByPrefix({})).toEqual({});
  });

  it('handles mixed keys', () => {
    const env = { DB_HOST: 'a', DB_PORT: 'b', PLAIN: 'c', APP_KEY: 'd', APP_SECRET: 'e' };
    const result = countByPrefix(env);
    expect(result['DB']).toBe(2);
    expect(result['APP']).toBe(2);
    expect(result['(no prefix)']).toBe(1);
  });
});

describe('countEnv', () => {
  it('returns total and byPrefix', () => {
    const env = { DB_HOST: 'localhost', DB_PORT: '5432', APP_NAME: 'myapp' };
    const result = countEnv(env);
    expect(result.total).toBe(3);
    expect(result.byPrefix['DB']).toBe(2);
    expect(result.byPrefix['APP']).toBe(1);
  });

  it('handles empty env', () => {
    const result = countEnv({});
    expect(result.total).toBe(0);
    expect(result.byPrefix).toEqual({});
  });

  it('counts all keys including no-prefix', () => {
    const env = { PLAIN: 'x', DB_HOST: 'y' };
    const result = countEnv(env);
    expect(result.total).toBe(2);
    expect(result.byPrefix['(no prefix)']).toBe(1);
    expect(result.byPrefix['DB']).toBe(1);
  });

  it('handles single key with prefix', () => {
    const env = { MY_VAR: 'hello' };
    const result = countEnv(env);
    expect(result.total).toBe(1);
    expect(result.byPrefix['MY']).toBe(1);
  });

  it('handles multiple keys sharing prefix', () => {
    const env = { X_A: '1', X_B: '2', X_C: '3' };
    const result = countEnv(env);
    expect(result.total).toBe(3);
    expect(result.byPrefix['X']).toBe(3);
  });
});
