import { Command } from 'commander';
import * as fs from 'fs';
import { loadEnvFile } from '../env/loader';
import { promoteEnv, serializePromotedEnv } from '../promote/promoter';
import { formatPromoteText, formatPromoteJson } from '../promote/formatPromote';

export function registerPromoteCommand(program: Command): void {
  program
    .command('promote <source> <target>')
    .description('Promote environment variables from a source .env file into a target .env file')
    .option('--overwrite', 'Overwrite existing keys in target', false)
    .option('--keys <keys>', 'Comma-separated list of keys to promote')
    .option('--write', 'Write the merged result back to the target file', false)
    .option('--mask', 'Mask sensitive values in output', false)
    .option('--format <format>', 'Output format: text or json', 'text')
    .action((source: string, target: string, opts) => {
      const sourceEnv = loadEnvFile(source);
      const targetEnv = loadEnvFile(target);

      const keys = opts.keys
        ? (opts.keys as string).split(',').map((k: string) => k.trim())
        : undefined;

      const result = promoteEnv(sourceEnv, targetEnv, {
        overwrite: opts.overwrite as boolean,
        keys,
      });

      if (opts.format === 'json') {
        console.log(formatPromoteJson(result, opts.mask as boolean));
      } else {
        console.log(formatPromoteText(result, opts.mask as boolean));
      }

      if (opts.write) {
        fs.writeFileSync(target, serializePromotedEnv(result.merged), 'utf-8');
        console.log(`\nWrote merged env to ${target}`);
      }
    });
}
