import { Command } from 'commander';
import * as fs from 'fs';
import * as path from 'path';
import { loadEnvFile } from '../env/loader';
import { parseSchema } from '../schema/parser';
import { applyDefaults, serializeDefaultedEnv } from '../defaults/defaulter';
import { formatDefaultText, formatDefaultJson } from '../defaults/formatDefault';

export function registerDefaultsCommand(program: Command): void {
  program
    .command('defaults')
    .description('Apply schema default values to missing env variables')
    .requiredOption('-e, --env <path>', 'Path to .env file')
    .requiredOption('-s, --schema <path>', 'Path to schema file')
    .option('-o, --output <path>', 'Write result to file instead of stdout')
    .option('--all', 'Show all keys, not just applied defaults', false)
    .option('--format <fmt>', 'Output format: text or json', 'text')
    .option('--write', 'Write updated env back to the input file', false)
    .action((opts) => {
      const envPath = path.resolve(opts.env);
      const schemaPath = path.resolve(opts.schema);

      const env = loadEnvFile(envPath);
      const schema = parseSchema(fs.readFileSync(schemaPath, 'utf-8'));

      const { env: updatedEnv, results } = applyDefaults(env, schema);

      const report =
        opts.format === 'json'
          ? formatDefaultJson(results, opts.all)
          : formatDefaultText(results, opts.all);

      if (opts.output) {
        fs.writeFileSync(path.resolve(opts.output), report, 'utf-8');
      } else {
        console.log(report);
      }

      if (opts.write) {
        fs.writeFileSync(envPath, serializeDefaultedEnv(updatedEnv), 'utf-8');
        console.error(`Updated env written to ${envPath}`);
      }
    });
}
