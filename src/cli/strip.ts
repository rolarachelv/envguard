import { Command } from 'commander';
import * as fs from 'fs';
import * as path from 'path';
import { stripEnv, serializeStrippedEnv } from '../strip/stripper';
import { formatStripText, formatStripJson } from '../strip/formatStrip';
import { loadEnvFile } from '../env/loader';

export function registerStripCommand(program: Command): void {
  program
    .command('strip <envFile>')
    .description('Strip comments and blank lines from a .env file')
    .option('-o, --output <file>', 'Write stripped output to a file')
    .option('--keep-comments', 'Preserve comment lines', false)
    .option('--keep-blanks', 'Preserve blank lines', false)
    .option('--format <fmt>', 'Output format: text or json', 'text')
    .option('--dry-run', 'Preview changes without writing', false)
    .action((envFile: string, options) => {
      const resolved = path.resolve(envFile);

      if (!fs.existsSync(resolved)) {
        console.error(`File not found: ${resolved}`);
        process.exit(1);
      }

      const raw = fs.readFileSync(resolved, 'utf-8');
      const env = loadEnvFile(resolved);

      const result = stripEnv(raw, {
        stripComments: !options.keepComments,
        stripBlanks: !options.keepBlanks,
      });

      const report =
        options.format === 'json'
          ? formatStripJson(result)
          : formatStripText(result);

      console.log(report);

      if (!options.dryRun) {
        const serialized = serializeStrippedEnv(result);
        const dest = options.output
          ? path.resolve(options.output)
          : resolved;
        fs.writeFileSync(dest, serialized, 'utf-8');
        console.log(`\nStripped env written to: ${dest}`);
      } else {
        console.log('\nDry run — no files written.');
      }
    });
}
