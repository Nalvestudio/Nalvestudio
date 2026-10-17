import { test } from 'node:test';
import assert from 'node:assert/strict';
import crypto from 'node:crypto';
import { hashPassword, verifyPassword } from '../src/lib/auth/password';

// Reference implementation copied from the legacy store (sticker-shop/extras.js hashPw).
function legacyHash(pw: string): string {
  const salt = crypto.randomBytes(16);
  return 's1$' + salt.toString('hex') + '$' + crypto.scryptSync(String(pw), salt, 64).toString('hex');
}

test('hashPassword produces the legacy s1$salt$hash format', () => {
  const h = hashPassword('secreto123');
  assert.match(h, /^s1\$[0-9a-f]{32}\$[0-9a-f]{128}$/);
  assert.notEqual(hashPassword('secreto123'), h, 'salt must be random');
});

test('verifyPassword accepts the right password and rejects a wrong one', () => {
  const h = hashPassword('secreto123');
  assert.equal(verifyPassword('secreto123', h), true);
  assert.equal(verifyPassword('secreto124', h), false);
});

test('verifyPassword accepts hashes produced by the legacy algorithm', () => {
  const h = legacyHash('contraseña-vieja');
  assert.equal(verifyPassword('contraseña-vieja', h), true);
  assert.equal(verifyPassword('otra', h), false);
});

test('verifyPassword rejects malformed or unknown-format hashes', () => {
  for (const bad of ['', 'garbage', 's2$00$00', 's1$zz$zz', 's1$abcd', 's1$abcd$', '$$']) {
    assert.equal(verifyPassword('x', bad), false, bad);
  }
});
