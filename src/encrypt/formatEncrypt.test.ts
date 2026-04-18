import { formatEncryptText, formatEncryptJson } from './formatEncrypt';
import { EncryptResult } from './encryptor';

const mockResult: EncryptResult = {
  entries: [
    { key: 'DB_PASS', original: 'secret', encrypted: 'abc:def', wasEncrypted: true },
    { key: 'NODE_ENV', original: 'production', encrypted: 'production', wasEncrypted: false },
  ],
};

describe('formatEncryptText', () => {
  it('includes header', () => {
    const out = formatEncryptText(mockResult);
    expect(out).toContain('Encryption Result');
  });

  it('marks encrypted keys', () => {
    const out = formatEncryptText(mockResult);
    expect(out).toContain('[encrypted]');
    expect(out).toContain('DB_PASS');
  });

  it('marks skipped keys', () => {
    const out = formatEncryptText(mockResult);
    expect(out).toContain('[skipped]');
    expect(out).toContain('NODE_ENV');
  });

  it('shows count of encrypted keys', () => {
    const out = formatEncryptText(mockResult);
    expect(out).toContain('1 key(s) encrypted');
  });
});

describe('formatEncryptJson', () => {
  it('returns valid JSON array', () => {
    const out = formatEncryptJson(mockResult);
    const parsed = JSON.parse(out);
    expect(Array.isArray(parsed)).toBe(true);
    expect(parsed).toHaveLength(2);
  });

  it('includes wasEncrypted field', () => {
    const out = formatEncryptJson(mockResult);
    const parsed = JSON.parse(out);
    expect(parsed[0].wasEncrypted).toBe(true);
    expect(parsed[1].wasEncrypted).toBe(false);
  });
});
