import * as fs from 'fs';
import * as path from 'path';

export interface EnvMap {
  [key: string]: string;
}

export interface LoadResult {
  values: EnvMap;
  filePath: string;
  lineCount: number;
}

export class EnvLoadError extends Error {
  constructor(message: string, public readonly filePath: string) {
    super(message);
    this.name = 'EnvLoadError';
  }
}

/**
 * Parses a .env file content into a key-value map.
 * Skips blank lines and comment lines (starting with #).
 * Strips optional surrounding quotes from values.
 */
export function parseEnvContent(content: string): EnvMap {
  const result: EnvMap = {};

  const lines = content.split(/\r?\n/);
  for (const raw of lines) {
    const line = raw.trim();
    if (!line || line.startsWith('#')) continue;

    const eqIndex = line.indexOf('=');
    if (eqIndex === -1) continue;

    const key = line.slice(0, eqIndex).trim();
    let value = line.slice(eqIndex + 1).trim();

    // Strip surrounding single or double quotes
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }

    if (key) {
      result[key] = value;
    }
  }

  return result;
}

/**
 * Loads a .env file from the given path and returns its parsed contents.
 */
export function loadEnvFile(filePath: string): LoadResult {
  const resolved = path.resolve(filePath);

  if (!fs.existsSync(resolved)) {
    throw new EnvLoadError(`File not found: ${resolved}`, resolved);
  }

  let content: string;
  try {
    content = fs.readFileSync(resolved, 'utf-8');
  } catch (err) {
    throw new EnvLoadError(
      `Failed to read file: ${resolved} — ${(err as Error).message}`,
      resolved
    );
  }

  const values = parseEnvContent(content);
  const lineCount = content.split(/\r?\n/).length;

  return { values, filePath: resolved, lineCount };
}
