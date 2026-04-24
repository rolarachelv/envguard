import { Command } from 'commander';
import * as fs from 'fs';
import { loadEnvFile } from '../env/loader';
import { exportEnv, ExportFormat } from '../export/exporter';
import { formatExportText, formatExportJson } from '../export/formatExport';

export function registerExportCommand(program: Command): void {
  program
    .command('export <envFile>')
    .description('Export env variables in a specified format (dotenv, json, yaml, shell)')
    .option('-f, --format <format>', 'Output format: dotenv | json | yaml | shell', 'dotenv')
    .option('-k, --keys <keys>', 'Comma-separated list of keys to export')
    .option('-p, --prefix <prefix>', 'Prefix to prepend to all exported keys')
    .option('-o, --output <file>', 'Write output to file instead of stdout')
    .option('--json', 'Print report as JSON')
    .action((envFile: string, opts) => {
      const validFormats: ExportFormat[] = ['dotenv', 'json', 'yaml', 'shell'];
      const format: ExportFormat = validFormats.includes(opts.format)
        ? opts.format
        : 'dotenv';

      const env = loadEnvFile(envFile);
      const keys = opts.keys
        ? (opts.keys as string).split(',').map((k: string) => k.trim())
        : undefined;

      const result = exportEnv(env, { format, keys, prefix: opts.prefix });

      if (opts.output) {
        fs.writeFileSync(opts.output, result.output, 'utf-8');
        console.log(`Exported ${result.entries.length} variable(s) to ${opts.output}`);
        return;
      }

      const report = opts.json
        ? formatExportJson(result)
        : formatExportText(result);

      console.log(report);
    });
}
