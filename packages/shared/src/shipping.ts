// shipping.ts — envíos a todo el país con tarifa estimada de Correo Argentino (Clásico). Port 1:1 de shipping.js.
// ⚠️ Son tarifas de referencia: si tenés convenio (Paq.ar / Mi Correo Emprendedores) las tuyas son más bajas.
// Para ajustarlas: editá TARIFAS en data.ts, o pasá `adjustPct` (ej. -15 = 15% menos).
import {
  METHODS, PESO_EMBALAJE, PESO_PLANCHA, PESO_PRENDA, PESO_STICKER_SUELTO, PROVINCES, RATIO_SUCURSAL, TARIFAS,
  type DeliveryMethod,
} from './data';

export function weightKg(o: { singles?: number; planchas?: number; shirts?: { garment: string; qty: number }[] }): number {
  const { singles = 0, planchas = 0, shirts = [] } = o;
  const prendas = shirts.reduce((a, s) => a + (PESO_PRENDA[s.garment] || 0.25) * Math.max(1, s.qty | 0), 0);
  const w = prendas + planchas * PESO_PLANCHA + singles * PESO_STICKER_SUELTO + PESO_EMBALAJE;
  return Math.round(w * 100) / 100;
}

function interpolate(points: [number, number][], kg: number): number {
  const w = Math.max(points[0][0], kg); // por debajo de 1 kg se cobra 1 kg
  for (let i = 0; i < points.length - 1; i++) {
    const [w0, p0] = points[i], [w1, p1] = points[i + 1];
    if (w <= w1) return p0 + ((p1 - p0) * (w - w0)) / (w1 - w0);
  }
  const [w0, p0] = points[points.length - 2], [w1, p1] = points[points.length - 1];
  return p1 + ((p1 - p0) / (w1 - w0)) * (w - w1); // más de 10 kg: sigue la misma pendiente
}

export type ShippingQuote =
  | { ok: true; cost: number; zone: number | null; weightKg: number }
  | { ok: false; error: string };

export function quote(o: { method: string; province?: string; weight: number; adjustPct?: number }): ShippingQuote {
  const { method, province, weight } = o;
  if (method === 'retiro') return { ok: true, cost: 0, zone: null, weightKg: weight };
  const prov = PROVINCES.find((p) => p.id === province);
  if (!prov || !(method in METHODS)) return { ok: false, error: 'Elegí la provincia de destino.' };
  let cost = interpolate(TARIFAS[prov.zone], weight);
  if ((method as DeliveryMethod) === 'correo_sucursal') cost *= RATIO_SUCURSAL[prov.zone];
  const adj = Number(o.adjustPct) || 0;
  cost = cost * (1 + adj / 100);
  cost = Math.max(0, Math.ceil(cost / 100) * 100); // redondeo hacia arriba a $100
  return { ok: true, cost, zone: prov.zone, weightKg: weight };
}
