import { describe, it, expect } from 'vitest';
import { maskValue, maskEnv } from './masker';

describe('maskValue', () => {
  it('fully masks a value by default', () => {
    expect(maskValue('secret123')).toBe('*********');
  });

  it('partially masks a value showing last 4 chars', () => {
    expect(maskValue('secret123', { mode: 'partial', visibleChars: 4 })).toBe(
      '*****e123'
    );
  });

  it('returns hash of the value', () => {
    const result = maskValue('secret123', { mode: 'hash' });
    expect(result).toHaveLength(8);
    expect(result).toMatch(/^[0-9a-f]+$/);
  });

  it('returns empty string unchanged', () => {
    expect(maskValue('')).toBe('');
  });

  it('uses custom mask character', () => {
    expect(maskValue('abc', { maskChar: '#' })).toBe('###');
  });

  it('partial mask with short value masks fully', () => {
    expect(maskValue('ab', { mode: 'partial', visibleChars: 4 })).toBe('**');
  });
});

describe('maskEnv', () => {
  const env = { API_KEY: 'supersecret', HOST: 'localhost', PORT: '3000' };

  it('masks only specified keys', () => {
    const result = maskEnv(env, ['API_KEY']);
    expect(result.totalMasked).toBe(1);
    const apiEntry = result.entries.find((e) => e.key === 'API_KEY')!;
    expect(apiEntry.wasMasked).toBe(true);
    expect(apiEntry.masked).toBe('***********');
    const hostEntry = result.entries.find((e) => e.key === 'HOST')!;
    expect(hostEntry.wasMasked).toBe(false);
    expect(hostEntry.masked).toBe('localhost');
  });

  it('returns all entries', () => {
    const result = maskEnv(env, []);
    expect(result.entries).toHaveLength(3);
    expect(result.totalMasked).toBe(0);
  });

  it('preserves original values in entries', () => {
    const result = maskEnv(env, ['API_KEY']);
    const apiEntry = result.entries.find((e) => e.key === 'API_KEY')!;
    expect(apiEntry.original).toBe('supersecret');
  });
});
