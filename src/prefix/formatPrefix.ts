import { PrefixResult } from './prefixer';

function renderEntry(r: PrefixResult): string {
  if (r.changed) {
    return `  ${r.originalKey} -> ${r.key}=${r.value}`;
  }
  return `  ${r.key}=${r.value} (unchanged)`;
}

export function formatPrefixText(results: PrefixResult[], strip: boolean): string {
  const changed = results.filter(r => r.changed);
  const action = strip ? 'stripped' : 'added';
  const lines = [
    `Prefix ${action}: ${changed.length} key(s) modified`,
    ...results.map(renderEntry),
  ];
  return lines.join('\n');
}

export function formatPrefixJson(results: PrefixResult[], strip: boolean): string {
  const changed = results.filter(r => r.changed);
  return JSON.stringify(
    {
      action: strip ? 'strip' : 'add',
      modified: changed.length,
      results: results.map(r => ({
        originalKey: r.originalKey,
        key: r.key,
        value: r.value,
        changed: r.changed,
      })),
    },
    null,
    2
  );
}
