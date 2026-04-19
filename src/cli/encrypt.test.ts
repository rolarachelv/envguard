import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { execSync } from 'child_process';
import * as fs from 'fs';
import * as path from 'path';
import * as os from 'os';

function writeTempEnv(dir: string, name: string, content: string): string {
  const filePath = path.join(dir, name);
  fs.writeFileSync(filePath, content);
  return filePath;
}

describe('registerEncryptCommand (CLI)', () => {
  let tmpDir: string;

  beforeEach(() => {
    tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'envguard-encrypt-'));
  });

  afterEach(() => {
    fs.rmSync(tmpDir, { recursive: true, force: true });
  });

  it('encrypts env values and outputs text by default', () => {
    const envFile = writeTempEnv(tmpDir, '.env', 'SECRET=hello\nPUBLIC=world\n');
    const result = execSync(
      `npx ts-node src/cli/run.ts encrypt --file ${envFile} --key mysecretkey`,
      { encoding: 'utf-8' }
    );
    expect(result).toContain('SECRET');
    expect(result).not.toContain('hello');
  });

  it('outputs JSON when --format json is passed', () => {
    const envFile = writeTempEnv(tmpDir, '.env', 'TOKEN=abc123\n');
    const result = execSync(
      `npx ts-node src/cli/run.ts encrypt --file ${envFile} --key mykey --format json`,
      { encoding: 'utf-8' }
    );
    const parsed = JSON.parse(result);
    expect(Array.isArray(parsed)).toBe(true);
    expect(parsed[0]).toHaveProperty('key', 'TOKEN');
    expect(parsed[0]).toHaveProperty('encrypted');
  });

  it('exits with error if --file is missing', () => {
    expect(() =>
      execSync(`npx ts-node src/cli/run.ts encrypt --key mykey`, { encoding: 'utf-8', stdio: 'pipe' })
    ).toThrow();
  });

  it('exits with error if --key is missing', () => {
    const envFile = writeTempEnv(tmpDir, '.env', 'A=1\n');
    expect(() =>
      execSync(`npx ts-node src/cli/run.ts encrypt --file ${envFile}`, { encoding: 'utf-8', stdio: 'pipe' })
    ).toThrow();
  });
});
