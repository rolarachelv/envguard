import { MigrationEntry, MigrationPlan } from './migrator';

const ACTION_LABELS: Record<MigrationEntry['action'], string> = {
  add: 'ADD',
  remove: 'REMOVE',
  rename: 'RENAME',
  update: 'UPDATE',
};

const ACTION_COLORS: Record<MigrationEntry['action'], string> = {
  add: '\x1b[32m',
  remove: '\x1b[31m',
  rename: '\x1b[34m',
  update: '\x1b[33m',
};

const RESET = '\x1b[0m';

export function formatMigrationText(plan: MigrationPlan, useColor = true): string {
  const lines: string[] = [];
  lines.push(`Migration Plan`);
  lines.push(`  Source : ${plan.source}`);
  lines.push(`  Target : ${plan.target}`);
  lines.push(`  Date   : ${plan.timestamp}`);
  lines.push(`  Changes: ${plan.entries.length}`);
  lines.push('');

  if (plan.entries.length === 0) {
    lines.push('  No changes detected.');
    return lines.join('\n');
  }

  for (const entry of plan.entries) {
    const color = useColor ? ACTION_COLORS[entry.action] : '';
    const reset = useColor ? RESET : '';
    const label = ACTION_LABELS[entry.action].padEnd(6);
    let detail = '';

    if (entry.action === 'add') {
      detail = `${entry.key}=${entry.newValue ?? ''}`;
    } else if (entry.action === 'remove') {
      detail = `${entry.key} (was: ${entry.oldValue ?? ''})`;
    } else if (entry.action === 'update') {
      detail = `${entry.key}: "${entry.oldValue}" → "${entry.newValue}"`;
    } else if (entry.action === 'rename') {
      detail = `→ ${entry.key} (value: ${entry.newValue ?? entry.oldValue ?? ''})`;
    }

    lines.push(`  ${color}[${label}]${reset} ${detail}`);
  }

  return lines.join('\n');
}

export function formatMigrationJson(plan: MigrationPlan): string {
  return JSON.stringify(
    {
      source: plan.source,
      target: plan.target,
      timestamp: plan.timestamp,
      totalChanges: plan.entries.length,
      entries: plan.entries,
    },
    null,
    2
  );
}
