export interface PrefixOptions {
  prefix: string;
  strip?: boolean;
}

export interface PrefixResult {
  key: string;
  originalKey: string;
  value: string;
  changed: boolean;
}

export function prefixEnv(
  env: Record<string, string>,
  options: PrefixOptions
): PrefixResult[] {
  const { prefix, strip = false } = options;
  return Object.entries(env).map(([key, value]) => {
    if (strip) {
      if (key.startsWith(prefix)) {
        const newKey = key.slice(prefix.length);
        return { key: newKey, originalKey: key, value, changed: true };
      }
      return { key, originalKey: key, value, changed: false };
    } else {
      if (!key.startsWith(prefix)) {
        const newKey = `${prefix}${key}`;
        return { key: newKey, originalKey: key, value, changed: true };
      }
      return { key, originalKey: key, value, changed: false };
    }
  });
}

export function serializePrefixedEnv(results: PrefixResult[]): string {
  return results.map(r => `${r.key}=${r.value}`).join('\n');
}
