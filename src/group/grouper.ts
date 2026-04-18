export interface GroupedEnv {
  [group: string]: Record<string, string>;
}

export interface GroupResult {
  groups: GroupedEnv;
  ungrouped: Record<string, string>;
}

export function getGroupKey(key: string, delimiter: string = '_'): string | null {
  const idx = key.indexOf(delimiter);
  if (idx <= 0) return null;
  return key.slice(0, idx);
}

export function groupEnv(
  env: Record<string, string>,
  delimiter: string = '_'
): GroupResult {
  const groups: GroupedEnv = {};
  const ungrouped: Record<string, string> = {};

  for (const [key, value] of Object.entries(env)) {
    const group = getGroupKey(key, delimiter);
    if (group) {
      if (!groups[group]) groups[group] = {};
      groups[group][key] = value;
    } else {
      ungrouped[key] = value;
    }
  }

  return { groups, ungrouped };
}
