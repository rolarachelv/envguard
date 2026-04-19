import { prefixEnv, serializePrefixedEnv } from './prefixer';

describe('prefixEnv - add prefix', () => {
  const env = { FOO: 'bar', APP_BAZ: 'qux' };

  it('adds prefix to keys that do not have it', () => {
    const results = prefixEnv(env, { prefix: 'APP_' });
    const foo = results.find(r => r.originalKey === 'FOO')!;
    expect(foo.key).toBe('APP_FOO');
    expect(foo.changed).toBe(true);
  });

  it('skips keys that already have the prefix', () => {
    const results = prefixEnv(env, { prefix: 'APP_' });
    const baz = results.find(r => r.originalKey === 'APP_BAZ')!;
    expect(baz.key).toBe('APP_BAZ');
    expect(baz.changed).toBe(false);
  });
});

describe('prefixEnv - strip prefix', () => {
  const env = { APP_FOO: 'bar', OTHER: 'val' };

  it('strips prefix from matching keys', () => {
    const results = prefixEnv(env, { prefix: 'APP_', strip: true });
    const foo = results.find(r => r.originalKey === 'APP_FOO')!;
    expect(foo.key).toBe('FOO');
    expect(foo.changed).toBe(true);
  });

  it('leaves non-matching keys unchanged', () => {
    const results = prefixEnv(env, { prefix: 'APP_', strip: true });
    const other = results.find(r => r.originalKey === 'OTHER')!;
    expect(other.key).toBe('OTHER');
    expect(other.changed).toBe(false);
  });
});

describe('serializePrefixedEnv', () => {
  it('serializes results to KEY=VALUE lines', () => {
    const results = prefixEnv({ FOO: 'bar' }, { prefix: 'APP_' });
    expect(serializePrefixedEnv(results)).toBe('APP_FOO=bar');
  });
});
