import { InjectionResult } from "./injector";

function renderResult(r: InjectionResult): string {
  if (!r.injected) {
    return `  SKIP  ${r.key} (kept: ${r.previousValue ?? "(new)"})` ;
  }
  if (r.previousValue !== undefined) {
    return `  UPDATE ${r.key}: ${r.previousValue} → ${r.newValue}`;
  }
  return `  ADD    ${r.key}=${r.newValue}`;
}

export function formatInjectText(results: InjectionResult[]): string {
  if (results.length === 0) return "No variables processed.\n";

  const added = results.filter((r) => r.injected && r.previousValue === undefined);
  const updated = results.filter((r) => r.injected && r.previousValue !== undefined);
  const skipped = results.filter((r) => !r.injected);

  const lines: string[] = ["Injection Results:"];

  if (added.length > 0) {
    lines.push(`\nAdded (${added.length}):`);
    added.forEach((r) => lines.push(renderResult(r)));
  }

  if (updated.length > 0) {
    lines.push(`\nUpdated (${updated.length}):`);
    updated.forEach((r) => lines.push(renderResult(r)));
  }

  if (skipped.length > 0) {
    lines.push(`\nSkipped (${skipped.length}):`);
    skipped.forEach((r) => lines.push(renderResult(r)));
  }

  lines.push(
    `\nSummary: ${added.length} added, ${updated.length} updated, ${skipped.length} skipped.`
  );

  return lines.join("\n") + "\n";
}

export function formatInjectJson(results: InjectionResult[]): string {
  const summary = {
    added: results.filter((r) => r.injected && r.previousValue === undefined).length,
    updated: results.filter((r) => r.injected && r.previousValue !== undefined).length,
    skipped: results.filter((r) => !r.injected).length,
  };
  return JSON.stringify({ results, summary }, null, 2);
}
