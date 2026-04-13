import { EnvSnapshot } from './snapshot';

export function formatSnapshotText(snapshot: EnvSnapshot): string {
  const lines: string[] = [];
  lines.push(`Snapshot`);
  lines.push(`  Source    : ${snapshot.source}`);
  lines.push(`  Timestamp : ${snapshot.timestamp}`);
  lines.push(`  Variables : ${Object.keys(snapshot.variables).length}`);
  lines.push('');
  const keys = Object.keys(snapshot.variables).sort();
  if (keys.length === 0) {
    lines.push('  (no variables)');
  } else {
    for (const key of keys) {
      const value = snapshot.variables[key];
      const masked = value.length > 0 ? '*'.repeat(Math.min(value.length, 8)) : '(empty)';
      lines.push(`  ${key}=${masked}`);
    }
  }
  return lines.join('\n');
}

export function formatSnapshotJson(snapshot: EnvSnapshot): string {
  const masked: Record<string, string> = {};
  for (const [key, value] of Object.entries(snapshot.variables)) {
    masked[key] = value.length > 0 ? '*'.repeat(Math.min(value.length, 8)) : '';
  }
  return JSON.stringify(
    {
      timestamp: snapshot.timestamp,
      source: snapshot.source,
      variableCount: Object.keys(snapshot.variables).length,
      variables: masked,
    },
    null,
    2
  );
}
