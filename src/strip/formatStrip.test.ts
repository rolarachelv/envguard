import { formatStripText, formatStripJson } from './formatStrip';
import type { StripResult } from './stripper';

const mockResult: StripResult = {
  entries: [
    { key: 'API_KEY', originalLine: 'API_KEY=secret123', kept: true },
    { key: null, originalLine: '# This is a comment', kept: false, reason: 'comment' },
    { key: null, originalLine: '', kept: false, reason: 'blank' },
    { key: 'DB_HOST', originalLine: 'DB_HOST=localhost', kept: true },
    { key: null, originalLine: '  ', kept: false, reason: 'blank' },
  ],
  totalLines: 5,
  keptLines: 2,
  removedLines: 3,
};

describe('formatStripText', () => {
  it('renders a summary with counts', () => {
    const output = formatStripText(mockResult);
    expect(output).toContain('Strip Summary');
    expect(output).toContain('Total lines: 5');
    expect(output).toContain('Kept: 2');
    expect(output).toContain('Removed: 3');
  });

  it('lists removed lines with reasons', () => {
    const output = formatStripText(mockResult);
    expect(output).toContain('comment');
    expect(output).toContain('blank');
  });

  it('handles empty result gracefully', () => {
    const empty: StripResult = {
      entries: [],
      totalLines: 0,
      keptLines: 0,
      removedLines: 0,
    };
    const output = formatStripText(empty);
    expect(output).toContain('Total lines: 0');
    expect(output).toContain('Removed: 0');
  });
});

describe('formatStripJson', () => {
  it('returns a valid JSON string', () => {
    const output = formatStripJson(mockResult);
    expect(() => JSON.parse(output)).not.toThrow();
  });

  it('includes summary fields', () => {
    const parsed = JSON.parse(formatStripJson(mockResult));
    expect(parsed.totalLines).toBe(5);
    expect(parsed.keptLines).toBe(2);
    expect(parsed.removedLines).toBe(3);
  });

  it('includes entries array', () => {
    const parsed = JSON.parse(formatStripJson(mockResult));
    expect(Array.isArray(parsed.entries)).toBe(true);
    expect(parsed.entries).toHaveLength(5);
  });

  it('marks kept and removed entries correctly', () => {
    const parsed = JSON.parse(formatStripJson(mockResult));
    const kept = parsed.entries.filter((e: { kept: boolean }) => e.kept);
    const removed = parsed.entries.filter((e: { kept: boolean }) => !e.kept);
    expect(kept).toHaveLength(2);
    expect(removed).toHaveLength(3);
  });
});
