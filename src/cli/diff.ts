import { Command } from 'commander';
import { diffEnvFiles } from '../diff/differ';
import { formatDiffText, formatDiffJson } from '../diff/formatDiff';
import * as fs from 'fs';

export function registerDiffCommand(program: Command): void {
  program
    .command('diff <file1> <file2>')
    .description('Compare two .env files and show differences')
    .option('-f, --format <format>', 'Output format: text or json', 'text')
    .option('-m, --mask', 'Mask sensitive values in output', false)
    .option('-o, --output <path>', 'Write output to a file instead of stdout')
    .action((file1: string, file2: string, options: { format: string; mask: boolean; output?: string }) => {
      if (!fs.existsSync(file1)) {
        console.error(`Error: File not found: ${file1}`);
        process.exit(1);
      }
      if (!fs.existsSync(file2)) {
        console.error(`Error: File not found: ${file2}`);
        process.exit(1);
      }

      const diff = diffEnvFiles(file1, file2);

      let output: string;
      if (options.format === 'json') {
        output = formatDiffJson(diff, options.mask);
      } else {
        output = formatDiffText(diff, options.mask);
      }

      if (options.output) {
        fs.writeFileSync(options.output, output, 'utf-8');
        console.log(`Diff written to ${options.output}`);
      } else {
        console.log(output);
      }

      const hasChanges =
        diff.added.length > 0 ||
        diff.removed.length > 0 ||
        diff.changed.length > 0;

      process.exit(hasChanges ? 1 : 0);
    });
}
