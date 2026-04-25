import { computeStats } from './stats';
import { formatStatsText, formatStatsJson } from './formatStats';

describe('computeStats', () => {
  it('returns zeroed stats for empty env', () => {
    const stats = computeStats({});
    expect(stats.total).toBe(0);
    expect(stats.empty).toBe(0);
    expect(stats.nonEmpty).toBe(0);
    expect(stats.uniquePrefixes).toBe(0);
  });

  it('counts total, empty and nonEmpty keys', () => {
    const stats = computeStats({
      DB_HOST: 'localhost',
      DB_PORT: '5432',
      DB_PASS: '',
      APP_NAME: 'envguard',
    });
    expect(stats.total).toBe(4);
    expect(stats.empty).toBe(1);
    expect(stats.nonEmpty).toBe(3);
  });

  it('computes prefix breakdown', () => {
    const stats = computeStats({
      DB_HOST: 'localhost',
      DB_PORT: '5432',
      APP_NAME: 'envguard',
    });
    expect(stats.prefixBreakdown['DB']).toBe(2);
    expect(stats.prefixBreakdown['APP']).toBe(1);
    expect(stats.uniquePrefixes).toBe(2);
  });

  it('identifies longest and shortest keys', () => {
    const stats = computeStats({
      A: '1',
      VERY_LONG_KEY_NAME: '2',
      MID: '3',
    });
    expect(stats.longestKey).toBe('VERY_LONG_KEY_NAME');
    expect(stats.shortestKey).toBe('A');
  });

  it('calculates average value length', () => {
    const stats = computeStats({
      K1: 'ab',
      K2: 'abcd',
    });
    expect(stats.averageValueLength).toBe(3);
  });

  it('assigns (none) prefix for keys without underscore', () => {
    const stats = computeStats({ NODASH: 'value' });
    expect(stats.prefixBreakdown['(none)']).toBe(1);
  });
});

describe('formatStatsText', () => {
  it('includes summary lines', () => {
    const stats = computeStats({ DB_HOST: 'localhost', DB_PORT: '' });
    const output = formatStatsText(stats);
    expect(output).toContain('Total keys');
    expect(output).toContain('Prefix breakdown');
    expect(output).toContain('DB');
  });
});

describe('formatStatsJson', () => {
  it('returns valid JSON', () => {
    const stats = computeStats({ APP_KEY: 'abc' });
    const json = JSON.parse(formatStatsJson(stats));
    expect(json.total).toBe(1);
    expect(json.nonEmpty).toBe(1);
  });
});
