import { formatPrefixText, formatPrefixJson } from './formatPrefix';
import { prefixEnv } from './prefixer';

const env = { FOO: 'bar', APP_BAZ: 'qux' };

describe('formatPrefixText', () => {
  it('shows count of modified keys', () => {
    const results = prefixEnv(env, { prefix: 'APP_' });
    const text = formatPrefixText(results, false);
    expect(text).toContain('1 key(s) modified');
  });

  it('includes rename arrow for changed keys', () => {
    const results = prefixEnv(env, { prefix: 'APP_' });
    const text = formatPrefixText(results, false);
    expect(text).toContain('FOO -> APP_FOO=bar');
  });

  it('shows strip action label', () => {
    const results = prefixEnv({ APP_FOO: 'bar' }, { prefix: 'APP_', strip: true });
    const text = formatPrefixText(results, true);
    expect(text).toContain('stripped');
  });
});

describe('formatPrefixJson', () => {
  it('returns valid JSON', () => {
    const results = prefixEnv(env, { prefix: 'APP_' });
    const json = JSON.parse(formatPrefixJson(results, false));
    expect(json.action).toBe('add');
    expect(json.modified).toBe(1);
    expect(Array.isArray(json.results)).toBe(true);
  });

  it('sets action to strip when stripping', () => {
    const results = prefixEnv({ APP_X: '1' }, { prefix: 'APP_', strip: true });
    const json = JSON.parse(formatPrefixJson(results, true));
    expect(json.action).toBe('strip');
  });
});
