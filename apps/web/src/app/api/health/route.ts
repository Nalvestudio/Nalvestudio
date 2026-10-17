import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

/** GET /api/health → { ok, db } (db solo si ?db=1, para no depender de MySQL en el chequeo básico). */
export async function GET(req: Request) {
  const out: { ok: boolean; db?: string } = { ok: true };
  if (new URL(req.url).searchParams.get('db')) {
    try {
      const { prisma } = await import('@/lib/prisma');
      await prisma.$queryRaw`SELECT 1`;
      out.db = 'ok';
    } catch (e) { out.ok = false; out.db = 'error'; }
  }
  return NextResponse.json(out, { status: out.ok ? 200 : 503 });
}
