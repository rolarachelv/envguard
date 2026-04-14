import { describe, it, expect } from 'vitest';
import { renameEnvKeys, RenameRule } from './renamer';

describe('renameEnvKeys', () => {
  const baseEnv = {
    DB_HOST: 'localhost',
    DB_PORT: '5432',
    API_KEY: 'secret',
  };

  it('renames a single key', () => {
    const rules: RenameRule[] = [{ from: 'DB_HOST', to: 'DATABASE_HOST' }];
    const result = renameEnvKeys(baseEnv, rules);
    expect(result.renamed).toHaveLength(1);
    expect(result.renamed[0]).toEqual({ from: 'DB_HOST', to: 'DATABASE_HOST', value: 'localhost' });
    expect(result.output['DATABASE_HOST']).toBe('localhost');
    expect('DB_HOST' in result.output).toBe(false);
  });

  it('reports not found keys', () => {
    const rules: RenameRule[] = [{ from: 'MISSING_KEY', to: 'NEW_KEY' }];
    const result = renameEnvKeys(baseEnv, rules);
    expect(result.notFound).toContain('MISSING_KEY');
    expect(result.renamed).toHaveLength(0);
  });

  it('reports conflict when target key already exists', () => {
    const rules: RenameRule[] = [{ from: 'DB_HOST', to: 'DB_PORT' }];
    const result = renameEnvKeys(baseEnv, rules);
    expect(result.conflicts).toContain('DB_PORT');
    expect(result.renamed).toHaveLength(0);
    expect(result.output['DB_HOST']).toBe('localhost');
  });

  it('renames multiple keys', () => {
    const rules: RenameRule[] = [
      { from: 'DB_HOST', to: 'DATABASE_HOST' },
      { from: 'DB_PORT', to: 'DATABASE_PORT' },
    ];
    const result = renameEnvKeys(baseEnv, rules);
    expect(result.renamed).toHaveLength(2);
    expect(result.output['DATABASE_HOST']).toBe('localhost');
    expect(result.output['DATABASE_PORT']).toBe('5432');
  });

  it('does not mutate original env', () => {
    const rules: RenameRule[] = [{ from: 'DB_HOST', to: 'DATABASE_HOST' }];
    renameEnvKeys(baseEnv, rules);
    expect(baseEnv['DB_HOST']).toBe('localhost');
  });
});
