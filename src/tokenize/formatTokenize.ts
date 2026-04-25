import { TokenizedEntry } from "./tokenizer";

export function renderToken(entry: TokenizedEntry): string {
  const typeLabel = entry.type.padEnd(8);
  return `  ${entry.key.padEnd(30)} [${typeLabel}] ${entry.value}`;
}

export function formatTokenizeText(entries: TokenizedEntry[]): string {
  if (entries.length === 0) {
    return "No entries to tokenize.\n";
  }

  const lines: string[] = [
    `Tokenized ${entries.length} entr${entries.length === 1 ? "y" : "ies"}:`,
    "",
    `  ${ "KEY".padEnd(30) } [TYPE    ] VALUE`,
    `  ${ "-".repeat(29) } ${ "-".repeat(10) } ${ "-".repeat(20) }`,
  ];

  for (const entry of entries) {
    lines.push(renderToken(entry));
  }

  lines.push("");

  const typeCounts: Record<string, number> = {};
  for (const entry of entries) {
    typeCounts[entry.type] = (typeCounts[entry.type] ?? 0) + 1;
  }

  lines.push("Summary by type:");
  for (const [type, count] of Object.entries(typeCounts).sort()) {
    lines.push(`  ${type.padEnd(10)} ${count}`);
  }

  lines.push("");
  return lines.join("\n");
}

export function formatTokenizeJson(entries: TokenizedEntry[]): string {
  const typeCounts: Record<string, number> = {};
  for (const entry of entries) {
    typeCounts[entry.type] = (typeCounts[entry.type] ?? 0) + 1;
  }

  return JSON.stringify(
    {
      total: entries.length,
      entries: entries.map((e) => ({
        key: e.key,
        value: e.value,
        type: e.type,
      })),
      summary: typeCounts,
    },
    null,
    2
  );
}
