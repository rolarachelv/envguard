export interface SearchMatch {
  key: string;
  value: string;
  matchedOn: 'key' | 'value' | 'both';
}

export interface SearchResult {
  matches: SearchMatch[];
  total: number;
  query: string;
}

export function matchesQuery(str: string, query: string, caseSensitive: boolean): boolean {
  if (caseSensitive) {
    return str.includes(query);
  }
  return str.toLowerCase().includes(query.toLowerCase());
}

export function searchEnv(
  env: Record<string, string>,
  query: string,
  options: { caseSensitive?: boolean; searchKeys?: boolean; searchValues?: boolean } = {}
): SearchResult {
  const { caseSensitive = false, searchKeys = true, searchValues = true } = options;

  const matches: SearchMatch[] = [];

  for (const [key, value] of Object.entries(env)) {
    const keyMatches = searchKeys && matchesQuery(key, query, caseSensitive);
    const valueMatches = searchValues && matchesQuery(value, query, caseSensitive);

    if (keyMatches && valueMatches) {
      matches.push({ key, value, matchedOn: 'both' });
    } else if (keyMatches) {
      matches.push({ key, value, matchedOn: 'key' });
    } else if (valueMatches) {
      matches.push({ key, value, matchedOn: 'value' });
    }
  }

  return { matches, total: matches.length, query };
}
