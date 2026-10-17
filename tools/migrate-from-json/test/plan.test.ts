import { test } from 'node:test';
import assert from 'node:assert/strict';
import { buildPlan, toKey } from '../plan';

const shop = {
  users: [{ id: 1, name: 'Ana', email: 'ANA@test.com', phone: '1', pass: 's1$a$b', marketing: true, ship: {}, created_at: '2026-10-01T00:00:00Z' }],
  orders: [
    { id: 1, order_code: 'NALV-0001', customer_name: 'A', customer_phone: '1', delivery_method: 'correo_domicilio', shipping_cost: 3000, discount: 500, total: 20500,
      status: 'pagado', created_at: '2026-10-02T10:00:00Z', user_id: 1,
      history: [{ status: 'pendiente_pago', at: '2026-10-02T10:00:00Z' }, { status: 'pagado', at: '2026-10-03T10:00:00Z' }],
      items: [{ id: 1, size_cm: 5, qty: 2, unit_price: 800, line_total: 1600, image_path: '/uploads/a_print.png', image_thumb: '/uploads/a_thumb.webp' }],
      sheets: [{ id: 1, price: 18000, planchas: 1, width_cm: 58, length_cm: 50, used_length_cm: 20, items: [{ id: 2, sheet_id: 1, size_cm: 4, h_cm: 6, qty: 3, image_path: '/uploads/b_print.png' }] }],
      shirts: [{ id: 3, garment_id: 'remera_basica', garment_label: 'R', size: 'M', color_id: 'blanco', color_label: 'B', color_hex: '#fff', print: 'front', print_label: 'F', qty: 1, unit_price: 0, line_total: 0 }],
      packs: [] },
    { id: 2, order_code: 'NALV-0002', customer_name: 'B', customer_phone: '2', delivery_method: 'raro', total: 999, discount: 0, shipping_cost: 0,
      status: 'inventado', created_at: 'no-es-fecha', user_id: 77, items: [], sheets: [], shirts: [] },
  ],
  gallery: [{ id: 9, title: 'x', file: 'x.png', thumb: 'x_t.webp', created_at: '2026-10-01T00:00:00Z' }],
  contacts: { 'm:a@b.com': { name: 'A', email: 'a@b.com', marketing: true, marketing_at: '2026-10-01T00:00:00Z', created_at: '2026-10-01T00:00:00Z' } },
  optouts: ['X@Y.com'],
  expenses: [{ id: 1, date: '2026-10-05', concept: 'Vinilo', category: 'M', amount: 25000, created_at: '2026-10-05T00:00:00Z' }],
  campaigns: [], pending: [{ id: 1 }],
};

test('conserva ids, códigos y claves de archivo', () => {
  const p = buildPlan(shop);
  assert.deepEqual(p.orders.map((o) => o.code), ['NALV-0001', 'NALV-0002']);
  assert.equal(p.items.length, 2);
  assert.equal(p.items.find((i) => i.id === 2)!.sheetId, 1);
  assert.equal(p.items.find((i) => i.id === 2)!.heightCm, 6);
  assert.equal(p.items.find((i) => i.id === 1)!.sheetId, null);
  assert.ok(p.fileKeys.includes('uploads/a_print.png') && p.fileKeys.includes('galeria/x_t.webp'));
  assert.equal(p.users[0].email, 'ana@test.com');
  assert.equal(p.optouts[0].email, 'x@y.com');
});

test('historial: usa el existente o crea uno inicial', () => {
  const p = buildPlan(shop);
  assert.equal(p.statusEvents.filter((e) => e.orderId === 1).length, 2);
  assert.equal(p.statusEvents.filter((e) => e.orderId === 2).length, 1);
});

test('datos raros no rompen y quedan avisados', () => {
  const p = buildPlan(shop);
  const o2 = p.orders[1];
  assert.equal(o2.status, 'pendiente_pago');
  assert.equal(o2.deliveryMethod, 'retiro');
  assert.equal(o2.userId, null);
  assert.ok(p.warnings.some((w) => w.includes('estado desconocido')));
  assert.ok(p.warnings.some((w) => w.includes('user_id 77')));
  assert.ok(p.warnings.some((w) => w.includes('pendientes de aprobación')));
});

test('control de plata: avisa si el total no cierra, y no altera el total', () => {
  const p = buildPlan(shop);
  // pedido 1: 1600 + 18000 + 0 + 3000 − 500 = 22100 ≠ 20500 → aviso, total intacto
  assert.ok(p.warnings.some((w) => w.includes('NALV-0001') && w.includes('no coincide')));
  assert.equal(p.totals.legacyOrdersTotal, p.totals.planOrdersTotal);
  assert.equal(p.orders[0].total, 20500);
});

test('toKey', () => {
  assert.equal(toKey('/uploads/a.png'), 'uploads/a.png');
  assert.equal(toKey(null), null);
  assert.equal(toKey(''), null);
});
