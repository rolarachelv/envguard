import { describe, it, expect } from 'vitest';
import { formatSearchText, formatSearchJson } from './formatSearch';
import type { SearchResult } from './searcher';

const matchingResult: SearchResult = {
  query: 'APP',
  total: 2,
  matches: [
    { key: 'APP_NAME', value: 'myapp', matchedOn: 'key' },
    { key: 'APP_SECRET', value: 'supersecret', matchedOn: 'key' },
  ],
};

const emptyResult: SearchResult = {
  query: 'NOTHING',
  total: 0,
  matches: [],
};

describe('formatSearchText', () => {
  it('shows no matches message when empty', () => {
    const output = formatSearchText(emptyResult);
    expect(output).toContain('No matches found');
    expect(output).toContain('NOTHING');
  });

  it('formats matches with count and labels', () => {
    const output = formatSearchText(matchingResult);
    expect(output).toContain('"APP"');
    expect(output).toContain('2 matches');
    expect(output).toContain('APP_NAME=myapp');
    expect(output).toContain('[key]');
  });

  it('uses singular "match" for one result', () => {
    const single: SearchResult = {
      query: 'DEBUG',
      total: 1,
      matches: [{ key: 'DEBUG', value: 'true', matchedOn: 'both' }],
    };
    const output = formatSearchText(single);
    expect(output).toContain('1 match');
    expect(output).not.toContain('1 matches');
  });
});

describe('formatSearchJson', () => {
  it('returns valid JSON with expected fields', () => {
    const output = formatSearchJson(matchingResult);
    const parsed = JSON.parse(output);
    expect(parsed.query).toBe('APP');
    expect(parsed.total).toBe(2);
    expect(parsed.matches).toHaveLength(2);
  });

  it('returns empty matches array when no results', () => {
    const output = formatSearchJson(emptyResult);
    const parsed = JSON.parse(output);
    expect(parsed.matches).toEqual([]);
    expect(parsed.total).toBe(0);
  });
});
