import type { Argv } from 'yargs';
import { loadEnvFile } from '../env/loader';
import { castEnv, type CastRule, type CastType } from '../cast/caster';
import { formatCastText, formatCastJson } from '../cast/formatCast';

export function registerCastCommand(yargs: Argv): Argv {
  return yargs.command(
    'cast <env>',
    'Cast env variable values to specified types',
    (y) =>
      y
        .positional('env', { type: 'string', demandOption: true, describe: '.env file path' })
        .option('rule', {
          alias: 'r',
          type: 'array',
          string: true,
          describe: 'Cast rules in KEY:TYPE format (e.g. PORT:number)',
          default: [],
        })
        .option('format', {
          type: 'string',
          choices: ['text', 'json'] as const,
          default: 'text',
          describe: 'Output format',
        }),
    async (argv) => {
      const envPath = argv.env as string;
      const rawRules = (argv.rule as string[]) ?? [];
      const format = argv.format as 'text' | 'json';

      const env = loadEnvFile(envPath);

      const rules: CastRule[] = rawRules.map((r) => {
        const [key, type] = r.split(':');
        if (!key || !type) {
          console.error(`Invalid rule format: "${r}". Expected KEY:TYPE`);
          process.exit(1);
        }
        return { key, type: type as CastType };
      });

      const results = castEnv(env, rules);
      const output = format === 'json' ? formatCastJson(results) : formatCastText(results);
      console.log(output);

      const hasFailed = results.some((r) => !r.success);
      if (hasFailed) process.exit(1);
    }
  );
}
