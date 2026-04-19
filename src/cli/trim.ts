import type { Argv } from 'yargs';
import * as fs from 'fs';
import { loadEnvFile } from '../env/loader';
import { trimEnv, serializeTrimmedEnv } from '../trim/trimmer';
import { formatTrimText, formatTrimJson } from '../trim/formatTrim';

export function registerTrimCommand(yargs: Argv): Argv {
  return yargs.command(
    'trim',
    'Trim whitespace from env variable values',
    (y) =>
      y
        .option('file', {
          alias: 'f',
          type: 'string',
          demandOption: true,
          description: 'Path to the .env file',
        })
        .option('format', {
          type: 'string',
          choices: ['text', 'json'] as const,
          default: 'text',
          description: 'Output format',
        })
        .option('write', {
          alias: 'w',
          type: 'boolean',
          default: false,
          description: 'Write trimmed output back to file',
        }),
    (argv) => {
      const env = loadEnvFile(argv.file as string);
      const result = trimEnv(env);

      if (argv.write) {
        const serialized = serializeTrimmedEnv(result);
        fs.writeFileSync(argv.file as string, serialized, 'utf-8');
        console.log(`Trimmed env written to ${argv.file}`);
        return;
      }

      if (argv.format === 'json') {
        console.log(formatTrimJson(result));
      } else {
        console.log(formatTrimText(result));
      }
    }
  );
}
