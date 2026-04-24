import { formatWatchText, formatWatchJson } from './formatWatch';
import type { WatchEvent } from './watcher';

const baseEvent: WatchEvent = {
  type: 'change',
  timestamp: new Date('2024-01-15T12:00:00.000Z'),
  filePath: '/project/.env',
  report: 'All variables valid.',
};

describe('formatWatchText', () => {
  it('includes timestamp and type', () => {
    const output = formatWatchText(baseEvent);
    expect(output).toContain('2024-01-15T12:00:00.000Z');
    expect(output).toContain('CHANGE');
  });

  it('includes file path', () => {
    const output = formatWatchText(baseEvent);
    expect(output).toContain('/project/.env');
  });

  it('includes report for change events', () => {
    const output = formatWatchText(baseEvent);
    expect(output).toContain('All variables valid.');
  });

  it('includes error message for error events', () => {
    const event: WatchEvent = {
      ...baseEvent,
      type: 'error',
      error: 'File not found',
      report: undefined,
    };
    const output = formatWatchText(event);
    expect(output).toContain('ERROR');
    expect(output).toContain('File not found');
  });
});

describe('formatWatchJson', () => {
  it('returns valid JSON', () => {
    const output = formatWatchJson(baseEvent);
    expect(() => JSON.parse(output)).not.toThrow();
  });

  it('includes all fields for change event', () => {
    const parsed = JSON.parse(formatWatchJson(baseEvent));
    expect(parsed.type).toBe('change');
    expect(parsed.filePath).toBe('/project/.env');
    expect(parsed.report).toBe('All variables valid.');
    expect(parsed.timestamp).toBe('2024-01-15T12:00:00.000Z');
  });

  it('includes error field for error event', () => {
    const event: WatchEvent = {
      ...baseEvent,
      type: 'error',
      error: 'Schema parse failed',
      report: undefined,
    };
    const parsed = JSON.parse(formatWatchJson(event));
    expect(parsed.type).toBe('error');
    expect(parsed.error).toBe('Schema parse failed');
  });
});
