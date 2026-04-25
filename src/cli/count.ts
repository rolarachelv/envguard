import { Command } from 'commander';
import { loadEnvFile } from '../env/loader';
import { countEnv } from '../count/counter';
import { formatCountText, formatCountJson } from '../count/formatCount';

export function registerCountCommand(program: Command): void {
  program
    .command('count')
    .description('Count environment variables by prefix')
    .argument('<envFile>', 'Path to the .env file')
    .option('--json', 'Output as JSON')
    .option('--prefix <prefix>', 'Only show count for a specific prefix')
    .action((envFile: string, options: { json?: boolean; prefix?: string }) => {
      const env = loadEnvFile(envFile);
      let result = countEnv(env);

      if (options.prefix) {
        const key = options.prefix.toUpperCase();
        const filtered = result.byPrefix[key] ?? 0;
        result = {
          total: filtered,
          byPrefix: { [key]: filtered },
        };
      }

      if (options.json) {
        console.log(formatCountJson(result));
      } else {
        console.log(formatCountText(result));
      }
    });
}
