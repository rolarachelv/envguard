export function renderGroup(name: string, entries: Record<string, string>): string {
  const lines = [`[${name}]`];
  for (const [k, v] of Object.entries(entries)) {
    lines.push(`  ${k}=${v}`);
  }
  return lines.join('\n');
}

export function formatGroupText(groups: Record<string, Record<string, string>>): string {
  const keys = Object.keys(groups);
  if (keys.length === 0) return 'No groups found.';
  return keys.map((k) => renderGroup(k, groups[k])).join('\n\n');
}

export function formatGroupJson(groups: Record<string, Record<string, string>>): string {
  return JSON.stringify({ groups }, null, 2);
}
