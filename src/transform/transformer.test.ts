import { describe, it, expect } from 'vitest';
import { applyTransform, transformEnv, TransformRule } from './transformer';

describe('applyTransform', () => {
  it('uppercases a value', () => {
    expect(applyTransform('hello', { key: 'K', operation: 'uppercase' })).toBe('HELLO');
  });

  it('lowercases a value', () => {
    expect(applyTransform('WORLD', { key: 'K', operation: 'lowercase' })).toBe('world');
  });

  it('trims whitespace', () => {
    expect(applyTransform('  spaced  ', { key: 'K', operation: 'trim' })).toBe('spaced');
  });

  it('adds a prefix', () => {
    expect(applyTransform('value', { key: 'K', operation: 'prefix', value: 'PRE_' })).toBe('PRE_value');
  });

  it('adds a suffix', () => {
    expect(applyTransform('value', { key: 'K', operation: 'suffix', value: '_SUF' })).toBe('value_SUF');
  });

  it('replaces substrings', () => {
    expect(applyTransform('foo-bar-foo', { key: 'K', operation: 'replace', from: 'foo', to: 'baz' })).toBe('baz-bar-baz');
  });

  it('returns value unchanged for replace without from/to', () => {
    expect(applyTransform('unchanged', { key: 'K', operation: 'replace' })).toBe('unchanged');
  });
});

describe('transformEnv', () => {
  const env = { NAME: '  alice  ', ROLE: 'admin', PORT: '3000' };

  it('applies multiple rules and tracks changes', () => {
    const rules: TransformRule[] = [
      { key: 'NAME', operation: 'trim' },
      { key: 'ROLE', operation: 'uppercase' },
    ];
    const { result, changes } = transformEnv(env, rules);
    expect(result['NAME']).toBe('alice');
    expect(result['ROLE']).toBe('ADMIN');
    expect(changes).toHaveLength(2);
  });

  it('skips keys not present in env', () => {
    const rules: TransformRule[] = [{ key: 'MISSING', operation: 'uppercase' }];
    const { changes } = transformEnv(env, rules);
    expect(changes).toHaveLength(0);
  });

  it('does not record a change when value is unchanged', () => {
    const rules: TransformRule[] = [{ key: 'PORT', operation: 'trim' }];
    const { changes } = transformEnv(env, rules);
    expect(changes).toHaveLength(0);
  });
});
