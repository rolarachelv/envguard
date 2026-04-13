import { formatSnapshotText, formatSnapshotJson } from './formatSnapshot';
import { EnvSnapshot } from './snapshot';

const mockSnapshot: EnvSnapshot = {
  timestamp: '2024-01-01T00:00:00.000Z',
  source: '/project/.env',
  variables: {
    APP_NAME: 'envguard',
    SECRET_KEY: 'supersecret',
    EMPTY_VAR: '',
  },
};

describe('formatSnapshotText', () => {
  it('should include source and timestamp', () => {
    const output = formatSnapshotText(mockSnapshot);
    expect(output).toContain('/project/.env');
    expect(output).toContain('2024-01-01T00:00:00.000Z');
  });

  it('should mask variable values', () => {
    const output = formatSnapshotText(mockSnapshot);
    expect(output).toContain('APP_NAME=');
    expect(output).not.toContain('envguard');
    expect(output).not.toContain('supersecret');
  });

  it('should show (empty) for empty values', () => {
    const output = formatSnapshotText(mockSnapshot);
    expect(output).toContain('EMPTY_VAR=(empty)');
  });

  it('should report variable count', () => {
    const output = formatSnapshotText(mockSnapshot);
    expect(output).toContain('Variables : 3');
  });
});

describe('formatSnapshotJson', () => {
  it('should return valid JSON', () => {
    const output = formatSnapshotJson(mockSnapshot);
    expect(() => JSON.parse(output)).not.toThrow();
  });

  it('should include variableCount', () => {
    const parsed = JSON.parse(formatSnapshotJson(mockSnapshot));
    expect(parsed.variableCount).toBe(3);
  });

  it('should mask variable values in JSON output', () => {
    const parsed = JSON.parse(formatSnapshotJson(mockSnapshot));
    expect(parsed.variables['SECRET_KEY']).not.toBe('supersecret');
    expect(parsed.variables['SECRET_KEY']).toMatch(/^\*+$/);
  });

  it('should set empty string for empty variable', () => {
    const parsed = JSON.parse(formatSnapshotJson(mockSnapshot));
    expect(parsed.variables['EMPTY_VAR']).toBe('');
  });
});
