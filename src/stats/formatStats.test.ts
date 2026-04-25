import { formatStatsText, formatStatsJson } from './formatStats';
import type { EnvStats } from './stats';

const sampleStats: EnvStats = {
  total: 10,
  empty: 2,
  commented: 1,
  withDefaults: 3,
  byType: {
    string: 6,
    number: 2,
    boolean: 2,
  },
  longestKey: 'VERY_LONG_KEY_NAME',
  longestValue: 'some-long-value-string',
  prefixGroups: {
    APP: 4,
    DB: 3,
    OTHER: 3,
  },
};

describe('formatStatsText', () => {
  it('includes total count', () => {
    const result = formatStatsText(sampleStats);
    expect(result).toContain('Total');
    expect(result).toContain('10');
  });

  it('includes empty count', () => {
    const result = formatStatsText(sampleStats);
    expect(result).toContain('Empty');
    expect(result).toContain('2');
  });

  it('includes type breakdown', () => {
    const result = formatStatsText(sampleStats);
    expect(result).toContain('string');
    expect(result).toContain('number');
    expect(result).toContain('boolean');
  });

  it('includes prefix groups', () => {
    const result = formatStatsText(sampleStats);
    expect(result).toContain('APP');
    expect(result).toContain('DB');
  });

  it('includes longest key and value', () => {
    const result = formatStatsText(sampleStats);
    expect(result).toContain('VERY_LONG_KEY_NAME');
    expect(result).toContain('some-long-value-string');
  });
});

describe('formatStatsJson', () => {
  it('returns valid JSON with all fields', () => {
    const result = formatStatsJson(sampleStats);
    const parsed = JSON.parse(result);
    expect(parsed.total).toBe(10);
    expect(parsed.empty).toBe(2);
    expect(parsed.commented).toBe(1);
    expect(parsed.byType.string).toBe(6);
    expect(parsed.prefixGroups.APP).toBe(4);
    expect(parsed.longestKey).toBe('VERY_LONG_KEY_NAME');
  });

  it('is pretty-printed', () => {
    const result = formatStatsJson(sampleStats);
    expect(result).toContain('\n');
  });
});
