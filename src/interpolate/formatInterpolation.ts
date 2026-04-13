import type { InterpolationSummary, InterpolationResult } from "./interpolator";

function renderResult(r: InterpolationResult): string {
  const lines: string[] = [];
  lines.push(`  ${r.key}`);
  if (r.original !== r.resolved) {
    lines.push(`    original : ${r.original}`);
    lines.push(`    resolved : ${r.resolved}`);
  } else {
    lines.push(`    value    : ${r.resolved}`);
  }
  if (r.missing.length > 0) {
    lines.push(`    missing  : ${r.missing.join(", ")}`);
  }
  return lines.join("\n");
}

export function formatInterpolationText(summary: InterpolationSummary): string {
  const lines: string[] = ["Interpolation Report", "===================="];

  if (summary.results.length === 0) {
    lines.push("No variables to interpolate.");
    return lines.join("\n");
  }

  const changed = summary.results.filter((r) => r.original !== r.resolved);
  const unchanged = summary.results.filter((r) => r.original === r.resolved);

  if (changed.length > 0) {
    lines.push("\nInterpolated:");
    changed.forEach((r) => lines.push(renderResult(r)));
  }

  if (summary.unresolvedKeys.length > 0) {
    lines.push("\nUnresolved references:");
    summary.unresolvedKeys.forEach((k) => lines.push(`  - ${k}`));
  }

  lines.push(`\nSummary: ${changed.length} interpolated, ${summary.unresolvedKeys.length} unresolved, ${unchanged.length} unchanged.`);
  return lines.join("\n");
}

export function formatInterpolationJson(summary: InterpolationSummary): string {
  return JSON.stringify(
    {
      interpolated: summary.results.filter((r) => r.original !== r.resolved),
      unchanged: summary.results.filter((r) => r.original === r.resolved),
      unresolvedKeys: summary.unresolvedKeys,
      stats: {
        total: summary.results.length,
        interpolated: summary.results.filter((r) => r.original !== r.resolved).length,
        unresolved: summary.unresolvedKeys.length,
      },
    },
    null,
    2
  );
}
