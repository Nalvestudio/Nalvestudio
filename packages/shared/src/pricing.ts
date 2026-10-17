// pricing.ts — única fuente de verdad de los precios. La API SIEMPRE recalcula con esto al crear un pedido;
// lo que manda el navegador solo sirve para mostrar el precio en vivo. Port 1:1 de pricing.js (tienda actual).
import {
  GARMENTS, MAX_CM, MIN_CM, PRINT_LABELS, SHIRT_COLORS, SINGLE_PRICE, TIERS,
  type Garment, type PrintMode, type ShirtColor, type Size,
} from './data';

export function clampSize(sizeCm: unknown): number {
  const n = Number(sizeCm);
  if (Number.isNaN(n)) return 5;
  return Math.min(MAX_CM, Math.max(MIN_CM, n));
}
export const unitPriceForSize = (_sizeCm?: number) => SINGLE_PRICE;
/** Sin descuentos por cantidad en sueltos (queda por si algún día se vuelve a usar). */
export const discountForQty = (_qty?: number) => 0;

export interface SingleLine { sizeCm: number; qty: number; unitPrice: number; subtotal: number; total: number }
export function calcOrder(items: { sizeCm: unknown; qty?: unknown }[]) {
  const totalQty = items.reduce((acc, it) => acc + Math.max(1, parseInt(String(it.qty), 10) || 1), 0);
  const discount = discountForQty(totalQty);
  const lines: SingleLine[] = items.map((it) => {
    const size = clampSize(it.sizeCm);
    const qty = Math.max(1, parseInt(String(it.qty), 10) || 1);
    const unit = unitPriceForSize(size);
    const lineSubtotal = unit * qty;
    const lineTotal = Math.round((lineSubtotal * (1 - discount)) / 10) * 10;
    return { sizeCm: size, qty, unitPrice: unit, subtotal: lineSubtotal, total: lineTotal };
  });
  const total = lines.reduce((acc, l) => acc + l.total, 0);
  return { lines, totalQty, discount, total };
}

// ---------------- Prendas ----------------
export function tierIndex(qty: number): number {
  let idx = 0;
  TIERS.forEach((t, i) => { if (qty >= t.min) idx = i; });
  return idx;
}
/** printedQty: total de prendas del pedido (todas llevan estampa; define el escalón). */
export function garmentUnitPrice(garment: Garment, print: PrintMode, printedQty: number): number {
  const t = tierIndex(Math.max(1, printedQty));
  return print === 'both' ? garment.prices.both[t] : garment.prices.front[t];
}

export interface ShirtInput { garment?: string; size?: unknown; colorId?: string; print?: string; qty?: unknown }
function sanitizeGarmentItem(it: ShirtInput) {
  const garment = GARMENTS.find((g) => g.id === it.garment) || GARMENTS[0];
  const size: Size = garment.sizes.find((s) => s.id === String(it.size)) || garment.sizes[Math.floor(garment.sizes.length / 2)];
  const color: ShirtColor = SHIRT_COLORS.find((c) => c.id === it.colorId) || SHIRT_COLORS[0];
  const print: PrintMode = it.print === 'both' ? 'both' : 'front';
  const qty = Math.max(1, Math.min(500, parseInt(String(it.qty), 10) || 1));
  return { garment, size, color, print, qty };
}

export interface ShirtLine {
  garment: string; garmentLabel: string; size: string; colorId: string; colorLabel: string; colorHex: string;
  print: PrintMode; printLabel: string; qty: number; unitPrice: number; total: number;
}
export function calcShirts(items: ShirtInput[]) {
  const clean = items.map(sanitizeGarmentItem);
  const printedQty = clean.reduce((a, c) => a + c.qty, 0);
  const lines: ShirtLine[] = clean.map((c) => {
    const unit = garmentUnitPrice(c.garment, c.print, printedQty);
    return {
      garment: c.garment.id, garmentLabel: c.garment.label,
      size: c.size.id, colorId: c.color.id, colorLabel: c.color.label, colorHex: c.color.hex,
      print: c.print, printLabel: PRINT_LABELS[c.print],
      qty: c.qty, unitPrice: unit, total: unit * c.qty,
    };
  });
  return { lines, printedQty, total: lines.reduce((a, l) => a + l.total, 0) };
}

/** Precios unitarios de las opciones de estampa + tabla de escalones (para el diseñador de prendas). */
export function quoteGarment(garmentId: string, qty: unknown, otherPrinted: unknown) {
  const garment = GARMENTS.find((g) => g.id === garmentId) || GARMENTS[0];
  const q = Math.max(1, parseInt(String(qty), 10) || 1);
  const other = Math.max(0, parseInt(String(otherPrinted), 10) || 0);
  return {
    unit: { front: garmentUnitPrice(garment, 'front', other + q), both: garmentUnitPrice(garment, 'both', other + q) },
    tiers: TIERS.map((t, i) => ({ label: t.label, name: t.name, min: t.min, front: garment.prices.front[i], both: garment.prices.both[i] })),
    activeTier: tierIndex(other + q),
    backExtra: garment.prices.both[0] - garment.prices.front[0],
  };
}
