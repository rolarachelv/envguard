import type { SortResult } from './sorter';

export function renderEntry(key: string, value: string): string {
  return `${key}=${value}`;
}

export function formatSortText(result: SortResult): string {
  const lines: string[] = [];

  const originalKeys = Object.keys(result.original);
  const changed = result.keys.some((k, i) => k !== originalKeys[i]);

  if (!changed) {
    lines.push('No changes — env is already sorted.');
    return lines.join('\n');
  }

  lines.push('Sorted env variables:');
  lines.push('');
  for (const key of result.keys) {
    lines.push(renderEntry(key, result.sorted[key]));
  }

  lines.push('');
  lines.push(`Total: ${result.keys.length} variable(s)`);

  return lines.join('\n');
}

export function formatSortJson(result: SortResult): string {
  const originalKeys = Object.keys(result.original);
  const reordered: Array<{ key: string; value: string; movedFrom: number; movedTo: number }> = [];

  for (let i = 0; i < result.keys.length; i++) {
    const key = result.keys[i];
    const originalIndex = originalKeys.indexOf(key);
    if (originalIndex !== i) {
      reordered.push({ key, value: result.sorted[key], movedFrom: originalIndex, movedTo: i });
    }
  }

  return JSON.stringify(
    {
      total: result.keys.length,
      reorderedCount: reordered.length,
      sorted: result.sorted,
      reordered,
    },
    null,
    2
  );
}
