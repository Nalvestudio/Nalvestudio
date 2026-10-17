import { NextResponse } from 'next/server';
import { quote, weightKg } from '@nalv/shared';
import { bad, readJson } from '@/lib/http';

/** POST { method, province, singles, planchas, shirts:[{garment,qty}] } → { ok, cost, zone, weightKg } */
export async function POST(req: Request) {
  const b = await readJson(req);
  if (!b) return bad('JSON inválido.');
  const weight = weightKg({
    singles: Math.max(0, Number(b.singles) | 0),
    planchas: Math.max(0, Number(b.planchas) | 0),
    shirts: Array.isArray(b.shirts) ? b.shirts.slice(0, 200) : [],
  });
  const q = quote({ method: String(b.method || ''), province: b.province ? String(b.province) : undefined, weight });
  return NextResponse.json(q, { status: q.ok ? 200 : 400 });
}
