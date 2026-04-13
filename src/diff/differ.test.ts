import * as fs from 'fs';
import * as path from 'path';
import * as os from 'os';
import { diffEnvFiles, DiffResult } from './differ';

function writeTempEnv(content: string): string {
  const filePath = path.join(os.tmpdir(), `envguard-diff-test-${Date.now()}-${Math.random()}.env`);
  fs.writeFileSync(filePath, content);
  return filePath;
}

describe('diffEnvFiles', () => {
  afterEach(() => {
    // cleanup handled by OS tmpdir
  });

  it('detects changed values', () => {
    const fileA = writeTempEnv('KEY=old_value\nAPP=myapp\n');
    const fileB = writeTempEnv('KEY=new_value\nAPP=myapp\n');
    const result = diffEnvFiles(fileA, fileB);
    const changed = result.find((r) => r.key === 'KEY');
    expect(changed).toBeDefined();
    expect(changed?.status).toBe('changed');
    expect(changed?.valueA).toBe('old_value');
    expect(changed?.valueB).toBe('new_value');
  });

  it('detects keys missing in file B', () => {
    const fileA = writeTempEnv('ONLY_IN_A=yes\n');
    const fileB = writeTempEnv('OTHER=val\n');
    const result = diffEnvFiles(fileA, fileB);
    const missing = result.find((r) => r.key === 'ONLY_IN_A');
    expect(missing?.status).toBe('missing_in_b');
    expect(missing?.valueA).toBe('yes');
    expect(missing?.valueB).toBeUndefined();
  });

  it('detects keys missing in file A', () => {
    const fileA = writeTempEnv('OTHER=val\n');
    const fileB = writeTempEnv('ONLY_IN_B=yes\n');
    const result = diffEnvFiles(fileA, fileB);
    const added = result.find((r) => r.key === 'ONLY_IN_B');
    expect(added?.status).toBe('missing_in_a');
    expect(added?.valueA).toBeUndefined();
    expect(added?.valueB).toBe('yes');
  });

  it('marks unchanged keys', () => {
    const fileA = writeTempEnv('SAME=value\n');
    const fileB = writeTempEnv('SAME=value\n');
    const result = diffEnvFiles(fileA, fileB);
    const unchanged = result.find((r) => r.key === 'SAME');
    expect(unchanged?.status).toBe('unchanged');
  });

  it('handles empty files', () => {
    const fileA = writeTempEnv('');
    const fileB = writeTempEnv('');
    const result = diffEnvFiles(fileA, fileB);
    expect(result).toHaveLength(0);
  });

  it('handles comments and blank lines gracefully', () => {
    const fileA = writeTempEnv('# comment\n\nKEY=val\n');
    const fileB = writeTempEnv('KEY=val\n');
    const result = diffEnvFiles(fileA, fileB);
    expect(result).toHaveLength(1);
    expect(result[0].status).toBe('unchanged');
  });

  it('throws if file A does not exist', () => {
    expect(() => diffEnvFiles('/nonexistent/.env', '/tmp/.env')).toThrow();
  });
});
