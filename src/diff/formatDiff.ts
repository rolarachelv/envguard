import { EnvDiffResult, DiffEntry } from './differ';

const STATUS_SYMBOL: Record<string, string> = {
  added: '+',
  removed: '-',
  changed: '~',
  unchanged: ' ',
};

function maskValue(value: string | undefined): string {
  if (value === undefined) return '(missing)';
  if (value.length === 0) return '(empty)';
  return value.length > 4 ? `${value.slice(0, 2)}***` : '***';
}

export function formatDiffText(result: EnvDiffResult): string {
  const lines: string[] = [
    'Env Diff Summary',
    '================',
    `Added:     ${result.addedCount}`,
    `Removed:   ${result.removedCount}`,
    `Changed:   ${result.changedCount}`,
    `Unchanged: ${result.unchangedCount}`,
    '',
    'Changes:',
  ];

  for (const entry of result.entries) {
    if (entry.status === 'unchanged') continue;
    const symbol = STATUS_SYMBOL[entry.status];
    const requiredTag = entry.required ? ' [required]' : '';
    if (entry.status === 'changed') {
      lines.push(
        `${symbol} ${entry.key}${requiredTag}: ${maskValue(entry.baseValue)} -> ${maskValue(entry.compareValue)}`
      );
    } else if (entry.status === 'added') {
      lines.push(`${symbol} ${entry.key}${requiredTag}: ${maskValue(entry.compareValue)}`);
    } else {
      lines.push(`${symbol} ${entry.key}${requiredTag}: ${maskValue(entry.baseValue)}`);
    }
  }

  return lines.join('\n');
}

export function formatDiffJson(result: EnvDiffResult): string {
  const output = {
    summary: {
      added: result.addedCount,
      removed: result.removedCount,
      changed: result.changedCount,
      unchanged: result.unchangedCount,
    },
    changes: result.entries
      .filter((e: DiffEntry) => e.status !== 'unchanged')
      .map((e: DiffEntry) => ({
        key: e.key,
        status: e.status,
        required: e.required ?? false,
        baseValue: maskValue(e.baseValue),
        compareValue: maskValue(e.compareValue),
      })),
  };
  return JSON.stringify(output, null, 2);
}
