import { trimValue, trimEnv, serializeTrimmedEnv, TrimMode } from './trimmer';

describe('trimValue', () => {
  it('trims both sides by default', () => {
    expect(trimValue('  hello  ')).toBe('hello');
  });

  it('trims leading whitespace', () => {
    expect(trimValue('  hello  ', 'leading')).toBe('hello  ');
  });

  it('trims trailing whitespace', () => {
    expect(trimValue('  hello  ', 'trailing')).toBe('  hello');
  });

  it('returns unchanged string if no whitespace', () => {
    expect(trimValue('hello', 'both')).toBe('hello');
  });
});

describe('trimEnv', () => {
  const env = {
    API_KEY: '  abc123  ',
    DB_HOST: 'localhost',
    SECRET: '  mysecret',
  };

  it('trims all values and marks changed ones', () => {
    const output = trimEnv(env);
    expect(output.changedCount).toBe(2);
    const apiKey = output.results.find((r) => r.key === 'API_KEY')!;
    expect(apiKey.trimmed).toBe('abc123');
    expect(apiKey.changed).toBe(true);
    const dbHost = output.results.find((r) => r.key === 'DB_HOST')!;
    expect(dbHost.changed).toBe(false);
  });

  it('respects trailing mode', () => {
    const output = trimEnv({ VAL: '  spaced  ' }, 'trailing');
    expect(output.results[0].trimmed).toBe('  spaced');
  });

  it('respects leading mode', () => {
    const output = trimEnv({ VAL: '  spaced  ' }, 'leading');
    expect(output.results[0].trimmed).toBe('spaced  ');
  });
});

describe('serializeTrimmedEnv', () => {
  it('serializes results to env format', () => {
    const output = trimEnv({ FOO: ' bar ', BAZ: 'qux' });
    const serialized = serializeTrimmedEnv(output.results);
    expect(serialized).toBe('FOO=bar\nBAZ=qux');
  });
});
