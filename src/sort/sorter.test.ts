import { describe, it, expect } from 'vitest';
import { sortEnv, compareKeys } from './sorter';

describe('compareKeys', () => {
  it('sorts alphabetically by default', () => {
    expect(compareKeys('B', 'A')).toBeGreaterThan(0);
    expect(compareKeys('A', 'B')).toBeLessThan(0);
    expect(compareKeys('A', 'A')).toBe(0);
  });

  it('sorts by length strategy', () => {
    expect(compareKeys('AB', 'A', 'length')).toBeGreaterThan(0);
    expect(compareKeys('A', 'AB', 'length')).toBeLessThan(0);
  });

  it('sorts naturally', () => {
    expect(compareKeys('KEY_10', 'KEY_2', 'natural')).toBeGreaterThan(0);
  });
});

describe('sortEnv', () => {
  const env = { ZEBRA: 'z', APPLE: 'a', MANGO: 'm' };

  it('sorts keys ascending by default', () => {
    const result = sortEnv(env);
    expect(result.keys).toEqual(['APPLE', 'MANGO', 'ZEBRA']);
  });

  it('sorts keys descending', () => {
    const result = sortEnv(env, { order: 'desc' });
    expect(result.keys).toEqual(['ZEBRA', 'MANGO', 'APPLE']);
  });

  it('preserves original env', () => {
    const result = sortEnv(env);
    expect(Object.keys(result.original)).toEqual(['ZEBRA', 'APPLE', 'MANGO']);
  });

  it('sorted record has correct values', () => {
    const result = sortEnv(env);
    expect(result.sorted['APPLE']).toBe('a');
    expect(result.sorted['ZEBRA']).toBe('z');
  });

  it('sorts by length strategy', () => {
    const e = { AB: '1', A: '2', ABC: '3' };
    const result = sortEnv(e, { strategy: 'length' });
    expect(result.keys[0]).toBe('A');
    expect(result.keys[2]).toBe('ABC');
  });
});
