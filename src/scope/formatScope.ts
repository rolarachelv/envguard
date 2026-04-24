import { ScopeResult } from './scoper';

function renderEntry(key: string, value: string): string {
  return `  ${key}=${value}`;
}

export function formatScopeText(
  result: ScopeResult,
  scopes?: string[]
): string {
  const lines: string[] = [];

  if (scopes) {
    lines.push(`Available scopes (${scopes.length}):`);
    for (const s of scopes) {
      lines.push(`  - ${s}`);
    }
    return lines.join('\n');
  }

  lines.push(`Scope: ${result.scope}`);
  lines.push(`Matched entries: ${result.total}`);

  if (result.total === 0) {
    lines.push('  (none)');
  } else {
    for (const [key, value] of Object.entries(result.entries)) {
      lines.push(renderEntry(key, value));
    }
  }

  return lines.join('\n');
}

export function formatScopeJson(
  result: ScopeResult,
  scopes?: string[]
): string {
  if (scopes) {
    return JSON.stringify({ scopes }, null, 2);
  }

  return JSON.stringify(
    {
      scope: result.scope,
      total: result.total,
      entries: result.entries,
    },
    null,
    2
  );
}
