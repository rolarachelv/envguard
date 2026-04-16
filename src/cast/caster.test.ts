import { describe, it, expect } from 'vitest';
import { castValue, castEnv } from './caster';

describe('castValue', () => {
  it('casts string as-is', () => {
    expect(castValue('hello', 'string')).toEqual({ value: 'hello' });
  });

  it('casts valid number', () => {
    expect(castValue('42', 'number')).toEqual({ value: 42 });
  });

  it('returns error for invalid number', () => {
    const result = castValue('abc', 'number');
    expect(result.value).toBeNull();
    expect(result.error).toMatch(/Cannot cast/);
  });

  it('casts true boolean variants', () => {
    expect(castValue('true', 'boolean')).toEqual({ value: true });
    expect(castValue('1', 'boolean')).toEqual({ value: true });
    expect(castValue('yes', 'boolean')).toEqual({ value: true });
  });

  it('casts false boolean variants', () => {
    expect(castValue('false', 'boolean')).toEqual({ value: false });
    expect(castValue('0', 'boolean')).toEqual({ value: false });
    expect(castValue('no', 'boolean')).toEqual({ value: false });
  });

  it('returns error for invalid boolean', () => {
    const result = castValue('maybe', 'boolean');
    expect(result.error).toMatch(/Cannot cast/);
  });

  it('casts valid JSON', () => {
    expect(castValue('{"a":1}', 'json')).toEqual({ value: { a: 1 } });
  });

  it('returns error for invalid JSON', () => {
    const result = castValue('{invalid}', 'json');
    expect(result.error).toMatch(/Cast error/);
  });
});

describe('castEnv', () => {
  const env = { PORT: '3000', DEBUG: 'true', CONFIG: '{"x":2}', NAME: 'app' };

  it('casts multiple keys with correct types', () => {
    const results = castEnv(env, [
      { key: 'PORT', type: 'number' },
      { key: 'DEBUG', type: 'boolean' },
      { key: 'CONFIG', type: 'json' },
    ]);
    expect(results[0]).toMatchObject({ key: 'PORT', castedValue: 3000, success: true });
    expect(results[1]).toMatchObject({ key: 'DEBUG', castedValue: true, success: true });
    expect(results[2]).toMatchObject({ key: 'CONFIG', castedValue: { x: 2 }, success: true });
  });

  it('returns failure for missing key', () => {
    const results = castEnv(env, [{ key: 'MISSING', type: 'number' }]);
    expect(results[0].success).toBe(false);
    expect(results[0].error).toMatch(/not found/);
  });
});
