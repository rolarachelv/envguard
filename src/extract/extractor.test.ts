import { extractEnv, serializeExtractedEnv } from './extractor';

describe('extractEnv', () => {
  const env = {
    APP_NAME: 'myapp',
    APP_PORT: '3000',
    DB_HOST: 'localhost',
    DB_PASS: 'secret',
  };

  it('extracts specified keys', () => {
    const result = extractEnv(env, { keys: ['APP_NAME', 'APP_PORT'] });
    expect(result.extracted).toEqual({ APP_NAME: 'myapp', APP_PORT: '3000' });
    expect(result.found).toEqual(['APP_NAME', 'APP_PORT']);
    expect(result.missing).toEqual([]);
  });

  it('tracks missing keys', () => {
    const result = extractEnv(env, { keys: ['APP_NAME', 'MISSING_KEY'] });
    expect(result.found).toContain('APP_NAME');
    expect(result.missing).toContain('MISSING_KEY');
    expect(result.extracted).not.toHaveProperty('MISSING_KEY');
  });

  it('throws in strict mode when key is missing', () => {
    expect(() =>
      extractEnv(env, { keys: ['NONEXISTENT'], strict: true })
    ).toThrow('Key "NONEXISTENT" not found in environment');
  });

  it('returns empty result for empty keys array', () => {
    const result = extractEnv(env, { keys: [] });
    expect(result.extracted).toEqual({});
    expect(result.found).toEqual([]);
    expect(result.missing).toEqual([]);
  });

  it('handles all keys missing without strict mode', () => {
    const result = extractEnv(env, { keys: ['X', 'Y', 'Z'] });
    expect(result.missing).toHaveLength(3);
    expect(result.found).toHaveLength(0);
  });
});

describe('serializeExtractedEnv', () => {
  it('serializes extracted env to dotenv format', () => {
    const output = serializeExtractedEnv({ FOO: 'bar', BAZ: '42' });
    expect(output).toContain('FOO=bar');
    expect(output).toContain('BAZ=42');
  });

  it('returns empty string for empty map', () => {
    expect(serializeExtractedEnv({})).toBe('');
  });
});
