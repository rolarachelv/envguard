import { formatCountText, formatCountJson } from './formatCount';
import { CountResult } from './counter';

const sampleResult: CountResult = {
  total: 6,
  byPrefix: {
    DB: 3,
    APP: 2,
    '(no prefix)': 1,
  },
};

describe('formatCountText', () => {
  it('renders total and prefix breakdown', () => {
    const output = formatCountText(sampleResult);
    expect(output).toContain('Total: 6');
    expect(output).toContain('DB');
    expect(output).toContain('3');
    expect(output).toContain('APP');
    expect(output).toContain('2');
  });

  it('includes no-prefix group', () => {
    const output = formatCountText(sampleResult);
    expect(output).toContain('(no prefix)');
    expect(output).toContain('1');
  });

  it('handles empty result', () => {
    const output = formatCountText({ total: 0, byPrefix: {} });
    expect(output).toContain('Total: 0');
  });
});

describe('formatCountJson', () => {
  it('returns valid JSON with total and byPrefix', () => {
    const output = formatCountJson(sampleResult);
    const parsed = JSON.parse(output);
    expect(parsed.total).toBe(6);
    expect(parsed.byPrefix.DB).toBe(3);
    expect(parsed.byPrefix.APP).toBe(2);
  });

  it('handles empty result', () => {
    const output = formatCountJson({ total: 0, byPrefix: {} });
    const parsed = JSON.parse(output);
    expect(parsed.total).toBe(0);
    expect(parsed.byPrefix).toEqual({});
  });
});
