import { NextResponse } from 'next/server';
import { packSheet } from '@nalv/shared';
import { bad, readJson } from '@/lib/http';

/** POST { items: [{sizeCm, aspect?, qty}] } → acomodo MaxRects en planchas de 58×50 cm (separación 0,5 cm). */
export async function POST(req: Request) {
  const b = await readJson(req);
  if (!b || !Array.isArray(b.items)) return bad('Falta "items".');
  if (b.items.length > 300) return bad('Demasiados diseños en una plancha.');
  return NextResponse.json(packSheet(b.items));
}
