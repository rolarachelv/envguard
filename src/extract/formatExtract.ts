import { ExtractResult } from './extractor';

function renderEntry(key: string, value: string): string {
  return `  ${key}=${value}`;
}

export function formatExtractText(result: ExtractResult): string {
  const lines: string[] = [];

  lines.push(`Extracted: ${result.found.length} key(s)`);

  if (result.found.length > 0) {
    lines.push('\nFound:');
    for (const [key, value] of Object.entries(result.extracted)) {
      lines.push(renderEntry(key, value));
    }
  }

  if (result.missing.length > 0) {
    lines.push(`\nMissing (${result.missing.length}):`);
    for (const key of result.missing) {
      lines.push(`  - ${key}`);
    }
  }

  return lines.join('\n');
}

export function formatExtractJson(result: ExtractResult): string {
  return JSON.stringify(
    {
      extracted: result.extracted,
      found: result.found,
      missing: result.missing,
      summary: {
        foundCount: result.found.length,
        missingCount: result.missing.length,
      },
    },
    null,
    2
  );
}
