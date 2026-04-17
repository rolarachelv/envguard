import { describe, it, expect } from 'vitest';
import { dedupeEnv } from './deduper';

describe('dedupeEnv', () => {
  it('returns entries with no duplicates unchanged', () => {
    const raw = 'FOO=bar\nBAZ=qux';
    const { entries, duplicates } = dedupeEnv(raw);
    expect(entries).toEqual({ FOO: 'bar', BAZ: 'qux' });
    expect(duplicates).toHaveLength(0);
  });

  it('keeps last value by default for duplicates', () => {
    const raw = 'FOO=first\nBAR=x\nFOO=second';
    const { entries, duplicates } = dedupeEnv(raw);
    expect(entries.FOO).toBe('second');
    expect(duplicates).toHaveLength(1);
    expect(duplicates[0]).toMatchObject({ key: 'FOO', kept: 'second' });
  });

  it('keeps first value when strategy is first', () => {
    const raw = 'FOO=first\nFOO=second\nFOO=third';
    const { entries, duplicates } = dedupeEnv(raw, 'first');
    expect(entries.FOO).toBe('first');
    expect(duplicates[0].values).toEqual(['first', 'second', 'third']);
  });

  it('ignores comment lines and blank lines', () => {
    const raw = '# comment\n\nFOO=bar\nFOO=baz';
    const { entries } = dedupeEnv(raw);
    expect(Object.keys(entries)).toEqual(['FOO']);
  });

  it('handles empty input', () => {
    const { entries, duplicates } = dedupeEnv('');
    expect(entries).toEqual({});
    expect(duplicates).toHaveLength(0);
  });
});
