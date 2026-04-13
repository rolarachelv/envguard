import { Command } from 'commander';
import * as fs from 'fs';
import * as path from 'path';
import { loadEnvFile } from '../env/loader';
import { transformEnv, TransformRule } from '../transform/transformer';
import { formatTransformText, formatTransformJson } from '../transform/formatTransform';

export function registerTransformCommand(program: Command): void {
  program
    .command('transform')
    .description('Apply transformation rules to an .env file')
    .requiredOption('-e, --env <path>', 'Path to the .env file')
    .requiredOption('-r, --rules <path>', 'Path to JSON rules file')
    .option('-o, --output <path>', 'Write transformed .env to this path')
    .option('--format <fmt>', 'Output format: text or json', 'text')
    .action((opts) => {
      const envPath = path.resolve(opts.env);
      const rulesPath = path.resolve(opts.rules);

      const env = loadEnvFile(envPath);
      const rawRules = JSON.parse(fs.readFileSync(rulesPath, 'utf-8'));
      const rules: TransformRule[] = rawRules;

      const { result, changes } = transformEnv(env, rules);
      const total = Object.keys(env).length;

      const report =
        opts.format === 'json'
          ? formatTransformJson(changes, total)
          : formatTransformText(changes, total);

      console.log(report);

      if (opts.output) {
        const outPath = path.resolve(opts.output);
        const lines = Object.entries(result)
          .map(([k, v]) => `${k}=${v}`)
          .join('\n');
        fs.writeFileSync(outPath, lines + '\n', 'utf-8');
        console.log(`\nTransformed env written to ${outPath}`);
      }
    });
}
