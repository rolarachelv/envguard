import { SchemaField } from '../schema/parser';

export interface DocEntry {
  key: string;
  type: string;
  required: boolean;
  defaultValue?: string;
  description?: string;
  example?: string;
}

export interface DocOutput {
  entries: DocEntry[];
  generatedAt: string;
}

export function buildDocEntry(field: SchemaField): DocEntry {
  return {
    key: field.key,
    type: field.type ?? 'string',
    required: field.required ?? false,
    defaultValue: field.default !== undefined ? String(field.default) : undefined,
    description: field.description,
    example: field.example,
  };
}

export function generateDocs(fields: SchemaField[]): DocOutput {
  return {
    entries: fields.map(buildDocEntry),
    generatedAt: new Date().toISOString(),
  };
}
