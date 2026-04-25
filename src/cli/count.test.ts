import * as fs from 'fs';
import * as os from 'os';
import * as path from 'path';
import { Command } from 'commander';
import { registerCountCommand } from './count';

function writeTempEnv(content: string): string {
  const file = path.join(os.tmpdir(), `envguard-count-${Date.now()}.env`);
  fs.writeFileSync(file, content);
  return file;
}

function runCount(args: string[]): string {
  const logs: string[] = [];
  const spy = jest.spyOn(console, 'log').mockImplementation((msg) => logs.push(msg));
  const program = new Command();
  program.exitOverride();
  registerCountCommand(program);
  program.parse(['node', 'envguard', ...args]);
  spy.mockRestore();
  return logs.join('\n');
}

describe('registerCountCommand', () => {
  it('outputs text report with total', () => {
    const file = writeTempEnv('DB_HOST=localhost\nDB_PORT=5432\nAPP_NAME=myapp\n');
    const output = runCount(['count', file]);
    expect(output).toContain('Total: 3');
    expect(output).toContain('DB');
    expect(output).toContain('APP');
    fs.unlinkSync(file);
  });

  it('outputs JSON when --json flag is set', () => {
    const file = writeTempEnv('DB_HOST=localhost\nDB_PORT=5432\n');
    const output = runCount(['count', file, '--json']);
    const parsed = JSON.parse(output);
    expect(parsed.total).toBe(2);
    expect(parsed.byPrefix.DB).toBe(2);
    fs.unlinkSync(file);
  });

  it('filters by prefix when --prefix is provided', () => {
    const file = writeTempEnv('DB_HOST=localhost\nDB_PORT=5432\nAPP_NAME=myapp\n');
    const output = runCount(['count', file, '--prefix', 'DB']);
    expect(output).toContain('DB');
    expect(output).not.toContain('APP');
    fs.unlinkSync(file);
  });

  it('handles empty env file', () => {
    const file = writeTempEnv('');
    const output = runCount(['count', file]);
    expect(output).toContain('Total: 0');
    fs.unlinkSync(file);
  });
});
