import { Command } from 'commander';
import * as fs from 'fs';
import * as path from 'path';
import { parseSchema } from '../schema/parser';
import { loadEnvFile } from '../env/loader';
import { lintEnv } from '../lint/linter';
import { formatLintText, formatLintJson } from '../lint/formatLint';

export function registerLintCommand(program: Command): void {
  program
    .command('lint')
    .description('Lint a .env file for style and quality issues')
    .argument('<envFile>', 'Path to the .env file')
    .option('-s, --schema <schemaFile>', 'Path to schema JSON file', 'envguard.schema.json')
    .option('-f, --format <format>', 'Output format: text or json', 'text')
    .option('--fail-on-warn', 'Exit with non-zero code if warnings are found')
    .action((envFile: string, options: { schema: string; format: string; failOnWarn: boolean }) => {
      const schemaPath = path.resolve(options.schema);
      const envPath = path.resolve(envFile);

      if (!fs.existsSync(schemaPath)) {
        console.error(`Schema file not found: ${schemaPath}`);
        process.exit(1);
      }

      if (!fs.existsSync(envPath)) {
        console.error(`.env file not found: ${envPath}`);
        process.exit(1);
      }

      const schemaRaw = fs.readFileSync(schemaPath, 'utf-8');
      const schema = parseSchema(JSON.parse(schemaRaw));
      const env = loadEnvFile(envPath);
      const result = lintEnv(env, schema);

      const output =
        options.format === 'json' ? formatLintJson(result) : formatLintText(result);

      console.log(output);

      if (result.errorCount > 0) {
        process.exit(1);
      }

      if (options.failOnWarn && result.warningCount > 0) {
        process.exit(1);
      }
    });
}
