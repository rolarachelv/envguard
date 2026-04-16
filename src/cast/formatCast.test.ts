import { describe, it, expect } from 'vitest';
import { formatCastText, formatCastJson } from './formatCast';
import type { CastResult } from './caster';

const results: CastResult[] = [
  { key: 'PORT', originalValue: '3000', castedValue: 3000, type: 'number', success: true },
  { key: 'DEBUG', originalValue: 'true', castedValue: true, type: 'boolean', success: true },
  {
    key: 'BAD',
    originalValue: 'oops',
    castedValue: null,
    type: 'number',
    success: false,
    error: 'Cannot cast "oops" to number',
  },
];

describe('formatCastText', () => {
  it('returns message when no results', () => {
    expect(formatCastText([])).toBe('No cast rules applied.');
  });

  it('includes all keys in output', () => {
    const out = formatCastText(results);
    expect(out).toContain('PORT');
    expect(out).toContain('DEBUG');
    expect(out).toContain('BAD');
  });

  it('shows summary counts', () => {
    const out = formatCastText(results);
    expect(out).toContain('Total: 3');
    expect(out).toContain('Succeeded: 2');
    expect(out).toContain('Failed: 1');
  });

  it('marks success with checkmark and failure with cross', () => {
    const out = formatCastText(results);
    expect(out).toContain('✔');
    expect(out).toContain('✘');
  });
});

describe('formatCastJson', () => {
  it('returns valid JSON', () => {
    const out = formatCastJson(results);
    expect(() => JSON.parse(out)).not.toThrow();
  });

  it('includes summary and results', () => {
    const parsed = JSON.parse(formatCastJson(results));
    expect(parsed.summary).toEqual({ total: 3, succeeded: 2, failed: 1 });
    expect(parsed.results).toHaveLength(3);
  });

  it('includes error field only when failed', () => {
    const parsed = JSON.parse(formatCastJson(results));
    expect(parsed.results[0].error).toBeUndefined();
    expect(parsed.results[2].error).toBeDefined();
  });
});
