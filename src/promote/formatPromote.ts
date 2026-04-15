import type { PromoteResult } from './promoter';

function maskValue(value: string | undefined): string {
  if (value === undefined) return '(unset)';
  if (value.length <= 4) return '****';
  return value.slice(0, 2) + '*'.repeat(value.length - 4) + value.slice(-2);
}

export function formatPromoteText(result: PromoteResult, mask = false): string {
  const lines: string[] = [];

  if (result.promoted.length > 0) {
    lines.push(`Promoted (${result.promoted.length}):`);
    for (const { key, fromValue, toValue } of result.promoted) {
      const from = mask ? maskValue(fromValue) : fromValue;
      const to = mask ? maskValue(toValue) : (toValue ?? '(unset)');
      lines.push(`  ${key}: ${to} → ${from}`);
    }
  }

  if (result.skipped.length > 0) {
    lines.push(`\nSkipped (${result.skipped.length}):`);
    for (const { key, reason } of result.skipped) {
      lines.push(`  ${key}: ${reason}`);
    }
  }

  if (result.promoted.length === 0 && result.skipped.length === 0) {
    lines.push('No keys to promote.');
  }

  return lines.join('\n');
}

export function formatPromoteJson(result: PromoteResult, mask = false): string {
  const output = {
    promoted: result.promoted.map(({ key, fromValue, toValue }) => ({
      key,
      fromValue: mask ? maskValue(fromValue) : fromValue,
      toValue: mask ? maskValue(toValue) : (toValue ?? null),
    })),
    skipped: result.skipped,
    totalPromoted: result.promoted.length,
    totalSkipped: result.skipped.length,
  };
  return JSON.stringify(output, null, 2);
}
