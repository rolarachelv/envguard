import type { MergeResult } from './merger';

function renderConflicts(result: MergeResult): string {
  if (result.conflicts.length === 0) return '';
  const lines: string[] = ['Conflicts:'];
  for (const c of result.conflicts) {
    lines.push(`  ${c.key}:`);
    c.values.forEach((v, i) => {
      lines.push(`    [${c.sources[i] ?? 'unknown'}] ${v}`);
    });
  }
  return lines.join('\n');
}

export function formatMergeText(result: MergeResult): string {
  const lines: string[] = [];
  lines.push(`Sources: ${result.sources.join(', ')}`);
  lines.push(`Merged keys: ${Object.keys(result.merged).length}`);

  if (result.conflicts.length > 0) {
    lines.push(`Conflicts: ${result.conflicts.length}`);
    lines.push(renderConflicts(result));
  } else {
    lines.push('No conflicts detected.');
  }

  lines.push('');
  lines.push('Result:');
  for (const [key, value] of Object.entries(result.merged)) {
    lines.push(`  ${key}=${value}`);
  }

  return lines.join('\n');
}

export function formatMergeJson(result: MergeResult): string {
  return JSON.stringify(
    {
      sources: result.sources,
      mergedCount: Object.keys(result.merged).length,
      conflictCount: result.conflicts.length,
      conflicts: result.conflicts,
      merged: result.merged,
    },
    null,
    2
  );
}
