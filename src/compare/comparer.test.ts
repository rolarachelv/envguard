import * as fs from 'fs';
import * as os from 'os';
import * as path from 'path';
import { compareEnvFiles } from './comparer';

function writeTempEnv(content: string): string {
  const file = path.join(os.tmpdir(), `envguard-compare-${Date.now()}-${Math.random()}.env`);
  fs.writeFileSync(file, content, 'utf-8');
  return file;
}

describe('compareEnvFiles', () => {
  it('identifies matching keys', () => {
    const a = writeTempEnv('FOO=bar\nBAZ=qux\n');
    const b = writeTempEnv('FOO=bar\nBAZ=qux\n');
    const report = compareEnvFiles(a, b);
    expect(report.matchCount).toBe(2);
    expect(report.mismatchCount).toBe(0);
  });

  it('identifies mismatched values', () => {
    const a = writeTempEnv('FOO=bar\n');
    const b = writeTempEnv('FOO=baz\n');
    const report = compareEnvFiles(a, b);
    expect(report.mismatchCount).toBe(1);
    const result = report.results.find(r => r.key === 'FOO');
    expect(result?.status).toBe('mismatch');
    expect(result?.valueA).toBe('bar');
    expect(result?.valueB).toBe('baz');
  });

  it('identifies keys only in A', () => {
    const a = writeTempEnv('FOO=bar\nONLY_A=1\n');
    const b = writeTempEnv('FOO=bar\n');
    const report = compareEnvFiles(a, b);
    expect(report.missingInBCount).toBe(1);
    expect(report.results.find(r => r.key === 'ONLY_A')?.status).toBe('missing_in_b');
  });

  it('identifies keys only in B', () => {
    const a = writeTempEnv('FOO=bar\n');
    const b = writeTempEnv('FOO=bar\nONLY_B=2\n');
    const report = compareEnvFiles(a, b);
    expect(report.missingInACount).toBe(1);
    expect(report.results.find(r => r.key === 'ONLY_B')?.status).toBe('missing_in_a');
  });

  it('returns sorted results', () => {
    const a = writeTempEnv('ZZZ=1\nAAA=2\n');
    const b = writeTempEnv('ZZZ=1\nAAA=2\n');
    const report = compareEnvFiles(a, b);
    const keys = report.results.map(r => r.key);
    expect(keys).toEqual([...keys].sort());
  });
});
