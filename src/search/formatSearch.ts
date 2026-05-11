import type { SearchResult, SearchMatch } from './searcher';

function renderMatch(match: SearchMatch, index: number): string {
  const tag = `[${match.matchedOn}]`;
  return `  ${index + 1}. ${match.key}=${match.value}  ${tag}`;
}

export function formatSearchText(result: SearchResult): string {
  if (result.total === 0) {
    return `No matches found for query: "${result.query}"`;
  }

  const lines: string[] = [
    `Search results for "${result.query}" (${result.total} match${result.total !== 1 ? 'es' : ''}):`,
  ];

  result.matches.forEach((match, i) => {
    lines.push(renderMatch(match, i));
  });

  return lines.join('\n');
}

export function formatSearchJson(result: SearchResult): string {
  return JSON.stringify(
    {
      query: result.query,
      total: result.total,
      matches: result.matches,
    },
    null,
    2
  );
}
