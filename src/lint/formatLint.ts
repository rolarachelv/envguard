import { LintResult, LintIssue } from './linter';

const SEVERITY_ICONS: Record<string, string> = {
  error: '✖',
  warning: '⚠',
  info: 'ℹ',
};

function renderIssue(issue: LintIssue): string {
  const icon = SEVERITY_ICONS[issue.severity] ?? '?';
  return `  ${icon} [${issue.severity.toUpperCase()}] ${issue.message}`;
}

export function formatLintText(result: LintResult): string {
  if (result.issues.length === 0) {
    return '✔ No lint issues found.\n';
  }

  const lines: string[] = ['Lint Results:', ''];

  const grouped: Record<string, LintIssue[]> = { error: [], warning: [], info: [] };
  for (const issue of result.issues) {
    grouped[issue.severity]?.push(issue);
  }

  for (const severity of ['error', 'warning', 'info'] as const) {
    if (grouped[severity].length > 0) {
      lines.push(`${severity.charAt(0).toUpperCase() + severity.slice(1)}s:`);
      grouped[severity].forEach((issue) => lines.push(renderIssue(issue)));
      lines.push('');
    }
  }

  lines.push(
    `Summary: ${result.errorCount} error(s), ${result.warningCount} warning(s), ${result.infoCount} info(s).`
  );

  return lines.join('\n');
}

export function formatLintJson(result: LintResult): string {
  return JSON.stringify(
    {
      summary: {
        errors: result.errorCount,
        warnings: result.warningCount,
        infos: result.infoCount,
      },
      issues: result.issues,
    },
    null,
    2
  );
}
