import { Command } from 'commander';
import { compareEnvFiles } from '../compare/comparer';
import { formatCompareText, formatCompareJson } from '../compare/formatCompare';

export function registerCompareCommand(program: Command): void {
  program
    .command('compare <fileA> <fileB>')
    .description('Compare two .env files and report differences')
    .option('--json', 'Output results as JSON')
    .option('--fail-on-mismatch', 'Exit with code 1 if any mismatches or missing keys are found')
    .action((fileA: string, fileB: string, options: { json?: boolean; failOnMismatch?: boolean }) => {
      try {
        const report = compareEnvFiles(fileA, fileB);

        if (options.json) {
          console.log(formatCompareJson(report));
        } else {
          console.log(formatCompareText(report));
        }

        if (
          options.failOnMismatch &&
          (report.mismatchCount > 0 || report.missingInACount > 0 || report.missingInBCount > 0)
        ) {
          process.exit(1);
        }
      } catch (err) {
        const message = err instanceof Error ? err.message : String(err);
        console.error(`Error: ${message}`);
        process.exit(1);
      }
    });
}
