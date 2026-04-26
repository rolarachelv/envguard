import { checkRequired, RequiredSummary } from './requirer';
import { EnvMap } from '../env/loader';

describe('checkRequired', () => {
  const env: EnvMap = {
    DATABASE_URL: 'postgres://localhost/db',
    API_KEY: 'abc123',
    EMPTY_VAR: '',
    WHITESPACE_VAR: '   ',
  };

  it('marks present keys correctly', () => {
    const result = checkRequired(env, ['DATABASE_URL', 'API_KEY']);
    expect(result.allPresent).toBe(true);
    expect(result.missingCount).toBe(0);
    expect(result.presentCount).toBe(2);
    result.results.forEach((r) => expect(r.present).toBe(true));
  });

  it('marks missing keys correctly', () => {
    const result = checkRequired(env, ['DATABASE_URL', 'MISSING_KEY']);
    expect(result.allPresent).toBe(false);
    expect(result.missingCount).toBe(1);
    expect(result.presentCount).toBe(1);
    const missing = result.results.find((r) => r.key === 'MISSING_KEY');
    expect(missing?.present).toBe(false);
    expect(missing?.value).toBeUndefined();
  });

  it('treats empty string as missing', () => {
    const result = checkRequired(env, ['EMPTY_VAR']);
    expect(result.allPresent).toBe(false);
    expect(result.missingCount).toBe(1);
  });

  it('treats whitespace-only value as missing', () => {
    const result = checkRequired(env, ['WHITESPACE_VAR']);
    expect(result.allPresent).toBe(false);
    expect(result.missingCount).toBe(1);
  });

  it('returns empty summary for empty key list', () => {
    const result = checkRequired(env, []);
    expect(result.allPresent).toBe(true);
    expect(result.missingCount).toBe(0);
    expect(result.presentCount).toBe(0);
    expect(result.results).toHaveLength(0);
  });

  it('includes value for present keys', () => {
    const result = checkRequired(env, ['API_KEY']);
    const entry = result.results[0];
    expect(entry.value).toBe('abc123');
  });
});
