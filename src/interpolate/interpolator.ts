/**
 * Interpolates environment variable references within .env values.
 * Supports ${VAR_NAME} and $VAR_NAME syntax.
 */

export interface InterpolationResult {
  key: string;
  original: string;
  resolved: string;
  missing: string[];
}

export interface InterpolationSummary {
  results: InterpolationResult[];
  unresolvedKeys: string[];
}

const BRACE_REF = /\$\{([^}]+)\}/g;
const BARE_REF = /\$([A-Z_][A-Z0-9_]*)/g;

export function resolveValue(
  value: string,
  context: Record<string, string>
): { resolved: string; missing: string[] } {
  const missing: string[] = [];

  let resolved = value.replace(BRACE_REF, (_, name) => {
    if (name in context) return context[name];
    missing.push(name);
    return "";
  });

  resolved = resolved.replace(BARE_REF, (_, name) => {
    if (name in context) return context[name];
    if (!missing.includes(name)) missing.push(name);
    return "";
  });

  return { resolved, missing };
}

export function interpolateEnv(
  env: Record<string, string>,
  extraContext: Record<string, string> = {}
): InterpolationSummary {
  const context: Record<string, string> = { ...extraContext, ...env };
  const results: InterpolationResult[] = [];
  const unresolvedKeys: string[] = [];

  for (const [key, original] of Object.entries(env)) {
    const { resolved, missing } = resolveValue(original, context);
    results.push({ key, original, resolved, missing });
    if (missing.length > 0) unresolvedKeys.push(key);
  }

  return { results, unresolvedKeys };
}
