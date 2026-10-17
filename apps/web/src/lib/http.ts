import { NextResponse } from 'next/server';

export async function readJson(req: Request): Promise<Record<string, any> | null> {
  try { const b = await req.json(); return b && typeof b === 'object' ? b : null; } catch { return null; }
}
export const bad = (error: string, status = 400) => NextResponse.json({ error }, { status });
