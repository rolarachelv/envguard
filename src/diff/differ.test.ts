import * as fs from 'fs';
import * as os from 'os';
import * as path from 'path';
import { diffEnvFiles } from './differ';

function writeTempEnv(content: string): string {
  const tmpFile = path.join(os.tmpdir(), `envguard-test-${Date.now()}-${Math.random()}.env`);
  fs.writeFileSync(tmpFile, content, 'utf-8');
  return tmpFile;
}

describe('diffEnvFiles', () => {
  let fileA: string;
  let fileB: string;

  afterEach(() => {
    [fileA, fileB].forEach(f => { if (f && fs.existsSync(f)) fs.unlinkSync(f); });
  });

  it('detects added keys', () => {
    fileA = writeTempEnv('FOO=bar\n');
    fileB = writeTempEnv('FOO=bar\nBAZ=qux\n');
    const result = diffEnvFiles(fileA, fileB);
    expect(result.addedCount).toBe(1);
    const added = result.entries.find(e => e.key === 'BAZ');
    expect(added?.status).toBe('added');
    expect(added?.newValue).toBe('qux');
  });

  it('detects removed keys', () => {
    fileA = writeTempEnv('FOO=bar\nOLD=value\n');
    fileB = writeTempEnv('FOO=bar\n');
    const result = diffEnvFiles(fileA, fileB);
    expect(result.removedCount).toBe(1);
    const removed = result.entries.find(e => e.key === 'OLD');
    expect(removed?.status).toBe('removed');
    expect(removed?.oldValue).toBe('value');
  });

  it('detects changed values', () => {
    fileA = writeTempEnv('FOO=old\n');
    fileB = writeTempEnv('FOO=new\n');
    const result = diffEnvFiles(fileA, fileB);
    expect(result.changedCount).toBe(1);
    const changed = result.entries.find(e => e.key === 'FOO');
    expect(changed?.status).toBe('changed');
    expect(changed?.oldValue).toBe('old');
    expect(changed?.newValue).toBe('new');
  });

  it('detects unchanged keys', () => {
    fileA = writeTempEnv('FOO=bar\n');
    fileB = writeTempEnv('FOO=bar\n');
    const result = diffEnvFiles(fileA, fileB);
    expect(result.unchangedCount).toBe(1);
    expect(result.addedCount).toBe(0);
    expect(result.removedCount).toBe(0);
    expect(result.changedCount).toBe(0);
  });

  it('returns sorted entries', () => {
    fileA = writeTempEnv('Z=1\nA=2\nM=3\n');
    fileB = writeTempEnv('Z=1\nA=2\nM=3\n');
    const result = diffEnvFiles(fileA, fileB);
    const keys = result.entries.map(e => e.key);
    expect(keys).toEqual([...keys].sort());
  });

  it('includes file paths in result', () => {
    fileA = writeTempEnv('FOO=1\n');
    fileB = writeTempEnv('FOO=1\n');
    const result = diffEnvFiles(fileA, fileB);
    expect(result.baseFile).toBe(fileA);
    expect(result.compareFile).toBe(fileB);
  });
});
