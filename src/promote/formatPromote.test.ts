import { describe, it, expect } from 'vitest';
import { formatPromoteText, formatPromoteJson } from './formatPromote';
import type { PromoteResult } from './promoter';

const sampleResult: PromoteResult = {
  promoted: [
    { key: 'API_KEY', fromValue: 'prod-secret', toValue: 'staging-secret' },
    { key: 'NEW_KEY', fromValue: 'new-val', toValue: undefined },
  ],
  skipped: [
    { key: 'DB_URL', reason: 'key already exists in target (use --overwrite to replace)' },
  ],
  merged: { API_KEY: 'prod-secret', NEW_KEY: 'new-val', DB_URL: 'postgres://staging' },
};

describe('formatPromoteText', () => {
  it('lists promoted keys with before/after values', () => {
    const output = formatPromoteText(sampleResult);
    expect(output).toContain('Promoted (2)');
    expect(output).toContain('API_KEY');
    expect(output).toContain('prod-secret');
  });

  it('lists skipped keys with reasons', () => {
    const output = formatPromoteText(sampleResult);
    expect(output).toContain('Skipped (1)');
    expect(output).toContain('DB_URL');
  });

  it('masks values when mask=true', () => {
    const output = formatPromoteText(sampleResult, true);
    expect(output).not.toContain('prod-secret');
    expect(output).toContain('API_KEY');
  });

  it('shows no keys message for empty result', () => {
    const empty: PromoteResult = { promoted: [], skipped: [], merged: {} };
    expect(formatPromoteText(empty)).toContain('No keys to promote.');
  });
});

describe('formatPromoteJson', () => {
  it('returns valid JSON with promoted and skipped arrays', () => {
    const json = JSON.parse(formatPromoteJson(sampleResult));
    expect(json.totalPromoted).toBe(2);
    expect(json.totalSkipped).toBe(1);
    expect(json.promoted[0].key).toBe('API_KEY');
  });

  it('masks values in JSON output when mask=true', () => {
    const json = JSON.parse(formatPromoteJson(sampleResult, true));
    expect(json.promoted[0].fromValue).not.toBe('prod-secret');
  });

  it('sets toValue to null for new keys', () => {
    const json = JSON.parse(formatPromoteJson(sampleResult));
    const newKey = json.promoted.find((p: { key: string }) => p.key === 'NEW_KEY');
    expect(newKey.toValue).toBeNull();
  });
});
