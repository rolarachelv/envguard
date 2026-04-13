import { TransformResult } from './transformer';

export function renderChange(change: TransformResult): string {
  return `  ${change.key}: "${change.original}" → "${change.transformed}" [${change.operation}]`;
}

export function formatTransformText(
  changes: TransformResult[],
  total: number
): string {
  const lines: string[] = [];
  lines.push(`Transform Summary: ${changes.length} of ${total} keys changed`);
  lines.push('');

  if (changes.length === 0) {
    lines.push('  No changes applied.');
  } else {
    lines.push('Changes:');
    for (const change of changes) {
      lines.push(renderChange(change));
    }
  }

  return lines.join('\n');
}

export function formatTransformJson(
  changes: TransformResult[],
  total: number
): string {
  return JSON.stringify(
    {
      summary: { changed: changes.length, total },
      changes: changes.map((c) => ({
        key: c.key,
        original: c.original,
        transformed: c.transformed,
        operation: c.operation,
      })),
    },
    null,
    2
  );
}
