import { EnvMap } from '../env/loader';

export type ExportFormat = 'dotenv' | 'json' | 'yaml' | 'shell';

export interface ExportOptions {
  format: ExportFormat;
  keys?: string[];
  prefix?: string;
}

export interface ExportResult {
  format: ExportFormat;
  entries: Array<{ key: string; value: string }>;
  output: string;
}

export function filterKeys(env: EnvMap, keys?: string[]): EnvMap {
  if (!keys || keys.length === 0) return env;
  return Object.fromEntries(
    Object.entries(env).filter(([k]) => keys.includes(k))
  );
}

export function serializeAsDotenv(env: EnvMap): string {
  return Object.entries(env)
    .map(([k, v]) => `${k}=${v.includes(' ') ? `"${v}"` : v}`)
    .join('\n');
}

export function serializeAsJson(env: EnvMap): string {
  return JSON.stringify(env, null, 2);
}

export function serializeAsYaml(env: EnvMap): string {
  return Object.entries(env)
    .map(([k, v]) => `${k}: "${v.replace(/"/g, '\\"')}"`)
    .join('\n');
}

export function serializeAsShell(env: EnvMap): string {
  return Object.entries(env)
    .map(([k, v]) => `export ${k}=${v.includes(' ') ? `"${v}"` : v}`)
    .join('\n');
}

export function exportEnv(env: EnvMap, options: ExportOptions): ExportResult {
  const filtered = filterKeys(env, options.keys);

  const prefixed: EnvMap = options.prefix
    ? Object.fromEntries(
        Object.entries(filtered).map(([k, v]) => [`${options.prefix}${k}`, v])
      )
    : filtered;

  const entries = Object.entries(prefixed).map(([key, value]) => ({ key, value }));

  let output: string;
  switch (options.format) {
    case 'json':  output = serializeAsJson(prefixed);  break;
    case 'yaml':  output = serializeAsYaml(prefixed);  break;
    case 'shell': output = serializeAsShell(prefixed); break;
    default:      output = serializeAsDotenv(prefixed); break;
  }

  return { format: options.format, entries, output };
}
