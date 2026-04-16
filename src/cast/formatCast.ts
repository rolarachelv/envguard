import type { CastResult } from './caster';

function renderResult(result: CastResult): string {
  const status = result.success ? '✔' : '✘';
  const castedDisplay = result.success
    ? JSON.stringify(result.castedValue)
    : result.error;
  return `  ${status} ${result.key}: "${result.originalValue}" → [${result.type}] ${castedDisplay}`;
}

export function formatCastText(results: CastResult[]): string {
  if (results.length === 0) return 'No cast rules applied.';
  const lines: string[] = ['Cast Results:'];
  const succeeded = results.filter((r) => r.success);
  const failed = results.filter((r) => !r.success);
  for (const r of results) {
    lines.push(renderResult(r));
  }
  lines.push('');
  lines.push(`Total: ${results.length} | Succeeded: ${succeeded.length} | Failed: ${failed.length}`);
  return lines.join('\n');
}

export function formatCastJson(results: CastResult[]): string {
  const succeeded = results.filter((r) => r.success).length;
  const failed = results.filter((r) => !r.success).length;
  return JSON.stringify(
    {
      summary: { total: results.length, succeeded, failed },
      results: results.map((r) => ({
        key: r.key,
        originalValue: r.originalValue,
        castedValue: r.castedValue,
        type: r.type,
        success: r.success,
        ...(r.error ? { error: r.error } : {}),
      })),
    },
    null,
    2
  );
}
