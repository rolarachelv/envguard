import { applyDefaults, serializeDefaultedEnv } from './defaulter';
import { SchemaField } from '../schema/parser';

const schema: Record<string, SchemaField> = {
  PORT: { type: 'number', required: true, default: 3000 },
  NODE_ENV: { type: 'string', required: true, default: 'development' },
  DEBUG: { type: 'boolean', required: false, default: false },
  API_KEY: { type: 'string', required: true },
};

describe('applyDefaults', () => {
  it('applies defaults for missing keys', () => {
    const env = { API_KEY: 'abc123' };
    const { results, env: out } = applyDefaults(env, schema);

    expect(out['PORT']).toBe('3000');
    expect(out['NODE_ENV']).toBe('development');
    expect(out['DEBUG']).toBe('false');
    expect(out['API_KEY']).toBe('abc123');

    const applied = results.filter((r) => r.wasApplied);
    expect(applied).toHaveLength(3);
  });

  it('does not override existing values', () => {
    const env = { PORT: '8080', NODE_ENV: 'production', DEBUG: 'true', API_KEY: 'key' };
    const { results } = applyDefaults(env, schema);

    const applied = results.filter((r) => r.wasApplied);
    expect(applied).toHaveLength(0);
  });

  it('treats empty string as missing and applies default', () => {
    const env = { PORT: '', API_KEY: 'key' };
    const { env: out } = applyDefaults(env, schema);
    expect(out['PORT']).toBe('3000');
  });

  it('returns unchanged results for keys with values', () => {
    const env = { PORT: '9000', NODE_ENV: 'test', DEBUG: 'false', API_KEY: 'x' };
    const { results } = applyDefaults(env, schema);
    const unchanged = results.filter((r) => !r.wasApplied);
    expect(unchanged).toHaveLength(4);
  });
});

describe('serializeDefaultedEnv', () => {
  it('serializes env map to dotenv format', () => {
    const env = { PORT: '3000', NODE_ENV: 'development' };
    const output = serializeDefaultedEnv(env);
    expect(output).toContain('PORT=3000');
    expect(output).toContain('NODE_ENV=development');
  });
});
