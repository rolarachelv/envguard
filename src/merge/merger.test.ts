import * as fs from 'fs';
import * as os from 'os';
import * as path from 'path';
import { mergeEnvFiles } from './merger';
import { formatMergeText, formatMergeJson } from './formatMerge';

function writeTempEnv(content: string): string {
  const file = path.join(os.tmpdir(), `envguard-merge-${Date.now()}-${Math.random()}.env`);
  fs.writeFileSync(file, content, 'utf-8');
  return file;
}

describe('mergeEnvFiles', () => {
  it('merges two non-conflicting env files', () => {
    const a = writeTempEnv('FOO=bar\nSHARED=from-a');
    const b = writeTempEnv('BAZ=qux');
    const result = mergeEnvFiles([a, b], 'last-wins');
    expect(result.merged).toMatchObject({ FOO: 'bar', SHARED: 'from-a', BAZ: 'qux' });
    expect(result.conflicts).toHaveLength(0);
  });

  it('detects conflicts and applies last-wins strategy', () => {
    const a = writeTempEnv('KEY=first');
    const b = writeTempEnv('KEY=second');
    const result = mergeEnvFiles([a, b], 'last-wins');
    expect(result.merged.KEY).toBe('second');
    expect(result.conflicts).toHaveLength(1);
    expect(result.conflicts[0].key).toBe('KEY');
  });

  it('applies first-wins strategy', () => {
    const a = writeTempEnv('KEY=first');
    const b = writeTempEnv('KEY=second');
    const result = mergeEnvFiles([a, b], 'first-wins');
    expect(result.merged.KEY).toBe('first');
  });

  it('throws on conflict with error-on-conflict strategy', () => {
    const a = writeTempEnv('KEY=alpha');
    const b = writeTempEnv('KEY=beta');
    expect(() => mergeEnvFiles([a, b], 'error-on-conflict')).toThrow(/Merge conflict/);
  });

  it('merges three files correctly', () => {
    const a = writeTempEnv('A=1');
    const b = writeTempEnv('B=2');
    const c = writeTempEnv('C=3\nA=override');
    const result = mergeEnvFiles([a, b, c], 'last-wins');
    expect(result.merged).toMatchObject({ A: 'override', B: '2', C: '3' });
    expect(result.conflicts).toHaveLength(1);
  });
});

describe('formatMergeText', () => {
  it('produces text output with no conflicts', () => {
    const a = writeTempEnv('X=1');
    const result = mergeEnvFiles([a]);
    const text = formatMergeText(result);
    expect(text).toContain('No conflicts detected.');
    expect(text).toContain('X=1');
  });
});

describe('formatMergeJson', () => {
  it('produces valid JSON output', () => {
    const a = writeTempEnv('X=1\nY=2');
    const result = mergeEnvFiles([a]);
    const json = JSON.parse(formatMergeJson(result));
    expect(json.mergedCount).toBe(2);
    expect(json.conflictCount).toBe(0);
    expect(json.merged).toMatchObject({ X: '1', Y: '2' });
  });
});
