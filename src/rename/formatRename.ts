import { RenameResult } from './renamer';

export function formatRenameText(result: RenameResult): string {
  const lines: string[] = [];

  if (result.renamed.length > 0) {
    lines.push('Renamed keys:');
    for (const entry of result.renamed) {
      lines.push(`  ${entry.from} → ${entry.to}`);
    }
  }

  if (result.notFound.length > 0) {
    lines.push('\nNot found:');
    for (const key of result.notFound) {
      lines.push(`  ${key}`);
    }
  }

  if (result.conflicts.length > 0) {
    lines.push('\nConflicts (target key already exists):');
    for (const key of result.conflicts) {
      lines.push(`  ${key}`);
    }
  }

  if (lines.length === 0) {
    return 'No rename operations performed.';
  }

  return lines.join('\n');
}

export function formatRenameJson(result: RenameResult): string {
  return JSON.stringify(
    {
      renamed: result.renamed,
      notFound: result.notFound,
      conflicts: result.conflicts,
    },
    null,
    2
  );
}
