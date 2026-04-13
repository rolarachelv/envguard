import { describe, it, expect } from 'vitest';
import { buildMigrationPlan, applyMigration, serializeMigratedEnv } from './migrator';

describe('buildMigrationPlan', () => {
  it('detects added keys', () => {
    const plan = buildMigrationPlan({ A: '1' }, { A: '1', B: '2' });
    expect(plan).toContainEqual({ key: 'B', oldValue: undefined, newValue: '2', action: 'add' });
  });

  it('detects removed keys', () => {
    const plan = buildMigrationPlan({ A: '1', B: '2' }, { A: '1' });
    expect(plan).toContainEqual({ key: 'B', oldValue: '2', newValue: undefined, action: 'remove' });
  });

  it('detects updated keys', () => {
    const plan = buildMigrationPlan({ A: 'old' }, { A: 'new' });
    expect(plan).toContainEqual({ key: 'A', oldValue: 'old', newValue: 'new', action: 'update' });
  });

  it('detects renamed keys', () => {
    const plan = buildMigrationPlan({ OLD_KEY: 'val' }, { NEW_KEY: 'val' }, { OLD_KEY: 'NEW_KEY' });
    expect(plan).toContainEqual(expect.objectContaining({ key: 'NEW_KEY', action: 'rename' }));
  });

  it('returns empty plan for identical envs', () => {
    const plan = buildMigrationPlan({ A: '1' }, { A: '1' });
    expect(plan).toHaveLength(0);
  });
});

describe('applyMigration', () => {
  it('applies add action', () => {
    const result = applyMigration({ A: '1' }, [{ key: 'B', oldValue: undefined, newValue: '2', action: 'add' }]);
    expect(result).toEqual({ A: '1', B: '2' });
  });

  it('applies remove action', () => {
    const result = applyMigration({ A: '1', B: '2' }, [{ key: 'B', oldValue: '2', newValue: undefined, action: 'remove' }]);
    expect(result).not.toHaveProperty('B');
  });

  it('applies update action', () => {
    const result = applyMigration({ A: 'old' }, [{ key: 'A', oldValue: 'old', newValue: 'new', action: 'update' }]);
    expect(result.A).toBe('new');
  });
});

describe('serializeMigratedEnv', () => {
  it('serializes env to dotenv format', () => {
    const output = serializeMigratedEnv({ FOO: 'bar', BAZ: 'qux' });
    expect(output).toContain('FOO=bar');
    expect(output).toContain('BAZ=qux');
  });
});
