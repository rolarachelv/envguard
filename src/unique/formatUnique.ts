export interface UniqueResult {
  key: string;
  value: string;
  duplicateOf?: string;
  kept: boolean;
}

export function renderEntry(entry: UniqueResult): string {
  if (!entry.kept) {
    return `  - ${entry.key}=${entry.value} (duplicate of ${entry.duplicateOf}, removed)`;
  }
  return `  + ${entry.key}=${entry.value} (kept)`;
}

export function formatUniqueText(
  entries: UniqueResult[],
  removedCount: number
): string {
  const lines: string[] = [];
  lines.push(`Unique filter results: ${removedCount} duplicate(s) removed`);
  lines.push("");

  const kept = entries.filter((e) => e.kept);
  const removed = entries.filter((e) => !e.kept);

  if (kept.length > 0) {
    lines.push("Kept:");
    kept.forEach((e) => lines.push(renderEntry(e)));
  }

  if (removed.length > 0) {
    lines.push("");
    lines.push("Removed:");
    removed.forEach((e) => lines.push(renderEntry(e)));
  }

  return lines.join("\n");
}

export function formatUniqueJson(
  entries: UniqueResult[],
  removedCount: number
): string {
  return JSON.stringify(
    {
      removedCount,
      entries,
    },
    null,
    2
  );
}
