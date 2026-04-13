import { ValidationResult, ValidationError, ValidationWarning } from '../validator/validator';

export type ReportFormat = 'text' | 'json';

export interface ReportOptions {
  format?: ReportFormat;
  verbose?: boolean;
}

function formatTextReport(result: ValidationResult, verbose: boolean): string {
  const lines: string[] = [];

  if (result.valid) {
    lines.push('✅ Validation passed.');
  } else {
    lines.push(`❌ Validation failed with ${result.errors.length} error(s).`);
  }

  if (result.errors.length > 0) {
    lines.push('\nErrors:');
    result.errors.forEach((err: ValidationError) => {
      lines.push(`  [${err.type.toUpperCase()}] ${err.message}`);
    });
  }

  if (verbose && result.warnings.length > 0) {
    lines.push('\nWarnings:');
    result.warnings.forEach((warn: ValidationWarning) => {
      lines.push(`  [WARN] ${warn.message}`);
    });
  }

  if (!verbose && result.warnings.length > 0) {
    lines.push(`\n⚠️  ${result.warnings.length} warning(s). Use --verbose to see details.`);
  }

  return lines.join('\n');
}

function formatJsonReport(result: ValidationResult): string {
  return JSON.stringify(result, null, 2);
}

export function generateReport(result: ValidationResult, options: ReportOptions = {}): string {
  const { format = 'text', verbose = false } = options;

  if (format === 'json') {
    return formatJsonReport(result);
  }

  return formatTextReport(result, verbose);
}
