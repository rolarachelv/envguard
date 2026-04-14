import { SchemaField } from '../schema/parser';

export interface GenerateOptions {
  overwriteExisting?: boolean;
  includeComments?: boolean;
}

export interface GeneratedEntry {
  key: string;
  value: string;
  comment?: string;
  wasExisting: boolean;
}

export interface GenerateResult {
  entries: GeneratedEntry[];
  addedCount: number;
  skippedCount: number;
}

const DEFAULT_VALUES: Record<string, string> = {
  string: '',
  number: '0',
  boolean: 'false',
  url: 'http://localhost',
  email: 'user@example.com',
};

export function generateDefaultValue(field: SchemaField): string {
  if (field.default !== undefined) {
    return String(field.default);
  }
  if (field.enum && field.enum.length > 0) {
    return field.enum[0];
  }
  return DEFAULT_VALUES[field.type ?? 'string'] ?? '';
}

export function generateEnvFromSchema(
  fields: Record<string, SchemaField>,
  existing: Record<string, string>,
  options: GenerateOptions = {}
): GenerateResult {
  const { overwriteExisting = false, includeComments = true } = options;
  const entries: GeneratedEntry[] = [];
  let addedCount = 0;
  let skippedCount = 0;

  for (const [key, field] of Object.entries(fields)) {
    const wasExisting = key in existing;
    if (wasExisting && !overwriteExisting) {
      entries.push({
        key,
        value: existing[key],
        comment: includeComments && field.description ? field.description : undefined,
        wasExisting: true,
      });
      skippedCount++;
    } else {
      const value = generateDefaultValue(field);
      entries.push({
        key,
        value,
        comment: includeComments && field.description ? field.description : undefined,
        wasExisting,
      });
      addedCount++;
    }
  }

  return { entries, addedCount, skippedCount };
}

export function serializeGeneratedEnv(result: GenerateResult): string {
  const lines: string[] = [];
  for (const entry of result.entries) {
    if (entry.comment) {
      lines.push(`# ${entry.comment}`);
    }
    lines.push(`${entry.key}=${entry.value}`);
  }
  return lines.join('\n') + '\n';
}
