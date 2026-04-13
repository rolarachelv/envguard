import { describe, it, expect } from 'vitest';
import { lintEnv, LintResult } from './linter';
import { EnvSchema } from '../schema/parser';

const baseSchema: EnvSchema = {
  fields: {
    DATABASE_URL: { type: 'url', required: true, description: 'Postgres connection URL' },
    API_SECRET: { type: 'string', required: true, sensitive: true, description: 'API secret key' },
    APP_NAME: { type: 'string', required: false },
  },
};

describe('lintEnv', () => {
  it('returns no issues for a clean env', () => {
    const env = {
      DATABASE_URL: 'https://db.example.com/mydb',
      API_SECRET: 'supersecretvalue',
      APP_NAME: 'MyApp',
    };
    const result = lintEnv(env, baseSchema);
    expect(result.errorCount).toBe(0);
    expect(result.warningCount).toBe(0);
  });

  it('flags missing description as info', () => {
    const result = lintEnv({ APP_NAME: 'test' }, baseSchema);
    const infoIssues = result.issues.filter((i) => i.severity === 'info' && i.key === 'APP_NAME');
    expect(infoIssues.length).toBeGreaterThan(0);
  });

  it('flags sensitive-looking field not marked sensitive as warning', () => {
    const schema: EnvSchema = {
      fields: { AUTH_TOKEN: { type: 'string', required: true, description: 'Auth token' } },
    };
    const result = lintEnv({ AUTH_TOKEN: 'abc123' }, schema);
    const warn = result.issues.find((i) => i.key === 'AUTH_TOKEN' && i.severity === 'warning');
    expect(warn).toBeDefined();
  });

  it('flags placeholder values as warnings', () => {
    const env = { DATABASE_URL: 'changeme', API_SECRET: 'supersecret', APP_NAME: 'test' };
    const result = lintEnv(env, baseSchema);
    const warn = result.issues.find((i) => i.key === 'DATABASE_URL' && i.severity === 'warning');
    expect(warn).toBeDefined();
  });

  it('flags invalid URL as error', () => {
    const env = { DATABASE_URL: 'not-a-url', API_SECRET: 'supersecret', APP_NAME: 'test' };
    const result = lintEnv(env, baseSchema);
    expect(result.errorCount).toBeGreaterThan(0);
    const err = result.issues.find((i) => i.key === 'DATABASE_URL' && i.severity === 'error');
    expect(err).toBeDefined();
  });

  it('counts severities correctly', () => {
    const result: LintResult = lintEnv({}, baseSchema);
    expect(result.errorCount).toBe(result.issues.filter((i) => i.severity === 'error').length);
    expect(result.warningCount).toBe(result.issues.filter((i) => i.severity === 'warning').length);
    expect(result.infoCount).toBe(result.issues.filter((i) => i.severity === 'info').length);
  });
});
