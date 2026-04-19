export interface FlattenResult {
  key: string;
  originalKey: string;
  value: string;
}

export function flattenKey(key: string, prefix: string): string {
  return prefix ? `${prefix}_${key}` : key;
}

export function flattenEnv(
  env: Record<string, string>,
  prefix?: string,
  separator = "__"
): FlattenResult[] {
  const results: FlattenResult[] = [];

  for (const [key, value] of Object.entries(env)) {
    const parts = key.split(separator);
    const flatKey = prefix
      ? `${prefix}_${parts.join("_")}`
      : parts.join("_");

    results.push({
      key: flatKey.toUpperCase(),
      originalKey: key,
      value,
    });
  }

  return results;
}

export function serializeFlattenedEnv(results: FlattenResult[]): string {
  return results.map((r) => `${r.key}=${r.value}`).join("\n");
}
