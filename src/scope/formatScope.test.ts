import { formatScopeText, formatScopeJson } from './formatScope';
import { ScopeResult } from './scoper';

const result: ScopeResult = {
  scope: 'DB_',
  entries: { DB_HOST: 'localhost', DB_PORT: '5432' },
  total: 2,
};

describe('formatScopeText', () => {
  it('renders scope and entries', () => {
    const output = formatScopeText(result);
    expect(output).toContain('Scope: DB_');
    expect(output).toContain('Matched entries: 2');
    expect(output).toContain('DB_HOST=localhost');
    expect(output).toContain('DB_PORT=5432');
  });

  it('renders (none) when no entries', () => {
    const empty: ScopeResult = { scope: 'X_', entries: {}, total: 0 };
    const output = formatScopeText(empty);
    expect(output).toContain('(none)');
  });

  it('renders available scopes list when scopes provided', () => {
    const output = formatScopeText(result, ['DB', 'REDIS']);
    expect(output).toContain('Available scopes (2)');
    expect(output).toContain('- DB');
    expect(output).toContain('- REDIS');
  });

  it('does not render available scopes section when scopes not provided', () => {
    const output = formatScopeText(result);
    expect(output).not.toContain('Available scopes');
  });

  it('renders available scopes (0) when empty scopes array provided', () => {
    const output = formatScopeText(result, []);
    expect(output).toContain('Available scopes (0)');
  });
});

describe('formatScopeJson', () => {
  it('returns valid JSON with scope result', () => {
    const output = formatScopeJson(result);
    const parsed = JSON.parse(output);
    expect(parsed.scope).toBe('DB_');
    expect(parsed.total).toBe(2);
    expect(parsed.entries.DB_HOST).toBe('localhost');
  });

  it('returns scopes list JSON when scopes provided', () => {
    const output = formatScopeJson(result, ['DB', 'REDIS']);
    const parsed = JSON.parse(output);
    expect(parsed.scopes).toEqual(['DB', 'REDIS']);
    expect(parsed).not.toHaveProperty('scope');
  });

  it('returns scopes as empty array when empty scopes provided', () => {
    const output = formatScopeJson(result, []);
    const parsed = JSON.parse(output);
    expect(parsed.scopes).toEqual([]);
  });
});
