// Pruebas de PARIDAD: el código nuevo (TypeScript) tiene que dar EXACTAMENTE lo mismo que el código actual de la
// tienda (legacy/pricing.js y legacy/shipping.js, copiados sin tocar) con miles de entradas al azar.
// Si algún precio, costo de envío o coordenada de un sticker difiere, este test falla.
import test from 'node:test';
import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
import * as N from '../src/index';

const require = createRequire(import.meta.url);
const L = require('../legacy/pricing.js');
const S = require('../legacy/shipping.js');

// generador pseudoaleatorio con semilla fija (los casos son siempre los mismos)
let seed = 20261016;
const rnd = () => { seed = (seed * 1664525 + 1013904223) >>> 0; return seed / 4294967296; };
const pick = <T,>(a: T[]): T => a[Math.floor(rnd() * a.length)];
const int = (a: number, b: number) => a + Math.floor(rnd() * (b - a + 1));
const flt = (a: number, b: number) => a + rnd() * (b - a);
const same = (a: unknown, b: unknown, msg: string) => assert.deepStrictEqual(JSON.parse(JSON.stringify(a)), JSON.parse(JSON.stringify(b)), msg);
const weird = () => pick<unknown>([undefined, null, '', 'abc', NaN, -3, 0, '7', '12.5', 1e9]);

test('constantes de precios iguales', () => {
  assert.equal(N.SINGLE_PRICE, L.SINGLE_PRICE);
  same(N.SHEET, L.SHEET, 'SHEET');
  same(N.SIZE_GUIDE, L.SIZE_GUIDE, 'SIZE_GUIDE');
  same(N.GARMENTS.map((g) => ({ id: g.id, label: g.label, geometry: g.geometry, prices: g.prices, sizes: g.sizes })), L.GARMENTS.map((g: any) => ({ id: g.id, label: g.label, geometry: g.geometry, prices: g.prices, sizes: g.sizes })), 'GARMENTS');
  same(N.SHIRT_COLORS, L.SHIRT_COLORS, 'SHIRT_COLORS');
  same(N.PROVINCES, S.PROVINCES, 'PROVINCES');
  same(N.METHODS, S.METHODS, 'METHODS');
});

test('calcOrder (stickers sueltos): 3000 pedidos al azar', () => {
  for (let i = 0; i < 3000; i++) {
    const items = Array.from({ length: int(1, 6) }, () => ({ sizeCm: rnd() < 0.15 ? weird() : flt(0, 25), qty: rnd() < 0.15 ? weird() : int(0, 300) }));
    same(N.calcOrder(items), L.calcOrder(items), 'calcOrder ' + JSON.stringify(items));
  }
});

test('calcShirts y quoteGarment (prendas, escalones): 3000 pedidos al azar', () => {
  for (let i = 0; i < 3000; i++) {
    const items = Array.from({ length: int(1, 5) }, () => {
      const g = pick(N.GARMENTS);
      return {
        garment: rnd() < 0.1 ? 'inexistente' : g.id,
        size: rnd() < 0.15 ? weird() : pick(g.sizes).id,
        colorId: rnd() < 0.1 ? 'raro' : pick(N.SHIRT_COLORS).id,
        print: pick(['front', 'both', 'x', undefined]) as string | undefined,
        qty: rnd() < 0.1 ? weird() : int(0, 40),
      };
    });
    same(N.calcShirts(items), L.calcShirts(items), 'calcShirts ' + JSON.stringify(items));
    const gid = pick(N.GARMENTS).id, q = int(0, 30), o = int(0, 30);
    same(N.quoteGarment(gid, q, o), L.quoteGarment(gid, q, o), 'quoteGarment');
  }
});

test('envíos: peso y tarifa de todas las provincias y métodos', () => {
  for (let i = 0; i < 4000; i++) {
    const shirts = Array.from({ length: int(0, 4) }, () => ({ garment: rnd() < 0.1 ? 'x' : pick(N.GARMENTS).id, qty: int(0, 12) }));
    const o = { singles: int(0, 60), planchas: int(0, 8), shirts };
    const w = N.weightKg(o);
    assert.equal(w, S.weightKg(o));
    const weight = rnd() < 0.5 ? w : flt(0.1, 35);
    const method = pick(['retiro', 'correo_domicilio', 'correo_sucursal', 'otro']);
    const province = rnd() < 0.1 ? 'nada' : pick(N.PROVINCES).id;
    const adj = pick([0, 0, 10, -15, 3.5]);
    process.env.SHIPPING_ADJUST_PCT = String(adj);
    same(N.quote({ method, province, weight, adjustPct: adj }), S.quote({ method, province, weight }), `quote ${method} ${province} ${weight} adj ${adj}`);
  }
  delete process.env.SHIPPING_ADJUST_PCT;
});

test('packSheet (MaxRects): 2500 planchas al azar, coordenada por coordenada', () => {
  for (let i = 0; i < 2500; i++) {
    const items = Array.from({ length: int(1, 12) }, () => ({
      sizeCm: rnd() < 0.1 ? weird() : flt(0.5, 40),
      aspect: rnd() < 0.2 ? weird() : flt(0.05, 12),
      qty: rnd() < 0.1 ? weird() : int(1, 70),
    }));
    same(N.packSheet(items), L.packSheet(items), 'packSheet ' + JSON.stringify(items));
  }
});

test('casos conocidos', () => {
  assert.equal(N.packSheet([{ sizeCm: 5, aspect: 1, qty: 1 }]).price, 18000);
  assert.equal(N.packSheet([]).planchas, 0);
  assert.equal(N.calcOrder([{ sizeCm: 5, qty: 10 }]).total, 8000);
  assert.equal(N.calcShirts([{ garment: 'remera_basica', size: 'M', colorId: 'blanco', print: 'front', qty: 1 }]).total, 17000);
  assert.equal(N.quote({ method: 'retiro', weight: 1 }).ok, true);
});
