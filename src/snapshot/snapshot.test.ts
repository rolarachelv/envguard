import * as fs from 'fs';
import * as os from 'os';
import * as path from 'path';
import { createSnapshot, saveSnapshot, loadSnapshot, EnvSnapshot } from './snapshot';

function writeTempEnv(content: string): string {
  const tmpFile = path.join(os.tmpdir(), `envguard-snap-${Date.now()}.env`);
  fs.writeFileSync(tmpFile, content, 'utf-8');
  return tmpFile;
}

describe('createSnapshot', () => {
  it('should create a snapshot with parsed variables', () => {
    const envPath = writeTempEnv('APP_NAME=envguard\nPORT=3000\n');
    const snap = createSnapshot(envPath);
    expect(snap.variables['APP_NAME']).toBe('envguard');
    expect(snap.variables['PORT']).toBe('3000');
    expect(snap.timestamp).toBeTruthy();
    expect(snap.source).toContain('.env');
    fs.unlinkSync(envPath);
  });

  it('should throw if env file does not exist', () => {
    expect(() => createSnapshot('/nonexistent/.env')).toThrow('Env file not found');
  });
});

describe('saveSnapshot and loadSnapshot', () => {
  it('should save and reload a snapshot correctly', () => {
    const envPath = writeTempEnv('KEY=value\n');
    const snap = createSnapshot(envPath);
    const outPath = path.join(os.tmpdir(), `envguard-snap-out-${Date.now()}.json`);
    saveSnapshot(snap, outPath);
    const loaded = loadSnapshot(outPath);
    expect(loaded.variables['KEY']).toBe('value');
    expect(loaded.timestamp).toBe(snap.timestamp);
    fs.unlinkSync(envPath);
    fs.unlinkSync(outPath);
  });

  it('should throw if snapshot file does not exist', () => {
    expect(() => loadSnapshot('/nonexistent/snap.json')).toThrow('Snapshot file not found');
  });

  it('should throw if snapshot file has invalid format', () => {
    const badPath = path.join(os.tmpdir(), `bad-snap-${Date.now()}.json`);
    fs.writeFileSync(badPath, JSON.stringify({ foo: 'bar' }), 'utf-8');
    expect(() => loadSnapshot(badPath)).toThrow('Invalid snapshot format');
    fs.unlinkSync(badPath);
  });
});
