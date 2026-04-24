import type { WatchEvent } from './watcher';

export function formatWatchText(event: WatchEvent): string {
  const ts = event.timestamp.toISOString();
  const lines: string[] = [];

  lines.push(`[${ts}] Watch event: ${event.type.toUpperCase()}`);
  lines.push(`File: ${event.filePath}`);

  if (event.type === 'error' && event.error) {
    lines.push(`Error: ${event.error}`);
  } else if (event.report) {
    lines.push('');
    lines.push(event.report);
  }

  return lines.join('\n');
}

export function formatWatchJson(event: WatchEvent): string {
  const payload: Record<string, unknown> = {
    type: event.type,
    timestamp: event.timestamp.toISOString(),
    filePath: event.filePath,
  };

  if (event.type === 'error') {
    payload.error = event.error ?? null;
  } else {
    payload.report = event.report ?? null;
  }

  return JSON.stringify(payload, null, 2);
}
