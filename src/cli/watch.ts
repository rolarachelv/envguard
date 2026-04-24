import { Command } from 'commander';
import { watchEnv, WatchEvent } from '../watch/watcher';
import { formatWatchText, formatWatchJson } from '../watch/formatWatch';

export function registerWatchCommand(program: Command): void {
  program
    .command('watch')
    .description('Watch a .env file and validate it against a schema on every change')
    .requiredOption('-e, --env <path>', 'Path to the .env file')
    .requiredOption('-s, --schema <path>', 'Path to the schema JSON file')
    .option('-f, --format <type>', 'Output format: text or json', 'text')
    .option('-d, --debounce <ms>', 'Debounce delay in milliseconds', '300')
    .action((opts) => {
      const format = opts.format === 'json' ? 'json' : 'text';
      const debounceMs = parseInt(opts.debounce, 10);

      console.log(`Watching ${opts.env} against schema ${opts.schema}...`);
      console.log('Press Ctrl+C to stop.\n');

      const stop = watchEnv(
        {
          envPath: opts.env,
          schemaPath: opts.schema,
          format,
          debounceMs: isNaN(debounceMs) ? 300 : debounceMs,
        },
        (event: WatchEvent) => {
          const output =
            format === 'json'
              ? formatWatchJson(event)
              : formatWatchText(event);
          console.log(output);
          console.log();
        }
      );

      process.on('SIGINT', () => {
        stop();
        console.log('\nWatcher stopped.');
        process.exit(0);
      });
    });
}
