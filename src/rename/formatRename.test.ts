import { describe, it, expect } from 'vitest';
import { formatRenameText, formatRenameJson } from './formatRename';
import { RenameResult } from './renamer';

const mockResult: RenameResult = {
  renamed: [{ from: 'DB_HOST', to: 'DATABASE_HOST', value: 'localhost' }],
  notFound: ['MISSING_KEY'],
  conflicts: ['DB_PORT'],
  output: { DATABASE_HOST: 'localhost', API_KEY: 'secret' },
};

describe('formatRenameText', () => {
  it('includes renamed keys', () => {
    const text = formatRenameText(mockResult);
    expect(text).toContain('DB_HOST → DATABASE_HOST');
  });

  it('includes not found keys', () => {
    const text = formatRenameText(mockResult);
    expect(text).toContain('MISSING_KEY');
  });

  it('includes conflict keys', () => {
    const text = formatRenameText(mockResult);
    expect(text).toContain('DB_PORT');
  });

  it('returns fallback message when nothing happened', () => {
    const empty: RenameResult = { renamed: [], notFound: [], conflicts: [], output: {} };
    expect(formatRenameText(empty)).toBe('No rename operations performed.');
  });
});

describe('formatRenameJson', () => {
  it('returns valid JSON', () => {
    const json = formatRenameJson(mockResult);
    expect(() => JSON.parse(json)).not.toThrow();
  });

  it('includes renamed, notFound, and conflicts', () => {
    const parsed = JSON.parse(formatRenameJson(mockResult));
    expect(parsed.renamed).toHaveLength(1);
    expect(parsed.notFound).toContain('MISSING_KEY');
    expect(parsed.conflicts).toContain('DB_PORT');
  });
});
