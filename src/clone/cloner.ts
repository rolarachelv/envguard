import * as fs from "fs";
import * as path from "path";
import { loadEnvFile } from "../env/loader";

export interface CloneOptions {
  overwrite?: boolean;
  keys?: string[];
  exclude?: string[];
}

export interface CloneResult {
  source: string;
  destination: string;
  entries: Array<{ key: string; included: boolean; reason?: string }>;
  written: boolean;
}

export function cloneEnv(
  sourceEntries: Record<string, string>,
  options: CloneOptions = {}
): Record<string, string> {
  const { keys, exclude = [] } = options;
  const result: Record<string, string> = {};

  for (const [key, value] of Object.entries(sourceEntries)) {
    if (keys && keys.length > 0 && !keys.includes(key)) continue;
    if (exclude.includes(key)) continue;
    result[key] = value;
  }

  return result;
}

export function serializeClonedEnv(entries: Record<string, string>): string {
  return Object.entries(entries)
    .map(([k, v]) => `${k}=${v}`)
    .join("\n");
}

export async function cloneEnvFile(
  sourcePath: string,
  destPath: string,
  options: CloneOptions = {}
): Promise<CloneResult> {
  const sourceEntries = await loadEnvFile(sourcePath);
  const cloned = cloneEnv(sourceEntries, options);

  const destExists = fs.existsSync(destPath);
  const written = !destExists || options.overwrite === true;

  if (written) {
    fs.mkdirSync(path.dirname(destPath), { recursive: true });
    fs.writeFileSync(destPath, serializeClonedEnv(cloned), "utf-8");
  }

  const entries = Object.keys(sourceEntries).map((key) => ({
    key,
    included: key in cloned,
    reason: !(key in cloned)
      ? options.keys && !options.keys.includes(key)
        ? "not in key filter"
        : "excluded"
      : undefined,
  }));

  return { source: sourcePath, destination: destPath, entries, written };
}
