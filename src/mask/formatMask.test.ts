import { describe, it, expect } from 'vitest';
import { formatMaskText, formatMaskJson } from './formatMask';
import type { MaskResult } from './masker';

const sampleResult: MaskResult = {
  totalMasked: 1,
  entries: [
    { key: 'API_KEY', original: 'secret', masked: '******', wasMasked: true },
    { key: 'HOST', original: 'localhost', masked: 'localhost', wasMasked: false },
  ],
};

describe('formatMaskText', () => {
  it('includes header', () => {
    const output = formatMaskText(sampleResult);
    expect(output).toContain('Mask Result:');
  });

  it('shows masked entry with [masked] tag', () => {
    const output = formatMaskText(sampleResult);
    expect(output).toContain('[masked] API_KEY=******');
  });

  it('shows plain entry with [plain] tag', () => {
    const output = formatMaskText(sampleResult);
    expect(output).toContain('[plain] HOST=localhost');
  });

  it('shows total masked count', () => {
    const output = formatMaskText(sampleResult);
    expect(output).toContain('Total masked: 1');
  });
});

describe('formatMaskJson', () => {
  it('returns valid JSON', () => {
    const output = formatMaskJson(sampleResult);
    expect(() => JSON.parse(output)).not.toThrow();
  });

  it('includes totalMasked', () => {
    const parsed = JSON.parse(formatMaskJson(sampleResult));
    expect(parsed.totalMasked).toBe(1);
  });

  it('includes entries with masked flag', () => {
    const parsed = JSON.parse(formatMaskJson(sampleResult));
    const apiEntry = parsed.entries.find((e: { key: string }) => e.key === 'API_KEY');
    expect(apiEntry.masked).toBe(true);
    expect(apiEntry.value).toBe('******');
  });

  it('does not expose original values', () => {
    const output = formatMaskJson(sampleResult);
    expect(output).not.toContain('original');
  });
});
