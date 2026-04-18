import { formatDedupeText, formatDedupeJson, DedupeResult } from './formatDedupe';

const sampleResult: DedupeResult = {
  entries: [
    { key: 'HOST', value: 'localhost', duplicateCount: 2 },
    { key: 'PORT', value: '3000', duplicateCount: 0 },
    { key: 'DEBUG', value: 'true', duplicateCount: 1 },
  ],
  totalRemoved: 3,
};

describe('formatDedupeText', () => {
  it('renders all entries with duplicate info', () => {
    const output = formatDedupeText(sampleResult);
    expect(output).toContain('HOST=localhost');
    expect(output).toContain('removed 2 duplicates');
    expect(output).toContain('PORT=3000');
    expect(output).not.toMatch(/PORT=3000.*duplicate/);
    expect(output).toContain('removed 1 duplicate');
    expect(output).toContain('Total duplicates removed: 3');
  });

  it('handles empty entries', () => {
    const output = formatDedupeText({ entries: [], totalRemoved: 0 });
    expect(output).toContain('No entries found.');
  });
});

describe('formatDedupeJson', () => {
  it('returns valid JSON with entries and totalRemoved', () => {
    const output = formatDedupeJson(sampleResult);
    const parsed = JSON.parse(output);
    expect(parsed.totalRemoved).toBe(3);
    expect(parsed.entries).toHaveLength(3);
    expect(parsed.entries[0].key).toBe('HOST');
    expect(parsed.entries[0].duplicateCount).toBe(2);
  });

  it('serializes zero duplicates correctly', () => {
    const result: DedupeResult = {
      entries: [{ key: 'API_KEY', value: 'abc', duplicateCount: 0 }],
      totalRemoved: 0,
    };
    const parsed = JSON.parse(formatDedupeJson(result));
    expect(parsed.totalRemoved).toBe(0);
    expect(parsed.entries[0].duplicateCount).toBe(0);
  });
});
