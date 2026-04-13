/**
 * Formatters for redacted env output.
 */

export interface RedactedEntry {
  key: string;
  originalValue: string;
  redactedValue: string;
  wasRedacted: boolean;
}

export function buildRedactedEntries(
  original: Record<string, string>,
  redacted: Record<string, string>
): RedactedEntry[] {
  return Object.keys(original).map((key) => ({
    key,
    originalValue: original[key],
    redactedValue: redacted[key],
    wasRedacted: original[key] !== redacted[key],
  }));
}

export function formatRedactText(
  entries: RedactedEntry[],
  showAll = false
): string {
  const lines: string[] = ["Redaction Report", "================="];
  const relevant = showAll ? entries : entries.filter((e) => e.wasRedacted);

  if (relevant.length === 0) {
    lines.push("No values were redacted.");
    return lines.join("\n");
  }

  for (const entry of relevant) {
    const tag = entry.wasRedacted ? "[REDACTED]" : "[KEPT]";
    lines.push(`  ${tag} ${entry.key}=${entry.redactedValue}`);
  }

  const count = entries.filter((e) => e.wasRedacted).length;
  lines.push("");
  lines.push(`Total redacted: ${count}/${entries.length}`);
  return lines.join("\n");
}

export function formatRedactJson(
  entries: RedactedEntry[],
  showAll = false
): string {
  const relevant = showAll ? entries : entries.filter((e) => e.wasRedacted);
  return JSON.stringify(
    {
      redacted: relevant.map((e) => ({
        key: e.key,
        value: e.redactedValue,
        wasRedacted: e.wasRedacted,
      })),
      summary: {
        total: entries.length,
        redactedCount: entries.filter((e) => e.wasRedacted).length,
      },
    },
    null,
    2
  );
}
