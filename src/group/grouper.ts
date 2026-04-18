export function getGroupKey(key: string, sep: string): string {
  const idx = key.indexOf(sep);
  return idx > 0 ? key.slice(0, idx) : '__UNGROUPED__';
}

export function groupEnv(
  env: Record<string, string>,
  sep = '_'
): Record<string, Record<string, string>> {
  const groups: Record<string, Record<string, string>> = {};
  for (const [key, value] of Object.entries(env)) {
    const groupKey = getGroupKey(key, sep);
    if (!groups[groupKey]) groups[groupKey] = {};
    groups[groupKey][key] = value;
  }
  return groups;
}
