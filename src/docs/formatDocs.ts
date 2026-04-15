import { DocOutput, DocEntry } from './docgen';

function renderRow(entry: DocEntry): string {
  const required = entry.required ? '✔' : '✘';
  const def = entry.defaultValue ?? '—';
  const desc = entry.description ?? '—';
  const example = entry.example ?? '—';
  return `  ${entry.key.padEnd(28)} ${entry.type.padEnd(10)} ${required.padEnd(6)} ${def.padEnd(20)} ${desc.padEnd(30)} ${example}`;
}

export function formatDocsText(output: DocOutput): string {
  const header =
    `  ${'KEY'.padEnd(28)} ${'TYPE'.padEnd(10)} ${'REQ'.padEnd(6)} ${'DEFAULT'.padEnd(20)} ${'DESCRIPTION'.padEnd(30)} EXAMPLE`;
  const divider = '  ' + '-'.repeat(110);
  const rows = output.entries.map(renderRow);
  const lines = [
    '📄 Environment Variable Documentation',
    `Generated: ${output.generatedAt}`,
    '',
    header,
    divider,
    ...rows,
    '',
    `Total: ${output.entries.length} variable(s)`,
  ];
  return lines.join('\n');
}

export function formatDocsJson(output: DocOutput): string {
  return JSON.stringify(
    {
      generatedAt: output.generatedAt,
      variables: output.entries,
    },
    null,
    2
  );
}
