import { CloneResult } from "./cloner";

function renderEntry(entry: { key: string; included: boolean; reason?: string }): string {
  const status = entry.included ? "✔" : "✘";
  const suffix = entry.reason ? ` (${entry.reason})` : "";
  return `  ${status} ${entry.key}${suffix}`;
}

export function formatCloneText(result: CloneResult): string {
  const lines: string[] = [];
  lines.push(`Clone: ${result.source} → ${result.destination}`);
  lines.push(
    result.written
      ? `Status: written`
      : `Status: skipped (destination exists, overwrite not set)`
  );
  const included = result.entries.filter((e) => e.included);
  const excluded = result.entries.filter((e) => !e.included);
  lines.push(`Included: ${included.length}, Excluded: ${excluded.length}`);
  lines.push("");
  for (const entry of result.entries) {
    lines.push(renderEntry(entry));
  }
  return lines.join("\n");
}

export function formatCloneJson(result: CloneResult): string {
  return JSON.stringify(
    {
      source: result.source,
      destination: result.destination,
      written: result.written,
      summary: {
        included: result.entries.filter((e) => e.included).length,
        excluded: result.entries.filter((e) => !e.included).length,
      },
      entries: result.entries,
    },
    null,
    2
  );
}
