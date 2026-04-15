import { formatValidateText, formatValidateJson } from './formatValidate';
import { ValidationResult } from '../validator/validator';

const mockResult: ValidationResult = {
  valid: ['PORT', 'HOST'],
  missing: ['DATABASE_URL'],
  errors: [
    { key: 'TIMEOUT', message: 'Expected a number, got "abc"' },
  ],
};

describe('formatValidateText', () => {
  it('includes a header', () => {
    const output = formatValidateText(mockResult);
    expect(output).toContain('Validation Report');
  });

  it('marks valid keys with a check', () => {
    const output = formatValidateText(mockResult);
    expect(output).toContain('[✓] HOST');
    expect(output).toContain('[✓] PORT');
  });

  it('marks missing keys with a cross', () => {
    const output = formatValidateText(mockResult);
    expect(output).toContain('[✗] DATABASE_URL');
    expect(output).toContain('Required variable is missing');
  });

  it('marks invalid keys with an exclamation', () => {
    const output = formatValidateText(mockResult);
    expect(output).toContain('[!] TIMEOUT');
    expect(output).toContain('Expected a number, got "abc"');
  });

  it('includes a summary line', () => {
    const output = formatValidateText(mockResult);
    expect(output).toContain('2/4 passed, 2 issue(s) found.');
  });
});

describe('formatValidateJson', () => {
  it('returns valid JSON', () => {
    const output = formatValidateJson(mockResult);
    expect(() => JSON.parse(output)).not.toThrow();
  });

  it('includes summary counts', () => {
    const parsed = JSON.parse(formatValidateJson(mockResult));
    expect(parsed.summary.total).toBe(4);
    expect(parsed.summary.passed).toBe(2);
    expect(parsed.summary.missing).toBe(1);
    expect(parsed.summary.invalid).toBe(1);
  });

  it('includes entries array', () => {
    const parsed = JSON.parse(formatValidateJson(mockResult));
    expect(Array.isArray(parsed.entries)).toBe(true);
    expect(parsed.entries.length).toBe(4);
  });

  it('entries are sorted alphabetically', () => {
    const parsed = JSON.parse(formatValidateJson(mockResult));
    const keys = parsed.entries.map((e: { key: string }) => e.key);
    expect(keys).toEqual([...keys].sort());
  });
});
