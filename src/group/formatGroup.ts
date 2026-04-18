import type { GroupResult } from './grouper';

function renderGroup(name: string, entries: Record<string, string>): string {
  const lines = [`[${name}]`];
  for (const [key, value] of Object.entries(entries)) {
    lines.push(`  ${key}=${value}`);
  }
  return lines.join('\n');
}

export function formatGroupText(result: GroupResult): string {
  const parts: string[] = [];

  for (const [name, entries] of Object.entries(result.groups)) {
    parts.push(renderGroup(name, entries));
  }

  if (Object.keys(result.ungrouped).length > 0) {
    parts.push(renderGroup('(ungrouped)', result.ungrouped));
  }

  return parts.join('\n\n');
}

export function formatGroupJson(result: GroupResult): string {
  return JSON.stringify(
    {
      groups: result.groups,
      ungrouped: result.ungrouped,
    },
    null,
    2
  );
}
