import * as path from 'path';
import { loadEnvFile } from '../env/loader';
import { parseSchema } from '../schema/parser';
import { validateEnvAgainstSchema } from '../validator/validator';
import { generateReport, ReportFormat } from '../reporter/reporter';

export interface RunOptions {
  envPath?: string;
  schemaPath?: string;
  format?: ReportFormat;
  verbose?: boolean;
}

export interface RunResult {
  exitCode: number;
  output: string;
}

export async function run(options: RunOptions = {}): Promise<RunResult> {
  const envPath = options.envPath ?? path.resolve(process.cwd(), '.env');
  const schemaPath = options.schemaPath ?? path.resolve(process.cwd(), '.env.schema');
  const format = options.format ?? 'text';
  const verbose = options.verbose ?? false;

  let envVars: Record<string, string>;
  let schema: ReturnType<typeof parseSchema>;

  try {
    envVars = loadEnvFile(envPath);
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    return { exitCode: 1, output: `Error loading .env file: ${message}` };
  }

  try {
    schema = parseSchema(schemaPath);
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    return { exitCode: 1, output: `Error loading schema file: ${message}` };
  }

  const result = validateEnvAgainstSchema(envVars, schema);
  const output = generateReport(result, { format, verbose });

  return { exitCode: result.valid ? 0 : 1, output };
}
