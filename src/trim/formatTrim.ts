export interface TrimEntry {
  key: string;
  original: string;
  trimmed: string;
  changed: boolean;
}

function renderEntry(entry: TrimEntry): string {
  if (!entry.changed) return `  ${entry.key}=${entry.trimmed} (unchanged)`;
  return `  ${entry.key}: "${entry.original}" → "${entry.trimmed}"`;
}

export function formatTrimText(entries: TrimEntry[]): string {
  const changed = entries.filter((e) => e.changed);
  const unchanged = entries.filter((e) => !e.changed);
  const lines: string[] = ['Trim Results:', ''];

  if (changed.length > 0) {
    lines.push(`Changed (${changed.length}):`);
    changed.forEach((e) => lines.push(renderEntry(e)));
    lines.push('');
  }

  if (unchanged.length > 0) {
    lines.push(`Unchanged (${unchanged.length}):`);
    unchanged.forEach((e) => lines.push(renderEntry(e)));
  }

  return lines.join('\n');
}

export function formatTrimJson(entries: TrimEntry[]): string {
  const summary = {
    total: entries.length,
    changed: entries.filter((e) => e.changed).length,
    unchanged: entries.filter((e) => !e.changed).length,
    entries: entries.map((e) => ({
      key: e.key,
      original: e.original,
      trimmed: e.trimmed,
      changed: e.changed,
    })),
  };
  return JSON.stringify(summary, null, 2);
}
