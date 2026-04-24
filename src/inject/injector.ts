import * as fs from "fs";
import * as path from "path";

export interface InjectionResult {
  key: string;
  injected: boolean;
  previousValue?: string;
  newValue: string;
}

export interface InjectOptions {
  overwrite?: boolean;
  createIfMissing?: boolean;
}

/**
 * Injects key-value pairs into an existing env file content string.
 */
export function injectIntoContent(
  content: string,
  vars: Record<string, string>,
  options: InjectOptions = {}
): { content: string; results: InjectionResult[] } {
  const { overwrite = false, createIfMissing = true } = options;
  const lines = content.split("\n");
  const results: InjectionResult[] = [];
  const injected = new Set<string>();

  const updatedLines = lines.map((line) => {
    const match = line.match(/^([A-Z_][A-Z0-9_]*)\s*=\s*(.*)$/);
    if (!match) return line;
    const [, key, currentVal] = match;
    if (key in vars) {
      injected.add(key);
      if (overwrite) {
        results.push({ key, injected: true, previousValue: currentVal, newValue: vars[key] });
        return `${key}=${vars[key]}`;
      } else {
        results.push({ key, injected: false, previousValue: currentVal, newValue: currentVal });
        return line;
      }
    }
    return line;
  });

  const extraLines: string[] = [];
  for (const [key, value] of Object.entries(vars)) {
    if (!injected.has(key)) {
      if (createIfMissing) {
        extraLines.push(`${key}=${value}`);
        results.push({ key, injected: true, newValue: value });
      } else {
        results.push({ key, injected: false, newValue: value });
      }
    }
  }

  const finalLines = [...updatedLines, ...extraLines];
  const finalContent = finalLines.filter((l, i) => l !== "" || i < updatedLines.length).join("\n");
  return { content: finalContent, results };
}

/**
 * Injects variables into a .env file on disk.
 */
export function injectEnvFile(
  filePath: string,
  vars: Record<string, string>,
  options: InjectOptions = {}
): InjectionResult[] {
  const resolved = path.resolve(filePath);
  const existing = fs.existsSync(resolved) ? fs.readFileSync(resolved, "utf-8") : "";
  const { content, results } = injectIntoContent(existing, vars, options);
  fs.writeFileSync(resolved, content, "utf-8");
  return results;
}
