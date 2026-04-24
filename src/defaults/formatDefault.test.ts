import { formatDefaultText, formatDefaultJson } from './formatDefault';
import { DefaultResult } from './defaulter';

const results: DefaultResult[] = [
  { key: 'PORT', originalValue: undefined, appliedValue: '3000', wasApplied: true },
  { key: 'NODE_ENV', originalValue: '', appliedValue: 'development', wasApplied: true },
  { key: 'API_KEY', originalValue: 'secret', appliedValue: 'secret', wasApplied: false },
];

describe('formatDefaultText', () => {
  it('shows only applied results by default', () => {
    const output = formatDefaultText(results);
    expect(output).toContain('Defaults applied: 2 of 3');
    expect(output).toContain('PORT');
    expect(output).toContain('NODE_ENV');
    expect(output).not.toContain('API_KEY');
  });

  it('shows all results when showAll is true', () => {
    const output = formatDefaultText(results, true);
    expect(output).toContain('API_KEY');
    expect(output).toContain('[unchanged]');
  });

  it('shows no changes message when nothing applied', () => {
    const noApplied: DefaultResult[] = [
      { key: 'X', originalValue: 'val', appliedValue: 'val', wasApplied: false },
    ];
    const output = formatDefaultText(noApplied);
    expect(output).toContain('(no changes)');
  });
});

describe('formatDefaultJson', () => {
  it('returns valid JSON with summary', () => {
    const output = formatDefaultJson(results);
    const parsed = JSON.parse(output);
    expect(parsed.summary.applied).toBe(2);
    expect(parsed.summary.total).toBe(3);
    expect(parsed.results).toHaveLength(2);
  });

  it('includes all results when showAll is true', () => {
    const output = formatDefaultJson(results, true);
    const parsed = JSON.parse(output);
    expect(parsed.results).toHaveLength(3);
  });

  it('maps null for undefined originalValue', () => {
    const output = formatDefaultJson(results);
    const parsed = JSON.parse(output);
    const portEntry = parsed.results.find((r: { key: string }) => r.key === 'PORT');
    expect(portEntry.originalValue).toBeNull();
  });
});
