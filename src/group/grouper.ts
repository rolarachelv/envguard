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

/**
 * Returns the sorted list of unique group names present in the given env object.
 *
 * @param env - The environment variables to inspect.
 * @param sep - The separator used to determine group keys (default: '_').
 * @returns An alphabetically sorted array of group key strings.
 */
export function getGroupNames(
  env: Record<string, string>,
  sep = '_'
): string[] {
  const names = new Set<string>();
  for (const key of Object.keys(env)) {
    names.add(getGroupKey(key, sep));
  }
  return Array.from(names).sort();
}
