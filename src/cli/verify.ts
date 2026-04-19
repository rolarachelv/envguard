import { Command } from 'commander';
import { verifyEnv } from '../verify/verifier';
import { formatVerifyText, formatVerifyJson } from '../verify/formatVerify';

export function registerVerifyCommand(program: Command): void {
  program
    .command('verify <envFile>')
    .description('Verify that specific env keys match expected values')
    .option('--expect <pairs...>', 'KEY=VALUE pairs to verify')
    .option('--format <fmt>', 'Output format: text or json', 'text')
    .action((envFile: string, opts: { expect?: string[]; format: string }) => {
      const expected: Record<string, string> = {};

      for (const pair of opts.expect ?? []) {
        const idx = pair.indexOf('=');
        if (idx === -1) {
          console.error(`Invalid pair (expected KEY=VALUE): ${pair}`);
          process.exit(1);
        }
        const key = pair.slice(0, idx);
        const val = pair.slice(idx + 1);
        expected[key] = val;
      }

      const report = verifyEnv(envFile, expected);

      if (opts.format === 'json') {
        console.log(formatVerifyJson(report));
      } else {
        console.log(formatVerifyText(report));
      }

      if (report.failed > 0) {
        process.exit(1);
      }
    });
}
