import { ExportResult } from './exporter';

function renderEntry(key: string, value: string): string {
  return `  ${key}=${value}`;
}

export function formatExportText(result: ExportResult): string {
  const lines: string[] = [];
  lines.push(`Export format: ${result.format}`);
  lines.push(`Exported ${result.entries.length} variable(s):`);
  lines.push('');
  for (const { key, value } of result.entries) {
    lines.push(renderEntry(key, value));
  }
  lines.push('');
  lines.push('--- Output ---');
  lines.push(result.output);
  return lines.join('\n');
}

export function formatExportJson(result: ExportResult): string {
  return JSON.stringify(
    {
      format: result.format,
      count: result.entries.length,
      entries: result.entries,
      output: result.output,
    },
    null,
    2
  );
}
