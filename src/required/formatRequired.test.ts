import { formatRequiredText, formatRequiredJson } from './formatRequired';
import type { RequiredResult } from './requirer';

describe('formatRequiredText', () => {
  it('reports all keys present when none are missing', () => {
    const result: RequiredResult = {
      missing: [],
      present: ['DB_HOST', 'DB_PORT', 'API_KEY'],
      total: 3,
    };
    const output = formatRequiredText(result);
    expect(output).toContain('All required keys are present');
    expect(output).toContain('DB_HOST');
    expect(output).toContain('DB_PORT');
    expect(output).toContain('API_KEY');
  });

  it('lists missing keys when some are absent', () => {
    const result: RequiredResult = {
      missing: ['SECRET_KEY', 'DATABASE_URL'],
      present: ['API_KEY'],
      total: 3,
    };
    const output = formatRequiredText(result);
    expect(output).toContain('Missing required keys');
    expect(output).toContain('SECRET_KEY');
    expect(output).toContain('DATABASE_URL');
    expect(output).toContain('API_KEY');
  });

  it('shows correct counts in summary', () => {
    const result: RequiredResult = {
      missing: ['MISSING_VAR'],
      present: ['PRESENT_VAR', 'ANOTHER_VAR'],
      total: 3,
    };
    const output = formatRequiredText(result);
    expect(output).toContain('2');
    expect(output).toContain('1');
    expect(output).toContain('3');
  });

  it('handles empty required list gracefully', () => {
    const result: RequiredResult = {
      missing: [],
      present: [],
      total: 0,
    };
    const output = formatRequiredText(result);
    expect(output).toContain('0');
  });
});

describe('formatRequiredJson', () => {
  it('returns valid JSON with all fields', () => {
    const result: RequiredResult = {
      missing: ['FOO'],
      present: ['BAR'],
      total: 2,
    };
    const output = formatRequiredJson(result);
    const parsed = JSON.parse(output);
    expect(parsed.missing).toEqual(['FOO']);
    expect(parsed.present).toEqual(['BAR']);
    expect(parsed.total).toBe(2);
    expect(typeof parsed.ok).toBe('boolean');
    expect(parsed.ok).toBe(false);
  });

  it('sets ok to true when no keys are missing', () => {
    const result: RequiredResult = {
      missing: [],
      present: ['API_KEY', 'DB_URL'],
      total: 2,
    };
    const output = formatRequiredJson(result);
    const parsed = JSON.parse(output);
    expect(parsed.ok).toBe(true);
    expect(parsed.missing).toHaveLength(0);
  });

  it('outputs pretty-printed JSON', () => {
    const result: RequiredResult = {
      missing: [],
      present: ['X'],
      total: 1,
    };
    const output = formatRequiredJson(result);
    expect(output).toContain('\n');
  });
});
