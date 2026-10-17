import crypto from 'node:crypto';

/**
 * Password hashing compatible with the legacy store format: "s1$<saltHex>$<hashHex>",
 * scrypt with default params (N=16384, r=8, p=1), 16-byte salt and 64-byte key.
 * Kept free of Next.js imports so it can be unit-tested with plain `tsx --test`.
 */
const VERSION = 's1';
const SALT_BYTES = 16;
const KEY_BYTES = 64;
const HEX = /^[0-9a-f]+$/i;

export function hashPassword(password: string): string {
  const salt = crypto.randomBytes(SALT_BYTES);
  const key = crypto.scryptSync(password, salt, KEY_BYTES);
  return `${VERSION}$${salt.toString('hex')}$${key.toString('hex')}`;
}

export function verifyPassword(password: string, stored: string): boolean {
  const [version, saltHex, hashHex, ...rest] = String(stored || '').split('$');
  if (version !== VERSION || rest.length || !saltHex || !hashHex) return false;
  if (!HEX.test(saltHex) || !HEX.test(hashHex) || hashHex.length !== KEY_BYTES * 2) return false;
  try {
    const expected = Buffer.from(hashHex, 'hex');
    const actual = crypto.scryptSync(password, Buffer.from(saltHex, 'hex'), KEY_BYTES);
    return actual.length === expected.length && crypto.timingSafeEqual(actual, expected);
  } catch {
    return false;
  }
}
