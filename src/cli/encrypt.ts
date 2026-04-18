import { Command } from 'commander';
import * as fs from 'fs';
import * as path from 'path';
import { loadEnvFile } from '../env/loader';
import { encryptEnv } from '../encrypt/encryptor';
import { formatEncryptText, formatEncryptJson } from '../encrypt/formatEncrypt';

export function registerEncryptCommand(program: Command): void {
  program
    .command('encrypt <envFile>')
    .description('Encrypt values in a .env file using a secret')
    .requiredOption('-s, --secret <secret>', 'Secret key used for encryption')
    .option('-k, --keys <keys>', 'Comma-separated list of keys to encrypt (default: all)')
    .option('-o, --output <file>', 'Write encrypted env to file')
    .option('--format <format>', 'Output format: text or json', 'text')
    .action((envFile: string, opts) => {
      const resolved = path.resolve(envFile);
      const env = loadEnvFile(resolved);
      const keys = opts.keys ? opts.keys.split(',').map((k: string) => k.trim()) : undefined;
      const result = encryptEnv(env, opts.secret, { keys });

      const formatted =
        opts.format === 'json' ? formatEncryptJson(result) : formatEncryptText(result);

      if (opts.output) {
        const outLines = result.entries.map(e => `${e.key}=${e.encrypted}`).join('\n');
        fs.writeFileSync(path.resolve(opts.output), outLines + '\n', 'utf8');
        console.log(`Encrypted env written to ${opts.output}`);
      } else {
        console.log(formatted);
      }
    });
}
