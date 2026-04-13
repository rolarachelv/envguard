/**
 * Redacts sensitive values in a parsed env object based on key patterns or schema hints.
 */

export interface RedactOptions {
  patterns?: RegExp[];
  placeholder?: string;
}

const DEFAULT_PATTERNS: RegExp[] = [
  /secret/i,
  /password/i,
  /passwd/i,
  /token/i,
  /api[_-]?key/i,
  /private[_-]?key/i,
  /auth/i,
  /credential/i,
];

const DEFAULT_PLACEHOLDER = "[REDACTED]";

export function shouldRedact(
  key: string,
  patterns: RegExp[] = DEFAULT_PATTERNS
): boolean {
  return patterns.some((pattern) => pattern.test(key));
}

export function redactValue(
  key: string,
  value: string,
  options: RedactOptions = {}
): string {
  const patterns = options.patterns ?? DEFAULT_PATTERNS;
  const placeholder = options.placeholder ?? DEFAULT_PLACEHOLDER;
  return shouldRedact(key, patterns) ? placeholder : value;
}

export function redactEnv(
  env: Record<string, string>,
  options: RedactOptions = {}
): Record<string, string> {
  const result: Record<string, string> = {};
  for (const [key, value] of Object.entries(env)) {
    result[key] = redactValue(key, value, options);
  }
  return result;
}
