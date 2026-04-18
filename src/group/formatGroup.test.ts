import { formatGroupText, formatGroupJson } from './formatGroup';

const sampleGroups: Record<string, Record<string, string>> = {
  DB: { DB_HOST: 'localhost', DB_PORT: '5432' },
  APP: { APP_NAME: 'envguard', APP_ENV: 'test' },
};

describe('formatGroupText', () => {
  it('renders each group with header and entries', () => {
    const output = formatGroupText(sampleGroups);
    expect(output).toContain('[DB]');
    expect(output).toContain('DB_HOST=localhost');
    expect(output).toContain('[APP]');
    expect(output).toContain('APP_NAME=envguard');
  });

  it('returns message when no groups', () => {
    expect(formatGroupText({})).toContain('No groups');
  });
});

describe('formatGroupJson', () => {
  it('returns valid JSON with groups', () => {
    const output = formatGroupJson(sampleGroups);
    const parsed = JSON.parse(output);
    expect(parsed.groups).toBeDefined();
    expect(parsed.groups.DB).toEqual({ DB_HOST: 'localhost', DB_PORT: '5432' });
  });

  it('returns empty groups object when none', () => {
    const parsed = JSON.parse(formatGroupJson({}));
    expect(parsed.groups).toEqual({});
  });
});
