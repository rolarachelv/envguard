export interface DedupeEntry {
  key: string;
  value: string;
  duplicateCount: number;
}

export interface DedupeResult {
  entries: DedupeEntry[];
  totalRemoved: number;
}

export function renderEntry(entry: DedupeEntry): string {
  const suffix = entry.duplicateCount > 0 ? ` (removed ${entry.duplicateCount} duplicate${entry.duplicateCount > 1 ? 's' : ''})` : '';
  return `  ${entry.key}=${entry.value}${suffix}`;
}

export function formatDedupeText(result: DedupeResult): string {
  if (result.entries.length === 0) {
    return 'No entries found.\n';
  }

  const lines: string[] = ['Deduplicated env entries:\n'];

  for (const entry of result.entries) {
    lines.push(renderEntry(entry));
  }

  lines.push('');
  lines.push(`Total duplicates removed: ${result.totalRemoved}`);

  return lines.join('\n');
}

export function formatDedupeJson(result: DedupeResult): string {
  return JSON.stringify(
    {
      entries: result.entries,
      totalRemoved: result.totalRemoved,
    },
    null,
    2
  );
}
