import { formatTrimText, formatTrimJson, TrimEntry } from './formatTrim';

const entries: TrimEntry[] = [
  { key: 'API_KEY', original: '  abc123  ', trimmed: 'abc123', changed: true },
  { key: 'PORT', original: '8080', trimmed: '8080', changed: false },
  { key: 'HOST', original: ' localhost ', trimmed: 'localhost', changed: true },
];

describe('formatTrimText', () => {
  it('includes changed section when entries were trimmed', () => {
    const output = formatTrimText(entries);
    expect(output).toContain('Changed (2):');
    expect(output).toContain('API_KEY');
    expect(output).toContain('HOST');
  });

  it('includes unchanged section', () => {
    const output = formatTrimText(entries);
    expect(output).toContain('Unchanged (1):');
    expect(output).toContain('PORT');
  });

  it('shows arrow for changed values', () => {
    const output = formatTrimText(entries);
    expect(output).toContain('→');
  });

  it('handles all unchanged entries', () => {
    const unchanged: TrimEntry[] = [
      { key: 'X', original: 'val', trimmed: 'val', changed: false },
    ];
    const output = formatTrimText(unchanged);
    expect(output).not.toContain('Changed');
    expect(output).toContain('Unchanged (1):');
  });
});

describe('formatTrimJson', () => {
  it('returns valid JSON', () => {
    const output = formatTrimJson(entries);
    expect(() => JSON.parse(output)).not.toThrow();
  });

  it('includes summary counts', () => {
    const parsed = JSON.parse(formatTrimJson(entries));
    expect(parsed.total).toBe(3);
    expect(parsed.changed).toBe(2);
    expect(parsed.unchanged).toBe(1);
  });

  it('includes all entries', () => {
    const parsed = JSON.parse(formatTrimJson(entries));
    expect(parsed.entries).toHaveLength(3);
    expect(parsed.entries[0].key).toBe('API_KEY');
    expect(parsed.entries[0].changed).toBe(true);
  });
});
