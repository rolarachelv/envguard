import { SchemaField } from '../schema/parser';

export interface ValidationResult {
  valid: boolean;
  errors: ValidationError[];
  warnings: ValidationWarning[];
}

export interface ValidationError {
  field: string;
  message: string;
  type: 'missing' | 'invalid_type' | 'pattern_mismatch' | 'invalid_enum';
}

export interface ValidationWarning {
  field: string;
  message: string;
}

export function validateEnvAgainstSchema(
  env: Record<string, string>,
  schema: Record<string, SchemaField>
): ValidationResult {
  const errors: ValidationError[] = [];
  const warnings: ValidationWarning[] = [];

  for (const [key, field] of Object.entries(schema)) {
    const value = env[key];

    if (value === undefined || value === '') {
      if (field.required) {
        errors.push({ field: key, message: `Missing required variable: ${key}`, type: 'missing' });
      } else if (field.default !== undefined) {
        warnings.push({ field: key, message: `Using default value for ${key}: "${field.default}"` });
      }
      continue;
    }

    if (field.type === 'number' && isNaN(Number(value))) {
      errors.push({ field: key, message: `${key} must be a number, got "${value}"`, type: 'invalid_type' });
    }

    if (field.type === 'boolean' && !['true', 'false', '1', '0'].includes(value.toLowerCase())) {
      errors.push({ field: key, message: `${key} must be a boolean, got "${value}"`, type: 'invalid_type' });
    }

    if (field.pattern) {
      const regex = new RegExp(field.pattern);
      if (!regex.test(value)) {
        errors.push({ field: key, message: `${key} does not match pattern ${field.pattern}`, type: 'pattern_mismatch' });
      }
    }

    if (field.enum && !field.enum.includes(value)) {
      errors.push({ field: key, message: `${key} must be one of [${field.enum.join(', ')}], got "${value}"`, type: 'invalid_enum' });
    }
  }

  for (const key of Object.keys(env)) {
    if (!schema[key]) {
      warnings.push({ field: key, messageUndocumented variable: ${key} is not defined in schema` });
    }
  }

  return { valid: errors.length === 0, errors, warnings };
}
