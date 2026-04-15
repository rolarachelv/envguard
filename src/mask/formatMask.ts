import type { MaskResult, MaskedEntry } from './masker';

function renderEntry(entry: MaskedEntry): string {
  const tag = entry.wasMasked ? '[masked]' : '[plain]';
  return `  ${tag} ${entry.key}=${entry.masked}`;
}

export function formatMaskText(result: MaskResult): string {
  const lines: string[] = ['Mask Result:', ''];

  for (const entry of result.entries) {
    lines.push(renderEntry(entry));
  }

  lines.push('');
  lines.push(`Total masked: ${result.totalMasked}`);

  return lines.join('\n');
}

export function formatMaskJson(result: MaskResult): string {
  return JSON.stringify(
    {
      totalMasked: result.totalMasked,
      entries: result.entries.map(({ key, masked, wasMasked }) => ({
        key,
        value: masked,
        masked: wasMasked,
      })),
    },
    null,
    2
  );
}
