import { describe, it, expect } from 'vitest';
import { formatSortText, formatSortJson } from './formatSort';
import type { SortResult } from './sorter';

const unsortedResult: SortResult = {
  original: { ZEBRA: 'z', APPLE: 'a', MANGO: 'm' },
  sorted: { APPLE: 'a', MANGO: 'm', ZEBRA: 'z' },
  keys: ['APPLE', 'MANGO', 'ZEBRA'],
};

const alreadySortedResult: SortResult = {
  original: { APPLE: 'a', MANGO: 'm', ZEBRA: 'z' },
  sorted: { APPLE: 'a', MANGO: 'm', ZEBRA: 'z' },
  keys: ['APPLE', 'MANGO', 'ZEBRA'],
};

describe('formatSortText', () => {
  it('shows sorted variables when order changed', () => {
    const output = formatSortText(unsortedResult);
    expect(output).toContain('Sorted env variables:');
    expect(output).toContain('APPLE=a');
    expect(output).toContain('ZEBRA=z');
    expect(output).toContain('Total: 3 variable(s)');
  });

  it('reports no changes when already sorted', () => {
    const output = formatSortText(alreadySortedResult);
    expect(output).toContain('already sorted');
  });
});

describe('formatSortJson', () => {
  it('returns valid JSON', () => {
    const output = formatSortJson(unsortedResult);
    expect(() => JSON.parse(output)).not.toThrow();
  });

  it('includes total and sorted map', () => {
    const parsed = JSON.parse(formatSortJson(unsortedResult));
    expect(parsed.total).toBe(3);
    expect(parsed.sorted).toHaveProperty('APPLE');
  });

  it('reports reordered entries', () => {
    const parsed = JSON.parse(formatSortJson(unsortedResult));
    expect(parsed.reorderedCount).toBeGreaterThan(0);
    expect(parsed.reordered.length).toBeGreaterThan(0);
  });

  it('reports zero reordered when already sorted', () => {
    const parsed = JSON.parse(formatSortJson(alreadySortedResult));
    expect(parsed.reorderedCount).toBe(0);
  });
});
