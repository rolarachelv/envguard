import { describe, it, expect } from 'vitest';
import { formatMigrationText, formatMigrationJson } from './formatMigration';
import { MigrationPlan } from './migrator';

const mockPlan: MigrationPlan = {
  source: '.env',
  target: '.env.production',
  timestamp: '2024-01-01T00:00:00.000Z',
  entries: [
    { key: 'NEW_KEY', oldValue: undefined, newValue: 'value1', action: 'add' },
    { key: 'OLD_KEY', oldValue: 'value2', newValue: undefined, action: 'remove' },
    { key: 'CHANGED', oldValue: 'before', newValue: 'after', action: 'update' },
    { key: 'RENAMED', oldValue: 'val', newValue: 'val', action: 'rename' },
  ],
};

describe('formatMigrationText', () => {
  it('includes source and target paths', () => {
    const output = formatMigrationText(mockPlan, false);
    expect(output).toContain('.env');
    expect(output).toContain('.env.production');
  });

  it('shows correct change count', () => {
    const output = formatMigrationText(mockPlan, false);
    expect(output).toContain('Changes: 4');
  });

  it('labels add entries', () => {
    const output = formatMigrationText(mockPlan, false);
    expect(output).toContain('[ADD');
    expect(output).toContain('NEW_KEY=value1');
  });

  it('labels remove entries', () => {
    const output = formatMigrationText(mockPlan, false);
    expect(output).toContain('[REMOVE');
    expect(output).toContain('OLD_KEY');
  });

  it('labels update entries', () => {
    const output = formatMigrationText(mockPlan, false);
    expect(output).toContain('[UPDATE');
    expect(output).toContain('before');
    expect(output).toContain('after');
  });

  it('shows no changes message for empty plan', () => {
    const emptyPlan: MigrationPlan = { ...mockPlan, entries: [] };
    const output = formatMigrationText(emptyPlan, false);
    expect(output).toContain('No changes detected.');
  });
});

describe('formatMigrationJson', () => {
  it('returns valid JSON', () => {
    const output = formatMigrationJson(mockPlan);
    expect(() => JSON.parse(output)).not.toThrow();
  });

  it('includes all required fields', () => {
    const parsed = JSON.parse(formatMigrationJson(mockPlan));
    expect(parsed).toHaveProperty('source');
    expect(parsed).toHaveProperty('target');
    expect(parsed).toHaveProperty('timestamp');
    expect(parsed).toHaveProperty('totalChanges', 4);
    expect(parsed.entries).toHaveLength(4);
  });
});
