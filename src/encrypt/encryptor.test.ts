import { encryptValue, decryptValue, encryptEnv } from './encryptor';

describe('encryptValue / decryptValue', () => {
  const secret = 'test-secret';

  it('encrypts and decrypts a value round-trip', () => {
    const original = 'my-secret-value';
    const encrypted = encryptValue(original, secret);
    expect(encrypted).not.toBe(original);
    const decrypted = decryptValue(encrypted, secret);
    expect(decrypted).toBe(original);
  });

  it('produces different ciphertext each call (random IV)', () => {
    const a = encryptValue('hello', secret);
    const b = encryptValue('hello', secret);
    expect(a).not.toBe(b);
  });
});

describe('encryptEnv', () => {
  const secret = 'mysecret';
  const env = { DB_PASS: 'hunter2', API_KEY: 'abc123', NODE_ENV: 'production' };

  it('encrypts all keys by default', () => {
    const result = encryptEnv(env, secret);
    expect(result.entries).toHaveLength(3);
    result.entries.forEach(e => expect(e.wasEncrypted).toBe(true));
  });

  it('encrypts only specified keys', () => {
    const result = encryptEnv(env, secret, { keys: ['DB_PASS'] });
    const db = result.entries.find(e => e.key === 'DB_PASS')!;
    const node = result.entries.find(e => e.key === 'NODE_ENV')!;
    expect(db.wasEncrypted).toBe(true);
    expect(node.wasEncrypted).toBe(false);
    expect(node.encrypted).toBe('production');
  });

  it('stores original values', () => {
    const result = encryptEnv(env, secret, { keys: ['API_KEY'] });
    const api = result.entries.find(e => e.key === 'API_KEY')!;
    expect(api.original).toBe('abc123');
  });
});
