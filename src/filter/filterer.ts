import { EnvMap } from "../env/loader";

export type FilterMode = "include" | "exclude";

export interface FilterOptions {
  keys?: string[];
  pattern?: string;
  mode: FilterMode;
}

export interface FilterResult {
  original: EnvMap;
  filtered: EnvMap;
  included: string[];
  excluded: string[];
}

export function matchesPattern(key: string, pattern: string): boolean {
  const regex = new RegExp(pattern);
  return regex.test(key);
}

export function filterEnv(env: EnvMap, options: FilterOptions): FilterResult {
  const { keys = [], pattern, mode } = options;

  const included: string[] = [];
  const excluded: string[] = [];
  const filtered: EnvMap = {};

  for (const [key, value] of Object.entries(env)) {
    const matchesKey = keys.length > 0 && keys.includes(key);
    const matchesPat = pattern ? matchesPattern(key, pattern) : false;
    const isMatch = matchesKey || matchesPat;

    const keep = mode === "include" ? isMatch : !isMatch;

    if (keep) {
      filtered[key] = value;
      included.push(key);
    } else {
      excluded.push(key);
    }
  }

  return {
    original: env,
    filtered,
    included,
    excluded,
  };
}
