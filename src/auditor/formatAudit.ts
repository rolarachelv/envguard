import { AuditReport, AuditEntry } from './auditor';

const STATUS_ICONS: Record<AuditEntry['status'], string> = {
  ok: '✔',
  missing: '✘',
  extra: '⚠',
  invalid: '✘',
};

const STATUS_LABELS: Record<AuditEntry['status'], string> = {
  ok: 'OK',
  missing: 'MISSING',
  extra: 'EXTRA',
  invalid: 'INVALID',
};

export function formatAuditText(report: AuditReport): string {
  const lines: string[] = [
    `EnvGuard Audit Report`,
    `Timestamp : ${report.timestamp}`,
    `Env File  : ${report.envFile}`,
    `Schema    : ${report.schemaFile}`,
    '',
    'Variables:',
  ];

  for (const entry of report.entries) {
    const icon = STATUS_ICONS[entry.status];
    const label = STATUS_LABELS[entry.status].padEnd(7);
    lines.push(`  ${icon} [${label}] ${entry.key} — ${entry.message}`);
  }

  lines.push('');
  lines.push('Summary:');
  lines.push(`  Total   : ${report.summary.total}`);
  lines.push(`  OK      : ${report.summary.ok}`);
  lines.push(`  Missing : ${report.summary.missing}`);
  lines.push(`  Invalid : ${report.summary.invalid}`);
  lines.push(`  Extra   : ${report.summary.extra}`);

  return lines.join('\n');
}

export function formatAuditJson(report: AuditReport): string {
  return JSON.stringify(report, null, 2);
}
