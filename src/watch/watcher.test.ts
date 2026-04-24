import * as fs from 'fs';
import * as os from 'os';
import * as path from 'path';
import { watchEnv, debounce, WatchEvent } from './watcher';

function writeTempEnv(content: string): string {
  const file = path.join(os.tmpdir(), `watch-test-${Date.now()}.env`);
  fs.writeFileSync(file, content, 'utf-8');
  return file;
}

function writeTempSchema(content: string): string {
  const file = path.join(os.tmpdir(), `watch-schema-${Date.now()}.json`);
  fs.writeFileSync(file, content, 'utf-8');
  return file;
}

describe('debounce', () => {
  it('calls function after delay', (done) => {
    let count = 0;
    const fn = debounce(() => { count++; }, 50);
    fn();
    fn();
    fn();
    setTimeout(() => {
      expect(count).toBe(1);
      done();
    }, 150);
  });
});

describe('watchEnv', () => {
  it('emits a change event when env file is modified', (done) => {
    const schema = writeTempSchema(JSON.stringify([
      { key: 'PORT', type: 'number', required: true }
    ]));
    const envFile = writeTempEnv('PORT=3000\n');

    const events: WatchEvent[] = [];
    const stop = watchEnv(
      { envPath: envFile, schemaPath: schema, format: 'text', debounceMs: 50 },
      (event) => {
        events.push(event);
        stop();
        expect(event.type).toBe('change');
        expect(event.filePath).toBe(envFile);
        fs.unlinkSync(envFile);
        fs.unlinkSync(schema);
        done();
      }
    );

    setTimeout(() => {
      fs.writeFileSync(envFile, 'PORT=4000\n', 'utf-8');
    }, 60);
  }, 3000);

  it('returns a stop function that closes the watcher', () => {
    const schema = writeTempSchema(JSON.stringify([]));
    const envFile = writeTempEnv('');
    const stop = watchEnv(
      { envPath: envFile, schemaPath: schema, format: 'text' },
      () => {}
    );
    expect(() => stop()).not.toThrow();
    fs.unlinkSync(envFile);
    fs.unlinkSync(schema);
  });
});
