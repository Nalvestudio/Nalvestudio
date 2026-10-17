import { NextResponse } from 'next/server';
import { getSessionUser } from '@/lib/auth/session';

export const dynamic = 'force-dynamic';

/** GET → { user } for the current session, or 401 { user: null }. */
export async function GET() {
  const user = await getSessionUser();
  return NextResponse.json({ user }, { status: user ? 200 : 401 });
}
