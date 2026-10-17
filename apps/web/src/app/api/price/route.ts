import { NextResponse } from 'next/server';
import { calcOrder, calcShirts, quoteGarment } from '@nalv/shared';
import { bad, readJson } from '@/lib/http';

/** POST { stickers?: [{sizeCm, qty}], shirts?: [{garment,size,colorId,print,qty}] } → totales (mismos precios que la tienda actual). */
export async function POST(req: Request) {
  const body = await readJson(req);
  if (!body) return bad('JSON inválido.');
  const stickers = Array.isArray(body.stickers) ? body.stickers.slice(0, 200) : [];
  const shirts = Array.isArray(body.shirts) ? body.shirts.slice(0, 200) : [];
  const s = calcOrder(stickers);
  const p = calcShirts(shirts);
  return NextResponse.json({ stickers: s, shirts: p, total: s.total + p.total });
}

/** GET ?garment=remera_basica&qty=3&other=0 → precios por escalón de una prenda. */
export async function GET(req: Request) {
  const u = new URL(req.url);
  return NextResponse.json(quoteGarment(u.searchParams.get('garment') || '', u.searchParams.get('qty'), u.searchParams.get('other')));
}
