import { formatVerifyText, formatVerifyJson } from './formatVerify';
import { VerifyReport } from './verifier';

const mockReport: VerifyReport = {
  file: '/app/.env',
  results: [
    { key: 'HOST', expected: 'localhost', actual: 'localhost', match: true },
    { key: 'PORT', expected: '3000', actual: '8080', match: false },
    { key: 'SECRET', expected: 'abc', actual: undefined, match: false },
  ],
  passed: 1,
  failed: 2,
};

describe('formatVerifyText', () => {
  it('includes file path', () => {
    expect(formatVerifyText(mockReport)).toContain('/app/.env');
  });

  it('shows checkmark for passing keys', () => {
    expect(formatVerifyText(mockReport)).toContain('✔ HOST');
  });

  it('shows cross and values for failing keys', () => {
    const out = formatVerifyText(mockReport);
    expect(out).toContain('✘ PORT');
    expect(out).toContain('expected "3000"');
    expect(out).toContain('got "8080"');
  });

  it('shows missing for undefined actual', () => {
    expect(formatVerifyText(mockReport)).toContain('(missing)');
  });

  it('shows summary counts', () => {
    const out = formatVerifyText(mockReport);
    expect(out).toContain('Passed: 1');
    expect(out).toContain('Failed: 2');
  });
});

describe('formatVerifyJson', () => {
  it('returns valid JSON', () => {
    const out = formatVerifyJson(mockReport);
    expect(() => JSON.parse(out)).not.toThrow();
  });

  it('includes all fields', () => {
    const parsed = JSON.parse(formatVerifyJson(mockReport));
    expect(parsed.passed).toBe(1);
    expect(parsed.failed).toBe(2);
    expect(parsed.results).toHaveLength(3);
  });
});
