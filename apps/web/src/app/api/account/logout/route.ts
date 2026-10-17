import { NextResponse } from 'next/server';
import { destroySession } from '@/lib/auth/session';

/** POST → deletes the current session and clears the cookie. */
export async function POST() {
  await destroySession();
  return NextResponse.json({ ok: true });
}
