import * as crypto from 'crypto';

export interface EncryptOptions {
  algorithm?: string;
  keys?: string[];
}

export interface EncryptedEntry {
  key: string;
  original: string;
  encrypted: string;
  wasEncrypted: boolean;
}

export interface EncryptResult {
  entries: EncryptedEntry[];
}

const DEFAULT_ALGORITHM = 'aes-256-cbc';

export function encryptValue(value: string, secret: string, algorithm = DEFAULT_ALGORITHM): string {
  const key = crypto.scryptSync(secret, 'salt', 32);
  const iv = crypto.randomBytes(16);
  const cipher = crypto.createCipheriv(algorithm, key, iv);
  const encrypted = Buffer.concat([cipher.update(value, 'utf8'), cipher.final()]);
  return iv.toString('hex') + ':' + encrypted.toString('hex');
}

export function decryptValue(value: string, secret: string, algorithm = DEFAULT_ALGORITHM): string {
  const [ivHex, encHex] = value.split(':');
  const key = crypto.scryptSync(secret, 'salt', 32);
  const iv = Buffer.from(ivHex, 'hex');
  const decipher = crypto.createDecipheriv(algorithm, key, iv);
  const decrypted = Buffer.concat([decipher.update(Buffer.from(encHex, 'hex')), decipher.final()]);
  return decrypted.toString('utf8');
}

export function encryptEnv(
  env: Record<string, string>,
  secret: string,
  options: EncryptOptions = {}
): EncryptResult {
  const { keys } = options;
  const entries: EncryptedEntry[] = Object.entries(env).map(([key, original]) => {
    const shouldEncrypt = !keys || keys.includes(key);
    const encrypted = shouldEncrypt ? encryptValue(original, secret) : original;
    return { key, original, encrypted, wasEncrypted: shouldEncrypt };
  });
  return { entries };
}
