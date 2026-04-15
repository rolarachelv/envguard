import { describe, it, expect } from 'vitest';
import { promoteEnv, serializePromotedEnv } from './promoter';

describe('promoteEnv', () => {
  const source = { API_KEY: 'prod-secret', DB_URL: 'postgres://prod', NEW_KEY: 'new-val' };
  const target = { API_KEY: 'staging-secret', DB_URL: 'postgres://staging', EXTRA: 'keep' };

  it('promotes all keys from source when no keys filter given', () => {
    const result = promoteEnv(source, target, { overwrite: true });
    expect(result.promoted).toHaveLength(3);
    expect(result.skipped).toHaveLength(0);
    expect(result.merged['API_KEY']).toBe('prod-secret');
    expect(result.merged['EXTRA']).toBe('keep');
  });

  it('skips existing keys when overwrite is false', () => {
    const result = promoteEnv(source, target, { overwrite: false });
    expect(result.skipped.some(s => s.key === 'API_KEY')).toBe(true);
    expect(result.skipped.some(s => s.key === 'DB_URL')).toBe(true);
    expect(result.promoted.some(p => p.key === 'NEW_KEY')).toBe(true);
  });

  it('promotes only specified keys', () => {
    const result = promoteEnv(source, target, { overwrite: true, keys: ['API_KEY'] });
    expect(result.promoted).toHaveLength(1);
    expect(result.promoted[0].key).toBe('API_KEY');
  });

  it('skips keys not found in source', () => {
    const result = promoteEnv(source, target, { overwrite: true, keys: ['MISSING_KEY'] });
    expect(result.skipped[0].reason).toContain('not found in source');
  });

  it('records toValue as undefined for new keys', () => {
    const result = promoteEnv(source, {}, { overwrite: true, keys: ['NEW_KEY'] });
    expect(result.promoted[0].toValue).toBeUndefined();
  });
});

describe('serializePromotedEnv', () => {
  it('serializes merged env to KEY=VALUE lines', () => {
    const output = serializePromotedEnv({ FOO: 'bar', BAZ: 'qux' });
    expect(output).toContain('FOO=bar');
    expect(output).toContain('BAZ=qux');
    expect(output.endsWith('\n')).toBe(true);
  });
});
