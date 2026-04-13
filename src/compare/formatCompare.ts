import { EnvCompareReport, CompareResult } from './comparer';

const STATUS_SYMBOLS: Record<CompareResult['status'], string> = {
  match: '✔',
  mismatch: '≠',
  missing_in_a: '←',
  missing_in_b: '→',
};

const STATUS_LABELS: Record<CompareResult['status'], string> = {
  match: 'MATCH',
  mismatch: 'MISMATCH',
  missing_in_a: 'ONLY IN B',
  missing_in_b: 'ONLY IN A',
};

function maskValue(value: string | undefined): string {
  if (!value) return '(unset)';
  if (value.length <= 4) return '****';
  return value.slice(0, 2) + '*'.repeat(value.length - 4) + value.slice(-2);
}

export function formatCompareText(report: EnvCompareReport): string {
  const lines: string[] = [];
  lines.push(`Comparing: ${report.fileA}  vs  ${report.fileB}`);
  lines.push('─'.repeat(60));

  for (const result of report.results) {
    const sym = STATUS_SYMBOLS[result.status];
    const label = STATUS_LABELS[result.status];
    if (result.status === 'match') {
      lines.push(`  ${sym} [${label}]  ${result.key}`);
    } else if (result.status === 'mismatch') {
      lines.push(`  ${sym} [${label}]  ${result.key}`);
      lines.push(`       A: ${maskValue(result.valueA)}`);
      lines.push(`       B: ${maskValue(result.valueB)}`);
    } else if (result.status === 'missing_in_b') {
      lines.push(`  ${sym} [${label}]  ${result.key} = ${maskValue(result.valueA)}`);
    } else {
      lines.push(`  ${sym} [${label}]  ${result.key} = ${maskValue(result.valueB)}`);
    }
  }

  lines.push('─'.repeat(60));
  lines.push(
    `Total: ${report.totalKeys} keys | ` +
    `Match: ${report.matchCount} | ` +
    `Mismatch: ${report.mismatchCount} | ` +
    `Only in A: ${report.missingInBCount} | ` +
    `Only in B: ${report.missingInACount}`
  );
  return lines.join('\n');
}

export function formatCompareJson(report: EnvCompareReport): string {
  return JSON.stringify(report, null, 2);
}
