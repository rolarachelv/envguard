import { FilterResult } from "./filterer";

function renderEntry(key: string, value: string): string {
  return `  ${key}=${value}`;
}

export function formatFilterText(result: FilterResult): string {
  const lines: string[] = [];

  lines.push(`Filter Summary`);
  lines.push(`  Total keys:    ${Object.keys(result.original).length}`);
  lines.push(`  Included keys: ${result.included.length}`);
  lines.push(`  Excluded keys: ${result.excluded.length}`);
  lines.push("");

  if (result.included.length > 0) {
    lines.push("Included:");
    for (const key of result.included) {
      lines.push(renderEntry(key, result.filtered[key]));
    }
  } else {
    lines.push("Included: (none)");
  }

  lines.push("");

  if (result.excluded.length > 0) {
    lines.push("Excluded:");
    for (const key of result.excluded) {
      lines.push(`  ${key}`);
    }
  } else {
    lines.push("Excluded: (none)");
  }

  return lines.join("\n");
}

export function formatFilterJson(result: FilterResult): string {
  return JSON.stringify(
    {
      summary: {
        total: Object.keys(result.original).length,
        included: result.included.length,
        excluded: result.excluded.length,
      },
      included: result.filtered,
      excludedKeys: result.excluded,
    },
    null,
    2
  );
}
