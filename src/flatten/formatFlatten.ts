import type { FlattenResult } from "./flattener";

function renderEntry(r: FlattenResult): string {
  const renamed = r.key !== r.originalKey ? ` (was: ${r.originalKey})` : "";
  return `  ${r.key}=${r.value}${renamed}`;
}

export function formatFlattenText(results: FlattenResult[]): string {
  if (results.length === 0) return "No entries to flatten.\n";
  const lines = ["Flattened env entries:", ""];
  for (const r of results) {
    lines.push(renderEntry(r));
  }
  const renamed = results.filter((r) => r.key !== r.originalKey).length;
  lines.push("");
  lines.push(`Total: ${results.length} entries, ${renamed} renamed.`);
  return lines.join("\n") + "\n";
}

export function formatFlattenJson(results: FlattenResult[]): string {
  return JSON.stringify(
    results.map((r) => ({
      key: r.key,
      originalKey: r.originalKey,
      value: r.value,
      renamed: r.key !== r.originalKey,
    })),
    null,
    2
  );
}
