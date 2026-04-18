import * as fs from 'fs';
import * as os from 'os';
import * as path from 'path';
import { Command } from 'commander';
import { registerGroupCommand } from './group';

function writeTempEnv(content: string): string {
  const file = path.join(os.tmpdir(), `envguard-group-${Date.now()}.env`);
  fs.writeFileSync(file, content, 'utf-8');
  return file;
}

describe('registerGroupCommand', () => {
  let program: Command;

  beforeEach(() => {
    program = new Command();
    program.exitOverride();
    registerGroupCommand(program);
  });

  it('prints grouped output in text format', () => {
    const envFile = writeTempEnv('DB_HOST=localhost\nDB_PORT=5432\nAPP_NAME=test\n');
    const spy = jest.spyOn(console, 'log').mockImplementation(() => {});
    program.parse(['group', envFile], { from: 'user' });
    expect(spy).toHaveBeenCalledWith(expect.stringContaining('[DB]'));
    spy.mockRestore();
    fs.unlinkSync(envFile);
  });

  it('prints grouped output in json format', () => {
    const envFile = writeTempEnv('DB_HOST=localhost\nAPP_ENV=prod\n');
    const spy = jest.spyOn(console, 'log').mockImplementation(() => {});
    program.parse(['group', envFile, '--format', 'json'], { from: 'user' });
    const output = spy.mock.calls[0][0];
    const parsed = JSON.parse(output);
    expect(parsed.groups).toBeDefined();
    spy.mockRestore();
    fs.unlinkSync(envFile);
  });

  it('writes output to file when --output is given', () => {
    const envFile = writeTempEnv('DB_HOST=localhost\n');
    const outFile = path.join(os.tmpdir(), `envguard-group-out-${Date.now()}.txt`);
    const spy = jest.spyOn(console, 'log').mockImplementation(() => {});
    program.parse(['group', envFile, '--output', outFile], { from: 'user' });
    expect(fs.existsSync(outFile)).toBe(true);
    fs.unlinkSync(envFile);
    fs.unlinkSync(outFile);
    spy.mockRestore();
  });
});
