import * as fs from 'fs';
import * as os from 'os';
import * as path from 'path';
import { parseSchema, SchemaParseError } from './parser';

function writeTempSchema(content: string): string {
  const tmpFile = path.join(os.tmpdir(), `envguard-schema-${Date.now()}.json`);
  fs.writeFileSync(tmpFile, content, 'utf-8');
  return tmpFile;
}

describe('parseSchema', () => {
  it('parses a valid schema file', () => {
    const schemaContent = JSON.stringify({
      DATABASE_URL: { type: 'url', required: true, description: 'Postgres connection URL' },
      PORT: { type: 'number', required: false, default: '3000' },
      DEBUG: { type: 'boolean', required: false },
    });
    const tmpFile = writeTempSchema(schemaContent);
    const schema = parseSchema(tmpFile);

    expect(schema['DATABASE_URL']).toEqual({
      type: 'url',
      required: true,
      description: 'Postgres connection URL',
      default: undefined,
      pattern: undefined,
    });
    expect(schema['PORT'].default).toBe('3000');
    expect(schema['PORT'].required).toBe(false);
    expect(schema['DEBUG'].type).toBe('boolean');
    fs.unlinkSync(tmpFile);
  });

  it('defaults required to true when not specified', () => {
    const tmpFile = writeTempSchema(JSON.stringify({ API_KEY: { type: 'string' } }));
    const schema = parseSchema(tmpFile);
    expect(schema['API_KEY'].required).toBe(true);
    fs.unlinkSync(tmpFile);
  });

  it('throws SchemaParseError when file does not exist', () => {
    expect(() => parseSchema('/nonexistent/path/schema.json')).toThrow(SchemaParseError);
  });

  it('throws SchemaParseError for invalid JSON', () => {
    const tmpFile = writeTempSchema('{ invalid json }');
    expect(() => parseSchema(tmpFile)).toThrow(SchemaParseError);
    fs.unlinkSync(tmpFile);
  });

  it('throws SchemaParseError when schema is not an object', () => {
    const tmpFile = writeTempSchema(JSON.stringify([{ type: 'string' }]));
    expect(() => parseSchema(tmpFile)).toThrow(SchemaParseError);
    fs.unlinkSync(tmpFile);
  });

  it('throws SchemaParseError for an invalid field type', () => {
    const tmpFile = writeTempSchema(JSON.stringify({ BAD_FIELD: { type: 'uuid' } }));
    expect(() => parseSchema(tmpFile)).toThrow(SchemaParseError);
    fs.unlinkSync(tmpFile);
  });

  it('parses optional pattern field', () => {
    const tmpFile = writeTempSchema(
      JSON.stringify({ REGION: { type: 'string', pattern: '^[a-z]+-[0-9]+$' } })
    );
    const schema = parseSchema(tmpFile);
    expect(schema['REGION'].pattern).toBe('^[a-z]+-[0-9]+$');
    fs.unlinkSync(tmpFile);
  });
});
