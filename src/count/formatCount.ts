import { CountResult } from './counter';

function renderPrefixRows(byPrefix: Record<string, number>): string {
  return Object.entries(byPrefix)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([prefix, count]) => `  ${prefix.padEnd(20)} ${count}`)
    .join('\n');
}

export function formatCountText(result: CountResult): string {
  const lines: string[] = [];
  lines.push(`Total: ${result.total}`);
  if (Object.keys(result.byPrefix).length > 0) {
    lines.push('');
    lines.push('By Prefix:');
    lines.push(renderPrefixRows(result.byPrefix));
  }
  return lines.join('\n');
}

export function formatCountJson(result: CountResult): string {
  return JSON.stringify(result, null, 2);
}
