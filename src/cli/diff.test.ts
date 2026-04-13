import { Command } from 'commander';
import { registerDiffCommand } from './diff';
import * as fs from 'fs';
import * as os from 'os';
import * as path from 'path';

function writeTempEnv(content: string): string {
  const file = path.join(os.tmpdir(), `envguard-diff-cli-${Date.now()}-${Math.random()}.env`);
  fs.writeFileSync(file, content, 'utf-8');
  return file;
}

describe('registerDiffCommand', () => {
  let program: Command;
  let exitSpy: jest.SpyInstance;
  let logSpy: jest.SpyInstance;
  let errorSpy: jest.SpyInstance;

  beforeEach(() => {
    program = new Command();
    program.exitOverride();
    registerDiffCommand(program);
    exitSpy = jest.spyOn(process, 'exit').mockImplementation(() => undefined as never);
    logSpy = jest.spyOn(console, 'log').mockImplementation(() => {});
    errorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('should output text diff for two different env files', () => {
    const f1 = writeTempEnv('FOO=bar\nBAZ=qux\n');
    const f2 = writeTempEnv('FOO=changed\nNEW=value\n');
    program.parse(['node', 'envguard', 'diff', f1, f2]);
    expect(logSpy).toHaveBeenCalled();
    expect(exitSpy).toHaveBeenCalledWith(1);
    fs.unlinkSync(f1);
    fs.unlinkSync(f2);
  });

  it('should exit with 0 when files are identical', () => {
    const f1 = writeTempEnv('FOO=bar\n');
    const f2 = writeTempEnv('FOO=bar\n');
    program.parse(['node', 'envguard', 'diff', f1, f2]);
    expect(exitSpy).toHaveBeenCalledWith(0);
    fs.unlinkSync(f1);
    fs.unlinkSync(f2);
  });

  it('should output json format when --format json is passed', () => {
    const f1 = writeTempEnv('FOO=bar\n');
    const f2 = writeTempEnv('FOO=bar\nNEW=val\n');
    program.parse(['node', 'envguard', 'diff', '--format', 'json', f1, f2]);
    const output = logSpy.mock.calls[0][0];
    expect(() => JSON.parse(output)).not.toThrow();
    fs.unlinkSync(f1);
    fs.unlinkSync(f2);
  });

  it('should error and exit 1 when file1 does not exist', () => {
    const f2 = writeTempEnv('FOO=bar\n');
    program.parse(['node', 'envguard', 'diff', '/nonexistent/.env', f2]);
    expect(errorSpy).toHaveBeenCalledWith(expect.stringContaining('File not found'));
    expect(exitSpy).toHaveBeenCalledWith(1);
    fs.unlinkSync(f2);
  });

  it('should write output to file when --output is specified', () => {
    const f1 = writeTempEnv('FOO=bar\n');
    const f2 = writeTempEnv('FOO=baz\n');
    const outFile = path.join(os.tmpdir(), `envguard-diff-out-${Date.now()}.txt`);
    program.parse(['node', 'envguard', 'diff', '--output', outFile, f1, f2]);
    expect(fs.existsSync(outFile)).toBe(true);
    fs.unlinkSync(f1);
    fs.unlinkSync(f2);
    fs.unlinkSync(outFile);
  });
});
