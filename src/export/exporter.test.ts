import { exportEnv, filterKeys, serializeAsDotenv, serializeAsJson, serializeAsYaml, serializeAsShell } from './exporter';
import type { EnvMap } from '../env/loader';

const sampleEnv: EnvMap = {
  APP_NAME: 'envguard',
  APP_PORT: '3000',
  DB_HOST: 'localhost',
  DB_PASS: 'secret value',
};

describe('filterKeys', () => {
  it('returns all keys when no filter provided', () => {
    expect(filterKeys(sampleEnv)).toEqual(sampleEnv);
  });

  it('filters to specified keys', () => {
    const result = filterKeys(sampleEnv, ['APP_NAME', 'APP_PORT']);
    expect(Object.keys(result)).toEqual(['APP_NAME', 'APP_PORT']);
  });

  it('returns empty object when no keys match', () => {
    expect(filterKeys(sampleEnv, ['MISSING'])).toEqual({});
  });
});

describe('serializers', () => {
  it('serializeAsDotenv quotes values with spaces', () => {
    const out = serializeAsDotenv({ KEY: 'hello world' });
    expect(out).toBe('KEY="hello world"');
  });

  it('serializeAsDotenv does not quote simple values', () => {
    const out = serializeAsDotenv({ KEY: 'simple' });
    expect(out).toBe('KEY=simple');
  });

  it('serializeAsJson produces valid JSON', () => {
    const out = serializeAsJson({ A: '1' });
    expect(JSON.parse(out)).toEqual({ A: '1' });
  });

  it('serializeAsYaml formats as YAML', () => {
    const out = serializeAsYaml({ KEY: 'val' });
    expect(out).toBe('KEY: "val"');
  });

  it('serializeAsShell prefixes with export', () => {
    const out = serializeAsShell({ KEY: 'val' });
    expect(out).toBe('export KEY=val');
  });
});

describe('exportEnv', () => {
  it('exports all keys in dotenv format by default', () => {
    const result = exportEnv(sampleEnv, { format: 'dotenv' });
    expect(result.format).toBe('dotenv');
    expect(result.entries).toHaveLength(4);
    expect(result.output).toContain('APP_NAME=envguard');
  });

  it('applies key filter', () => {
    const result = exportEnv(sampleEnv, { format: 'json', keys: ['APP_NAME'] });
    expect(result.entries).toHaveLength(1);
    expect(result.entries[0].key).toBe('APP_NAME');
  });

  it('applies prefix to exported keys', () => {
    const result = exportEnv({ PORT: '8080' }, { format: 'shell', prefix: 'MY_' });
    expect(result.entries[0].key).toBe('MY_PORT');
    expect(result.output).toContain('MY_PORT=8080');
  });

  it('exports in yaml format', () => {
    const result = exportEnv({ KEY: 'val' }, { format: 'yaml' });
    expect(result.output).toContain('KEY: "val"');
  });
});
