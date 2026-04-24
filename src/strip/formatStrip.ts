import type { StripResult } from "./stripper";

function renderSummary(result: StripResult): string {
  const lines: string[] = [];
  lines.push(`Original lines : ${result.original.length}`);
  lines.push(`Remaining lines: ${result.stripped.length}`);
  lines.push(`Comments removed: ${result.removedComments}`);
  lines.push(`Blanks removed  : ${result.removedBlanks}`);
  return lines.join("\n");
}

export function formatStripText(result: StripResult): string {
  const parts: string[] = [];
  parts.push("=== Strip Result ===");
  parts.push(renderSummary(result));

  if (result.stripped.length > 0) {
    parts.push("\n--- Remaining Content ---");
    parts.push(result.stripped.join("\n"));
  } else {
    parts.push("\n(no lines remaining)");
  }

  return parts.join("\n");
}

export function formatStripJson(result: StripResult): string {
  return JSON.stringify(
    {
      summary: {
        originalLines: result.original.length,
        remainingLines: result.stripped.length,
        removedComments: result.removedComments,
        removedBlanks: result.removedBlanks,
      },
      stripped: result.stripped,
    },
    null,
    2
  );
}
