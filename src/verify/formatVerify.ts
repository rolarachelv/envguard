import { VerifyReport, VerifyResult } from './verifier';

function renderResult(r: VerifyResult): string {
  const status = r.match ? '✔' : '✘';
  const actual = r.actual !== undefined ? r.actual : '(missing)';
  if (r.match) {
    return `  ${status} ${r.key}`;
  }
  return `  ${status} ${r.key}: expected "${r.expected}", got "${actual}"`;
}

export function formatVerifyText(report: VerifyReport): string {
  const lines: string[] = [];
  lines.push(`Verify: ${report.file}`);
  lines.push('');
  for (const r of report.results) {
    lines.push(renderResult(r));
  }
  lines.push('');
  lines.push(`Passed: ${report.passed}  Failed: ${report.failed}`);
  return lines.join('\n');
}

export function formatVerifyJson(report: VerifyReport): string {
  return JSON.stringify(report, null, 2);
}
