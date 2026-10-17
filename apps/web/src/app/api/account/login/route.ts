import { NextResponse } from 'next/server';
import { bad, readJson } from '@/lib/http';
import { prisma } from '@/lib/prisma';
import { hashPassword, verifyPassword } from '@/lib/auth/password';
import { createSession, publicUserSelect } from '@/lib/auth/session';
import { validateLogin } from '@/lib/validation';

const INVALID = 'Email o contraseña incorrectos.';
// Verified when the email does not exist, so both paths cost one scrypt run.
const DUMMY_HASH = hashPassword('dummy-password-for-timing');

/** POST { email, password } → sets the session cookie. Same generic error for unknown email or wrong password. */
export async function POST(req: Request) {
  const body = await readJson(req);
  if (!body) return bad('JSON inválido.');
  const input = validateLogin(body);
  if (!input.ok) return bad(INVALID, 401);
  const found = await prisma.user.findUnique({
    where: { email: input.value.email },
    select: { ...publicUserSelect, passwordHash: true },
  });
  const valid = verifyPassword(input.value.password, found?.passwordHash ?? DUMMY_HASH);
  if (!found || !valid) return bad(INVALID, 401);
  const { passwordHash: _omit, ...user } = found;
  await createSession(user.id);
  return NextResponse.json({ user });
}
