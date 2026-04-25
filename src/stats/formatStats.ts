import { EnvStats } from './stats';

export function formatStatsText(stats: EnvStats): string {
  const lines: string[] = [];
  lines.push('=== Env Stats ===');
  lines.push(`Total keys      : ${stats.total}`);
  lines.push(`Non-empty       : ${stats.nonEmpty}`);
  lines.push(`Empty           : ${stats.empty}`);
  lines.push(`Unique prefixes : ${stats.uniquePrefixes}`);
  lines.push(`Longest key     : ${stats.longestKey || '(n/a)'}`);
  lines.push(`Shortest key    : ${stats.shortestKey || '(n/a)'}`);
  lines.push(`Avg value length: ${stats.averageValueLength}`);

  if (Object.keys(stats.prefixBreakdown).length > 0) {
    lines.push('');
    lines.push('Prefix breakdown:');
    for (const [prefix, count] of Object.entries(stats.prefixBreakdown).sort(
      (a, b) => b[1] - a[1]
    )) {
      lines.push(`  ${prefix.padEnd(20)} ${count}`);
    }
  }

  return lines.join('\n');
}

export function formatStatsJson(stats: EnvStats): string {
  return JSON.stringify(stats, null, 2);
}
