import { describe, it, expect } from 'vitest';
import { formatTransformText, formatTransformJson, renderChange } from './formatTransform';
import { TransformResult } from './transformer';

const sampleChanges: TransformResult[] = [
  { key: 'NAME', original: '  alice  ', transformed: 'alice', operation: 'trim' },
  { key: 'ROLE', original: 'admin', transformed: 'ADMIN', operation: 'uppercase' },
];

describe('renderChange', () => {
  it('formats a single change line', () => {
    const line = renderChange(sampleChanges[0]);
    expect(line).toContain('NAME');
    expect(line).toContain('alice');
    expect(line).toContain('trim');
  });
});

describe('formatTransformText', () => {
  it('includes summary line', () => {
    const output = formatTransformText(sampleChanges, 5);
    expect(output).toContain('2 of 5 keys changed');
  });

  it('lists all changes', () => {
    const output = formatTransformText(sampleChanges, 5);
    expect(output).toContain('NAME');
    expect(output).toContain('ROLE');
  });

  it('shows no-changes message when empty', () => {
    const output = formatTransformText([], 3);
    expect(output).toContain('No changes applied.');
  });
});

describe('formatTransformJson', () => {
  it('returns valid JSON', () => {
    const output = formatTransformJson(sampleChanges, 5);
    expect(() => JSON.parse(output)).not.toThrow();
  });

  it('includes summary and changes array', () => {
    const parsed = JSON.parse(formatTransformJson(sampleChanges, 5));
    expect(parsed.summary.changed).toBe(2);
    expect(parsed.summary.total).toBe(5);
    expect(parsed.changes).toHaveLength(2);
  });

  it('each change entry has required fields', () => {
    const parsed = JSON.parse(formatTransformJson(sampleChanges, 5));
    const first = parsed.changes[0];
    expect(first).toHaveProperty('key');
    expect(first).toHaveProperty('original');
    expect(first).toHaveProperty('transformed');
    expect(first).toHaveProperty('operation');
  });
});
