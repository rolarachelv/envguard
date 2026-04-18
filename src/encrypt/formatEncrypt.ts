import { EncryptResult } from './encryptor';

function renderEntry(key: string, encrypted: string, wasEncrypted: boolean): string {
  const tag = wasEncrypted ? '[encrypted]' : '[skipped]';
  return `  ${key}: ${encrypted} ${tag}`;
}

export function formatEncryptText(result: EncryptResult): string {
  const lines: string[] = ['Encryption Result:', ''];
  for (const entry of result.entries) {
    lines.push(renderEntry(entry.key, entry.encrypted, entry.wasEncrypted));
  }
  const count = result.entries.filter(e => e.wasEncrypted).length;
  lines.push('');
  lines.push(`${count} key(s) encrypted.`);
  return lines.join('\n');
}

export function formatEncryptJson(result: EncryptResult): string {
  const output = result.entries.map(({ key, encrypted, wasEncrypted }) => ({
    key,
    encrypted,
    wasEncrypted,
  }));
  return JSON.stringify(output, null, 2);
}
