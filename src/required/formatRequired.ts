/**
 * Formats the output of required-key checks in text and JSON formats.
 */

import { RequiredCheckResult } from "./requirer";

/**
 * Renders a single required-check result as a human-readable line.
 */
function renderResult(key: string, present: boolean): string {
  const status = present ? "✔" : "✘";
  const label = present ? "present" : "MISSING";
  return `  ${status} ${key}: ${label}`;
}

/**
 * Formats required-check results as a plain-text report.
 *
 * @param result - The result object returned by checkRequired
 * @returns A multi-line string suitable for console output
 */
export function formatRequiredText(result: RequiredCheckResult): string {
  const lines: string[] = [];

  lines.push(`Required keys check (${result.keys.length} key(s)):`);
  lines.push("");

  for (const key of result.keys) {
    const present = !result.missing.includes(key);
    lines.push(renderResult(key, present));
  }

  lines.push("");

  if (result.missing.length === 0) {
    lines.push("All required keys are present.");
  } else {
    lines.push(
      `${result.missing.length} missing key(s): ${result.missing.join(", ")}`
    );
  }

  return lines.join("\n");
}

/**
 * Formats required-check results as a JSON string.
 *
 * @param result - The result object returned by checkRequired
 * @returns A pretty-printed JSON string
 */
export function formatRequiredJson(result: RequiredCheckResult): string {
  const entries = result.keys.map((key) => ({
    key,
    present: !result.missing.includes(key),
  }));

  return JSON.stringify(
    {
      total: result.keys.length,
      missingCount: result.missing.length,
      allPresent: result.missing.length === 0,
      entries,
    },
    null,
    2
  );
}
