import { EnvMap } from '../env/loader';

export interface ScopeResult {
  scope: string;
  entries: EnvMap;
  total: number;
}

/**
 * Extracts entries whose keys start with the given scope prefix (e.g. "DB_").
 * The prefix is matched case-insensitively and the original keys are preserved.
 */
export function scopeEnv(
  env: EnvMap,
  scope: string,
  options: { stripPrefix?: boolean } = {}
): ScopeResult {
  const normalizedScope = scope.toUpperCase().endsWith('_')
    ? scope.toUpperCase()
    : `${scope.toUpperCase()}_`;

  const entries: EnvMap = {};

  for (const [key, value] of Object.entries(env)) {
    if (key.toUpperCase().startsWith(normalizedScope)) {
      const outputKey = options.stripPrefix
        ? key.slice(normalizedScope.length)
        : key;
      entries[outputKey] = value;
    }
  }

  return {
    scope: normalizedScope,
    entries,
    total: Object.keys(entries).length,
  };
}

/**
 * Lists all unique scope prefixes found in the env map.
 * A scope is the segment before the first underscore.
 */
export function listScopes(env: EnvMap): string[] {
  const scopes = new Set<string>();

  for (const key of Object.keys(env)) {
    const underscoreIndex = key.indexOf('_');
    if (underscoreIndex > 0) {
      scopes.add(key.slice(0, underscoreIndex).toUpperCase());
    }
  }

  return Array.from(scopes).sort();
}
