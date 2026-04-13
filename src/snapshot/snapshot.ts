import * as fs from 'fs';
import * as path from 'path';
import { parseEnvContent } from '../env/loader';

export interface EnvSnapshot {
  timestamp: string;
  source: string;
  variables: Record<string, string>;
}

export function createSnapshot(envFilePath: string): EnvSnapshot {
  const absolutePath = path.resolve(envFilePath);
  if (!fs.existsSync(absolutePath)) {
    throw new Error(`Env file not found: ${absolutePath}`);
  }
  const content = fs.readFileSync(absolutePath, 'utf-8');
  const variables = parseEnvContent(content);
  return {
    timestamp: new Date().toISOString(),
    source: absolutePath,
    variables,
  };
}

export function saveSnapshot(snapshot: EnvSnapshot, outputPath: string): void {
  const absolutePath = path.resolve(outputPath);
  const dir = path.dirname(absolutePath);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  fs.writeFileSync(absolutePath, JSON.stringify(snapshot, null, 2), 'utf-8');
}

export function loadSnapshot(snapshotPath: string): EnvSnapshot {
  const absolutePath = path.resolve(snapshotPath);
  if (!fs.existsSync(absolutePath)) {
    throw new Error(`Snapshot file not found: ${absolutePath}`);
  }
  const raw = fs.readFileSync(absolutePath, 'utf-8');
  const parsed = JSON.parse(raw);
  if (!parsed.timestamp || !parsed.source || !parsed.variables) {
    throw new Error(`Invalid snapshot format in: ${absolutePath}`);
  }
  return parsed as EnvSnapshot;
}
