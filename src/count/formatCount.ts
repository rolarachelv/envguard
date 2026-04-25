import { CountResult } from "./counter";

function renderPrefixRows(byPrefix: Record<string, number>): string {
  return Object.entries(byPrefix)
    .map(([prefix, count]) => `  ${prefix}: ${count}`)
    .join("\n");
}

export function formatCountText(result: CountResult): string {
  const lines: string[] = [
    `Total keys   : ${result.total}`,
    `Non-empty    : ${result.nonEmpty}`,
    `Empty        : ${result.empty}`,
  ];

  if (Object.keys(result.byPrefix).length > 0) {
    lines.push("By prefix:");
    lines.push(renderPrefixRows(result.byPrefix));
  }

  return lines.join("\n");
}

export function formatCountJson(result: CountResult): string {
  return JSON.stringify(result, null, 2);
}
