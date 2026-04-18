import { Command } from 'commander';
import * as fs from 'fs';
import { loadEnvFile } from '../env/loader';
import { groupEnv } from '../group/grouper';
import { formatGroupText, formatGroupJson } from '../group/formatGroup';

export function registerGroupCommand(program: Command): void {
  program
    .command('group <envFile>')
    .description('Group environment variables by prefix')
    .option('--sep <separator>', 'Key separator for grouping', '_')
    .option('--format <format>', 'Output format: text or json', 'text')
    .option('--output <file>', 'Write output to file')
    .action((envFile: string, opts: { sep: string; format: string; output?: string }) => {
      const env = loadEnvFile(envFile);
      const groups = groupEnv(env, opts.sep);

      const result =
        opts.format === 'json' ? formatGroupJson(groups) : formatGroupText(groups);

      if (opts.output) {
        fs.writeFileSync(opts.output, result, 'utf-8');
        console.log(`Group output written to ${opts.output}`);
      } else {
        console.log(result);
      }
    });
}
