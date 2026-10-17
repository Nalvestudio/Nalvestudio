// nesting.ts — acomodo automático de stickers en la plancha de 58 × 50 cm (MaxRects, "best short side fit").
// Port 1:1 de packSheet() de la tienda actual: ubica cada sticker (rectángulo ancho × alto) en el mejor
// hueco libre de la plancha, de mayor a menor área. Si no entra, abre otra plancha. NO rota los stickers.
// Todas las medidas en cm. Función pura: mismas entradas → mismas coordenadas, siempre.
import { MIN_CM, SHEET } from './data';

export interface SheetItemInput { sizeCm: unknown; aspect?: unknown; qty?: unknown; [k: string]: unknown }
export interface Placement { itemIndex: number; w: number; h: number; x: number; y: number; plancha: number; fits: boolean }
export interface PackResult {
  fits: boolean; widthCm: number; lengthCm: number; gapCm: number;
  planchas: number; price: number; usedLengthCm: number; fillPct: number;
  placements: Placement[]; totalUnits: number; overflowCount: number;
}

export function clampSheetSize(sizeCm: unknown): number {
  const n = Number(sizeCm);
  if (Number.isNaN(n)) return 5;
  return Math.min(SHEET.maxStickerCm, Math.max(MIN_CM, n));
}

/** Medidas reales (ancho, alto) de un sticker de la plancha; se achica manteniendo proporción si pasa el máximo. */
export function stickerDims(it: { sizeCm: unknown; aspect?: unknown }): { w: number; h: number } {
  const w0 = clampSheetSize(it.sizeCm);
  let aspect = Number(it.aspect);
  if (!(aspect > 0)) aspect = 1;
  aspect = Math.min(10, Math.max(0.1, aspect));
  let w = Math.round(w0 * 10) / 10, h = Math.round(w * aspect * 10) / 10;
  const maxSide = SHEET.maxStickerCm;
  if (h > maxSide) { w = Math.round((w * maxSide / h) * 10) / 10; h = maxSide; }
  if (w < 1) w = 1;
  return { w, h };
}

interface Rect { x: number; y: number; w: number; h: number }
interface Page { free: Rect[]; used: number; area: number }
const EPS = 1e-6;

export function packSheet(items: SheetItemInput[]): PackResult {
  const { widthCm, lengthCm, gapCm } = SHEET;
  const binW = widthCm - gapCm, binH = lengthCm - gapCm; // cada sticker se "infla" con 1 gap

  const units: { itemIndex: number; w: number; h: number }[] = [];
  items.forEach((it, itemIndex) => {
    const { w, h } = stickerDims(it);
    const qty = Math.max(1, Math.min(500, parseInt(String(it.qty), 10) || 1));
    for (let i = 0; i < qty; i++) units.push({ itemIndex, w, h });
  });
  units.sort((a, b) => b.h * b.w - a.h * a.w || b.h - a.h);

  const pages: Page[] = [];
  const newPage = (): Page => { const pg: Page = { free: [{ x: 0, y: 0, w: binW, h: binH }], used: 0, area: 0 }; pages.push(pg); return pg; };
  const placements: Placement[] = [];

  function tryPlace(pg: Page, w: number, h: number) {
    let best: { x: number; y: number; short: number; long: number } | null = null;
    for (const r of pg.free) {
      if (w <= r.w + EPS && h <= r.h + EPS) {
        const short = Math.min(r.w - w, r.h - h), long = Math.max(r.w - w, r.h - h);
        if (!best || short < best.short - EPS || (Math.abs(short - best.short) < EPS && long < best.long)) best = { x: r.x, y: r.y, short, long };
      }
    }
    return best;
  }
  function splitFree(pg: Page, px: number, py: number, pw: number, ph: number) {
    const next: Rect[] = [];
    for (const r of pg.free) {
      if (px >= r.x + r.w - EPS || px + pw <= r.x + EPS || py >= r.y + r.h - EPS || py + ph <= r.y + EPS) { next.push(r); continue; }
      if (px > r.x + EPS) next.push({ x: r.x, y: r.y, w: px - r.x, h: r.h });
      if (px + pw < r.x + r.w - EPS) next.push({ x: px + pw, y: r.y, w: r.x + r.w - (px + pw), h: r.h });
      if (py > r.y + EPS) next.push({ x: r.x, y: r.y, w: r.w, h: py - r.y });
      if (py + ph < r.y + r.h - EPS) next.push({ x: r.x, y: py + ph, w: r.w, h: r.y + r.h - (py + ph) });
    }
    // descartamos huecos contenidos en otros
    pg.free = next.filter((a, i) => !next.some((b, j) => i !== j && a.x >= b.x - EPS && a.y >= b.y - EPS && a.x + a.w <= b.x + b.w + EPS && a.y + a.h <= b.y + b.h + EPS && (i > j || a.w < b.w - EPS || a.h < b.h - EPS)));
  }

  for (const u of units) {
    const iw = u.w + gapCm, ih = u.h + gapCm;
    let pageIdx = -1, spot: ReturnType<typeof tryPlace> = null;
    for (let i = 0; i < pages.length && !spot; i++) { spot = tryPlace(pages[i], iw, ih); if (spot) pageIdx = i; }
    if (!spot) { const pg = newPage(); spot = tryPlace(pg, iw, ih); pageIdx = pages.length - 1; }
    const pg = pages[pageIdx];
    splitFree(pg, spot!.x, spot!.y, iw, ih);
    const x = Math.round((spot!.x + gapCm) * 100) / 100, y = Math.round((spot!.y + gapCm) * 100) / 100;
    pg.used = Math.max(pg.used, y + u.h + gapCm);
    pg.area += u.w * u.h;
    placements.push({ itemIndex: u.itemIndex, w: u.w, h: u.h, x, y, plancha: pageIdx, fits: true });
  }

  const planchas = units.length ? pages.length : 0;
  const totalArea = pages.reduce((a, pg) => a + pg.area, 0);
  const lastUsed = planchas ? pages[planchas - 1].used : 0;
  return {
    fits: planchas > 0,
    widthCm, lengthCm, gapCm,
    planchas,
    price: planchas * SHEET.price,
    usedLengthCm: Math.round(Math.min(lengthCm, lastUsed) * 10) / 10,
    fillPct: planchas ? Math.round((totalArea / (planchas * widthCm * lengthCm)) * 100) : 0,
    placements,
    totalUnits: units.length,
    overflowCount: 0,
  };
}
