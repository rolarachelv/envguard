export type CastType = 'string' | 'number' | 'boolean' | 'json';

export interface CastRule {
  key: string;
  type: CastType;
}

export interface CastResult {
  key: string;
  originalValue: string;
  castedValue: unknown;
  type: CastType;
  success: boolean;
  error?: string;
}

export function castValue(value: string, type: CastType): { value: unknown; error?: string } {
  try {
    switch (type) {
      case 'string':
        return { value };
      case 'number': {
        const n = Number(value);
        if (isNaN(n)) return { value: null, error: `Cannot cast "${value}" to number` };
        return { value: n };
      }
      case 'boolean': {
        const lower = value.toLowerCase();
        if (lower === 'true' || lower === '1' || lower === 'yes') return { value: true };
        if (lower === 'false' || lower === '0' || lower === 'no') return { value: false };
        return { value: null, error: `Cannot cast "${value}" to boolean` };
      }
      case 'json': {
        const parsed = JSON.parse(value);
        return { value: parsed };
      }
      default:
        return { value: null, error: `Unknown type: ${type}` };
    }
  } catch (err) {
    return { value: null, error: `Cast error: ${(err as Error).message}` };
  }
}

export function castEnv(
  env: Record<string, string>,
  rules: CastRule[]
): CastResult[] {
  return rules.map((rule) => {
    const originalValue = env[rule.key];
    if (originalValue === undefined) {
      return {
        key: rule.key,
        originalValue: '',
        castedValue: null,
        type: rule.type,
        success: false,
        error: `Key "${rule.key}" not found in env`,
      };
    }
    const { value, error } = castValue(originalValue, rule.type);
    return {
      key: rule.key,
      originalValue,
      castedValue: value,
      type: rule.type,
      success: !error,
      error,
    };
  });
}
