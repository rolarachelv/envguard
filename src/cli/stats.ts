import { Command } from 'commander';
import * as fs from 'fs';
import * as path from 'path';
import { parseEnvContent } from '../env/loader';
import { computeStats } from '../stats/stats';
import { formatStatsText, formatStatsJson } from '../stats/formatStats';

export function registerStatsCommand(program: Command): void {
  program
    .command('stats <envFile>')
    .description('Compute and display statistics about a .env file')
    .option('--format <format>', 'Output format: text or json', 'text')
    .option('--prefix-min <n>', 'Minimum count to show a prefix group', '1')
    .action((envFile: string, options: { format: string; prefixMin: string }) => {
      const resolved = path.resolve(process.cwd(), envFile);

      if (!fs.existsSync(resolved)) {
        console.error(`Error: File not found: ${resolved}`);
        process.exit(1);
      }

      const content = fs.readFileSync(resolved, 'utf-8');
      const entries = parseEnvContent(content);
      const stats = computeStats(entries);

      const prefixMin = parseInt(options.prefixMin, 10);
      if (!isNaN(prefixMin) && prefixMin > 1) {
        for (const key of Object.keys(stats.prefixGroups)) {
          if (stats.prefixGroups[key] < prefixMin) {
            delete stats.prefixGroups[key];
          }
        }
      }

      if (options.format === 'json') {
        console.log(formatStatsJson(stats));
      } else {
        console.log(formatStatsText(stats));
      }
    });
}
