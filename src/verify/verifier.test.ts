import * as fs from 'fs';
import * as os from 'os';
import * as path from 'path';
import { verifyEnv } from './verifier';

function writeTempEnv(content: string): string {
  const file = path.join(os.tmpdir(), `verify-test-${Date.now()}.env`);
  fs.writeFileSync(file, content, 'utf8');
  return file;
}

describe('verifyEnv', () => {
  it('reports matching keys as passed', () => {
    const file = writeTempEnv('HOST=localhost\nPORT=3000\n');
    const report = verifyEnv(file, { HOST: 'localhost', PORT: '3000' });
    expect(report.passed).toBe(2);
    expect(report.failed).toBe(0);
    expect(report.results.every(r => r.match)).toBe(true);
  });

  it('reports mismatched values as failed', () => {
    const file = writeTempEnv('HOST=localhost\nPORT=8080\n');
    const report = verifyEnv(file, { HOST: 'localhost', PORT: '3000' });
    expect(report.passed).toBe(1);
    expect(report.failed).toBe(1);
    const portResult = report.results.find(r => r.key === 'PORT')!;
    expect(portResult.match).toBe(false);
    expect(portResult.actual).toBe('8080');
  });

  it('reports missing keys as failed', () => {
    const file = writeTempEnv('HOST=localhost\n');
    const report = verifyEnv(file, { HOST: 'localhost', PORT: '3000' });
    expect(report.failed).toBe(1);
    const portResult = report.results.find(r => r.key === 'PORT')!;
    expect(portResult.actual).toBeUndefined();
  });

  it('returns empty results for empty expected', () => {
    const file = writeTempEnv('HOST=localhost\n');
    const report = verifyEnv(file, {});
    expect(report.results).toHaveLength(0);
    expect(report.passed).toBe(0);
    expect(report.failed).toBe(0);
  });
});
