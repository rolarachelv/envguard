import * as fs from 'fs';
import * as path from 'path';
import { loadEnvFile } from '../env/loader';
import { parseSchema } from '../schema/parser';
import { validateEnvAgainstSchema } from '../validator/validator';
import { generateReport } from '../reporter/reporter';

export interface WatchOptions {
  envPath: string;
  schemaPath: string;
  format: 'text' | 'json';
  debounceMs?: number;
}

export interface WatchEvent {
  type: 'change' | 'error';
  timestamp: Date;
  filePath: string;
  report?: string;
  error?: string;
}

export function debounce<T extends (...args: unknown[]) => void>(
  fn: T,
  ms: number
): T {
  let timer: ReturnType<typeof setTimeout>;
  return ((...args: unknown[]) => {
    clearTimeout(timer);
    timer = setTimeout(() => fn(...args), ms);
  }) as T;
}

export function watchEnv(
  options: WatchOptions,
  onEvent: (event: WatchEvent) => void
): () => void {
  const { envPath, schemaPath, format, debounceMs = 300 } = options;

  const handleChange = debounce((filePath: string) => {
    try {
      const env = loadEnvFile(filePath);
      const schema = parseSchema(schemaPath);
      const result = validateEnvAgainstSchema(env, schema);
      const report = generateReport(result, format);
      onEvent({
        type: 'change',
        timestamp: new Date(),
        filePath,
        report,
      });
    } catch (err) {
      onEvent({
        type: 'error',
        timestamp: new Date(),
        filePath,
        error: err instanceof Error ? err.message : String(err),
      });
    }
  }, debounceMs);

  const watcher = fs.watch(path.resolve(envPath), () => {
    handleChange(envPath);
  });

  return () => watcher.close();
}
