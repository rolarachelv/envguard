export interface CountResult {
  total: number;
  byPrefix: Record<string, number>;
  empty: number;
  nonEmpty: number;
}

export function countByPrefix(
  env: Record<string, string>,
  prefixes: string[]
): Record<string, number> {
  const result: Record<string, number> = {};

  for (const prefix of prefixes) {
    result[prefix] = 0;
  }
  result["(other)"] = 0;

  for (const key of Object.keys(env)) {
    const matched = prefixes.find((p) => key.startsWith(p));
    if (matched) {
      result[matched]++;
    } else {
      result["(other)"]++;
    }
  }

  return result;
}

export function countEnv(
  env: Record<string, string>,
  prefixes: string[] = []
): CountResult {
  const total = Object.keys(env).length;
  const empty = Object.values(env).filter((v) => v.trim() === "").length;
  const nonEmpty = total - empty;
  const byPrefix = prefixes.length > 0 ? countByPrefix(env, prefixes) : {};

  return { total, byPrefix, empty, nonEmpty };
}
