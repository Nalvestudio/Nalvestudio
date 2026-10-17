import { NextResponse } from 'next/server';
import { Prisma } from '@prisma/client';
import { bad, readJson } from '@/lib/http';
import { prisma } from '@/lib/prisma';
import { hashPassword } from '@/lib/auth/password';
import { createSession, publicUserSelect } from '@/lib/auth/session';
import { validateRegister } from '@/lib/validation';

const DUPLICATE = 'Ya existe una cuenta con ese email. Probá ingresar.';

/** POST { name, email, password, phone?, marketing? } → creates the account and logs it in. */
export async function POST(req: Request) {
  const body = await readJson(req);
  if (!body) return bad('JSON inválido.');
  const input = validateRegister(body);
  if (!input.ok) return bad(input.error);
  const { password, ...data } = input.value;
  try {
    const user = await prisma.user.create({
      data: { ...data, passwordHash: hashPassword(password) },
      select: publicUserSelect,
    });
    await createSession(user.id);
    return NextResponse.json({ user }, { status: 201 });
  } catch (e) {
    if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === 'P2002') return bad(DUPLICATE, 409);
    throw e;
  }
}
