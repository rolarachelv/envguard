import { DefaultResult } from './defaulter';

function renderResult(r: DefaultResult): string {
  if (r.wasApplied) {
    return `  ${r.key}: (empty) -> "${r.appliedValue}" [default applied]`;
  }
  return `  ${r.key}: "${r.appliedValue}" [unchanged]`;
}

export function formatDefaultText(
  results: DefaultResult[],
  showAll = false
): string {
  const applied = results.filter((r) => r.wasApplied);
  const lines: string[] = [];

  lines.push(`Defaults applied: ${applied.length} of ${results.length} keys`);

  const toShow = showAll ? results : applied;
  if (toShow.length === 0) {
    lines.push('  (no changes)');
  } else {
    toShow.forEach((r) => lines.push(renderResult(r)));
  }

  return lines.join('\n');
}

export function formatDefaultJson(
  results: DefaultResult[],
  showAll = false
): string {
  const toShow = showAll ? results : results.filter((r) => r.wasApplied);
  return JSON.stringify(
    {
      summary: {
        total: results.length,
        applied: results.filter((r) => r.wasApplied).length,
      },
      results: toShow.map((r) => ({
        key: r.key,
        originalValue: r.originalValue ?? null,
        appliedValue: r.appliedValue,
        wasApplied: r.wasApplied,
      })),
    },
    null,
    2
  );
}
