import { test } from 'node:test';
import assert from 'node:assert/strict';
import { validateLogin, validateRegister } from '../src/lib/validation';

test('validateRegister normalizes email and trims name', () => {
  const r = validateRegister({ name: '  Ana  ', email: '  Ana@Mail.COM ', password: '12345678' });
  assert.equal(r.ok, true);
  if (r.ok) {
    assert.equal(r.value.email, 'ana@mail.com');
    assert.equal(r.value.name, 'Ana');
    assert.equal(r.value.phone, null);
    assert.equal(r.value.marketing, false);
  }
});

test('validateRegister rejects missing name, bad email and short password', () => {
  assert.equal(validateRegister({ name: '', email: 'a@b.co', password: '12345678' }).ok, false);
  assert.equal(validateRegister({ name: 'A', email: 'nope', password: '12345678' }).ok, false);
  assert.equal(validateRegister({ name: 'A', email: 'a@b.co', password: '1234567' }).ok, false);
});

test('validateLogin returns a generic error', () => {
  const r = validateLogin({ email: '', password: '' });
  assert.equal(r.ok, false);
  if (!r.ok) assert.equal(r.error, 'Email o contraseña incorrectos.');
});
