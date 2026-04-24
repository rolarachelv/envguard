import { Command } from 'commander';
import { loadEnvFile } from '../env/loader';
import { scopeEnv, listScopes } from '../scope/scoper';
import { formatScopeText, formatScopeJson } from '../scope/formatScope';

export function registerScopeCommand(program: Command): void {
  program
    .command('scope <envFile>')
    .description('Filter env variables by scope prefix (e.g. DB, REDIS)')
    .option('-s, --scope <prefix>', 'Scope prefix to filter by')
    .option('--list', 'List all available scopes in the file')
    .option('--strip-prefix', 'Remove the scope prefix from output keys')
    .option('--format <fmt>', 'Output format: text or json', 'text')
    .action(async (envFile: string, opts) => {
      try {
        const env = await loadEnvFile(envFile);

        if (opts.list) {
          const scopes = listScopes(env);
          const dummyResult = { scope: '', entries: {}, total: 0 };
          const output =
            opts.format === 'json'
              ? formatScopeJson(dummyResult, scopes)
              : formatScopeText(dummyResult, scopes);
          console.log(output);
          return;
        }

        if (!opts.scope) {
          console.error('Error: --scope <prefix> is required unless --list is used.');
          process.exit(1);
        }

        const result = scopeEnv(env, opts.scope, {
          stripPrefix: !!opts.stripPrefix,
        });

        const output =
          opts.format === 'json'
            ? formatScopeJson(result)
            : formatScopeText(result);

        console.log(output);
      } catch (err: any) {
        console.error(`Error: ${err.message}`);
        process.exit(1);
      }
    });
}
