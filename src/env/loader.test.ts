import * as fs from 'fs';
import * as os from 'os';
import * as path from 'path';
import { parseEnvContent, loadEnvFile, EnvLoadError } from './loader';

function writeTempEnv(content: string): string {
  const filePath = path.join(os.tmpdir(), `envguard-test-${Date.now()}.env`);
  fs.writeFileSync(filePath, content, 'utf-8');
  return filePath;
}

describe('parseEnvContent', () => {
  it('parses simple key=value pairs', () => {
    const result = parseEnvContent('FOO=bar\nBAZ=qux');
    expect(result).toEqual({ FOO: 'bar', BAZ: 'qux' });
  });

  it('skips blank lines and comments', () => {
    const result = parseEnvContent('# comment\n\nKEY=value\n');
    expect(result).toEqual({ KEY: 'value' });
  });

  it('strips double quotes from values', () => {
    const result = parseEnvContent('SECRET="my secret"');
    expect(result).toEqual({ SECRET: 'my secret' });
  });

  it('strips single quotes from values', () => {
    const result = parseEnvContent("TOKEN='abc123'");
    expect(result).toEqual({ TOKEN: 'abc123' });
  });

  it('handles values with equals signs', () => {
    const result = parseEnvContent('URL=http://example.com?a=1&b=2');
    expect(result).toEqual({ URL: 'http://example.com?a=1&b=2' });
  });

  it('handles empty values', () => {
    const result = parseEnvContent('EMPTY=');
    expect(result).toEqual({ EMPTY: '' });
  });

  it('skips lines without an equals sign', () => {
    const result = parseEnvContent('INVALID_LINE\nVALID=yes');
    expect(result).toEqual({ VALID: 'yes' });
  });
});

describe('loadEnvFile', () => {
  it('loads and parses a valid .env file', () => {
    const filePath = writeTempEnv('APP_ENV=production\nPORT=3000');
    const result = loadEnvFile(filePath);
    expect(result.values).toEqual({ APP_ENV: 'production', PORT: '3000' });
    expect(result.lineCount).toBe(2);
    fs.unlinkSync(filePath);
  });

  it('throws EnvLoadError when file does not exist', () => {
    expect(() => loadEnvFile('/nonexistent/path/.env')).toThrow(EnvLoadError);
  });

  it('returns the resolved absolute file path', () => {
    const filePath = writeTempEnv('X=1');
    const result = loadEnvFile(filePath);
    expect(path.isAbsolute(result.filePath)).toBe(true);
    fs.unlinkSync(filePath);
  });
});
