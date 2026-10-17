/** Input validation for account forms. Pure functions (no Next.js imports) so they stay unit-testable. */

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export const normalizeEmail = (v: unknown): string => (typeof v === 'string' ? v.trim().toLowerCase() : '');

type Ok<T> = { ok: true; value: T };
type Err = { ok: false; error: string };

export type RegisterInput = { name: string; email: string; password: string; phone: string | null; marketing: boolean };
export type LoginInput = { email: string; password: string };

export function validateRegister(body: Record<string, unknown>): Ok<RegisterInput> | Err {
  const name = typeof body.name === 'string' ? body.name.trim() : '';
  const email = normalizeEmail(body.email);
  const password = typeof body.password === 'string' ? body.password : '';
  const phoneRaw = typeof body.phone === 'string' ? body.phone.trim() : '';
  if (name.length < 1 || name.length > 120) return { ok: false, error: 'Ingresá tu nombre (hasta 120 caracteres).' };
  if (email.length > 190 || !EMAIL_RE.test(email)) return { ok: false, error: 'Ingresá un email válido.' };
  if (password.length < 8) return { ok: false, error: 'La contraseña debe tener al menos 8 caracteres.' };
  if (password.length > 200) return { ok: false, error: 'La contraseña es demasiado larga.' };
  if (phoneRaw.length > 40) return { ok: false, error: 'El teléfono es demasiado largo.' };
  return { ok: true, value: { name, email, password, phone: phoneRaw || null, marketing: body.marketing === true } };
}

export function validateLogin(body: Record<string, unknown>): Ok<LoginInput> | Err {
  const email = normalizeEmail(body.email);
  const password = typeof body.password === 'string' ? body.password : '';
  if (!email || !password || email.length > 190 || password.length > 200) {
    return { ok: false, error: 'Email o contraseña incorrectos.' };
  }
  return { ok: true, value: { email, password } };
}
