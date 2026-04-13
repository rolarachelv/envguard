import * as fs from 'fs';
import * as path from 'path';

export type FieldType = 'string' | 'number' | 'boolean' | 'url' | 'email';

export interface SchemaField {
  type: FieldType;
  required: boolean;
  description?: string;
  default?: string;
  pattern?: string;
}

export interface Schema {
  [key: string]: SchemaField;
}

export class SchemaParseError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'SchemaParseError';
  }
}

const VALID_TYPES: FieldType[] = ['string', 'number', 'boolean', 'url', 'email'];

function validateField(key: string, raw: unknown): SchemaField {
  if (typeof raw !== 'object' || raw === null) {
    throw new SchemaParseError(`Field "${key}" must be an object.`);
  }

  const field = raw as Record<string, unknown>;

  if (!field.type || !VALID_TYPES.includes(field.type as FieldType)) {
    throw new SchemaParseError(
      `Field "${key}" has invalid or missing type. Must be one of: ${VALID_TYPES.join(', ')}.`
    );
  }

  return {
    type: field.type as FieldType,
    required: field.required !== false,
    description: typeof field.description === 'string' ? field.description : undefined,
    default: typeof field.default === 'string' ? field.default : undefined,
    pattern: typeof field.pattern === 'string' ? field.pattern : undefined,
  };
}

export function parseSchema(schemaPath: string): Schema {
  const resolved = path.resolve(schemaPath);

  if (!fs.existsSync(resolved)) {
    throw new SchemaParseError(`Schema file not found: ${resolved}`);
  }

  let raw: unknown;
  try {
    const content = fs.readFileSync(resolved, 'utf-8');
    raw = JSON.parse(content);
  } catch (err) {
    throw new SchemaParseError(`Failed to parse schema JSON: ${(err as Error).message}`);
  }

  if (typeof raw !== 'object' || raw === null || Array.isArray(raw)) {
    throw new SchemaParseError('Schema must be a JSON object at the top level.');
  }

  const schema: Schema = {};
  for (const [key, value] of Object.entries(raw as Record<string, unknown>)) {
    schema[key] = validateField(key, value);
  }

  return schema;
}
