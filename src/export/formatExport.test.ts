import { formatExportText, formatExportJson } from './formatExport';
import type { ExportResult } from './exporter';

const sampleResult: ExportResult = {
  format: 'dotenv',
  entries: [
    { key: 'APP_NAME', value: 'envguard' },
    { key: 'APP_PORT', value: '3000' },
  ],
  output: 'APP_NAME=envguard\nAPP_PORT=3000',
};

describe('formatExportText', () => {
  it('includes format name', () => {
    const out = formatExportText(sampleResult);
    expect(out).toContain('Export format: dotenv');
  });

  it('includes variable count', () => {
    const out = formatExportText(sampleResult);
    expect(out).toContain('Exported 2 variable(s)');
  });

  it('lists each key=value entry', () => {
    const out = formatExportText(sampleResult);
    expect(out).toContain('APP_NAME=envguard');
    expect(out).toContain('APP_PORT=3000');
  });

  it('includes output section', () => {
    const out = formatExportText(sampleResult);
    expect(out).toContain('--- Output ---');
  });
});

describe('formatExportJson', () => {
  it('produces valid JSON', () => {
    const out = formatExportJson(sampleResult);
    expect(() => JSON.parse(out)).not.toThrow();
  });

  it('includes format field', () => {
    const parsed = JSON.parse(formatExportJson(sampleResult));
    expect(parsed.format).toBe('dotenv');
  });

  it('includes count field', () => {
    const parsed = JSON.parse(formatExportJson(sampleResult));
    expect(parsed.count).toBe(2);
  });

  it('includes entries array', () => {
    const parsed = JSON.parse(formatExportJson(sampleResult));
    expect(parsed.entries).toHaveLength(2);
    expect(parsed.entries[0]).toEqual({ key: 'APP_NAME', value: 'envguard' });
  });

  it('includes output string', () => {
    const parsed = JSON.parse(formatExportJson(sampleResult));
    expect(parsed.output).toContain('APP_NAME=envguard');
  });
});
