// plan.ts — convierte el shop.json de la tienda actual en filas listas para MySQL. FUNCIÓN PURA (no toca la base).
// Conserva los ids y los códigos de pedido (NALV-0001…) para que los links y la numeración sigan igual.

type J = Record<string, any>;

const STATUSES = ['pendiente_pago', 'pagado', 'en_produccion', 'listo', 'entregado', 'cancelado'];
const DELIVERY = ['retiro', 'correo_domicilio', 'correo_sucursal'];

/** "/uploads/abc.png" → "uploads/abc.png" (clave de almacenamiento, sin barra inicial). */
export const toKey = (p: unknown): string | null =>
  typeof p === 'string' && p ? p.replace(/^\/+/, '') : null;

const date = (v: unknown, fallback?: Date): Date => {
  const d = new Date(String(v));
  return Number.isNaN(d.getTime()) ? (fallback ?? new Date(0)) : d;
};

export interface Plan {
  users: J[]; orders: J[]; statusEvents: J[]; items: J[]; sheets: J[]; shirts: J[]; packs: J[];
  gallery: J[]; contacts: J[]; optouts: J[]; expenses: J[]; campaigns: J[];
  fileKeys: string[];           // todos los archivos que la base va a referenciar
  warnings: string[];
  totals: { legacyOrdersTotal: number; planOrdersTotal: number };
}

export function buildPlan(shop: J): Plan {
  const warnings: string[] = [];
  const keys = new Set<string>();
  const key = (p: unknown) => { const k = toKey(p); if (k) keys.add(k); return k; };

  const users = (shop.users || []).map((u: J) => ({
    id: u.id, name: u.name, email: String(u.email).toLowerCase(), phone: u.phone ?? null,
    passwordHash: u.pass, marketing: !!u.marketing, shipDefaults: u.ship && Object.keys(u.ship).length ? u.ship : null,
    createdAt: date(u.created_at),
  }));
  const userIds = new Set(users.map((u: J) => u.id));

  const orders: J[] = [], statusEvents: J[] = [], items: J[] = [], sheets: J[] = [], shirts: J[] = [], packs: J[] = [];
  const codes = new Set<string>();

  for (const o of shop.orders || []) {
    if (codes.has(o.order_code)) warnings.push(`Código de pedido repetido: ${o.order_code}`);
    codes.add(o.order_code);
    if (!STATUSES.includes(o.status)) warnings.push(`${o.order_code}: estado desconocido "${o.status}" → pendiente_pago`);
    if (!DELIVERY.includes(o.delivery_method)) warnings.push(`${o.order_code}: método de entrega desconocido "${o.delivery_method}" → retiro`);
    if (o.user_id && !userIds.has(o.user_id)) warnings.push(`${o.order_code}: user_id ${o.user_id} no existe → sin cuenta`);

    const created = date(o.created_at);
    orders.push({
      id: o.id, code: o.order_code, customerName: o.customer_name, customerPhone: o.customer_phone,
      customerEmail: o.customer_email ?? null,
      deliveryMethod: DELIVERY.includes(o.delivery_method) ? o.delivery_method : 'retiro',
      address: o.address ?? null, province: o.province ?? null, city: o.city ?? null, postalCode: o.postal_code ?? null,
      dni: o.dni ?? null, branch: o.branch ?? null,
      shippingCost: o.shipping_cost || 0, shippingWeightKg: o.shipping_weight_kg || 0,
      shippingZone: o.shipping_zone != null ? String(o.shipping_zone) : null,
      notes: o.notes ?? null, adminNote: o.admin_note ?? null, paymentMethod: o.payment_method ?? null,
      discount: o.discount || 0, total: o.total,
      status: STATUSES.includes(o.status) ? o.status : 'pendiente_pago',
      marketing: !!o.marketing, shareGallery: !!o.share_gallery,
      userId: o.user_id && userIds.has(o.user_id) ? o.user_id : null,
      createdAt: created,
    });

    const hist = Array.isArray(o.history) && o.history.length ? o.history : [{ status: o.status, at: o.created_at }];
    for (const h of hist) {
      statusEvents.push({ orderId: o.id, status: STATUSES.includes(h.status) ? h.status : 'pendiente_pago', at: date(h.at, created), note: h.note ?? null });
    }

    const itemRow = (it: J, sheetId: number | null) => ({
      id: it.id, orderId: o.id, sheetId,
      widthCm: it.size_cm, heightCm: it.h_cm || it.size_cm, qty: it.qty,
      unitPrice: it.unit_price || 0, lineTotal: it.line_total || 0, label: it.label ?? null,
      printKey: key(it.image_path), origKey: key(it.image_orig), thumbKey: key(it.image_thumb), meta: it.image_meta ?? null,
    });
    for (const it of o.items || []) items.push(itemRow(it, null));
    for (const sh of o.sheets || []) {
      sheets.push({ id: sh.id, orderId: o.id, price: sh.price, planchas: sh.planchas || 1, widthCm: sh.width_cm, lengthCm: sh.length_cm, usedLengthCm: sh.used_length_cm });
      for (const it of sh.items || []) items.push(itemRow(it, sh.id));
    }
    for (const s of o.shirts || []) {
      shirts.push({
        id: s.id, orderId: o.id, garmentId: s.garment_id, garmentLabel: s.garment_label, size: s.size,
        colorId: s.color_id, colorLabel: s.color_label, colorHex: s.color_hex, print: s.print, printLabel: s.print_label,
        qty: s.qty, unitPrice: s.unit_price, lineTotal: s.line_total, label: s.label ?? null,
        frontKey: key(s.front_image), backKey: key(s.back_image), frontOrigKey: key(s.front_orig), backOrigKey: key(s.back_orig),
        frontThumb: key(s.front_thumb), backThumb: key(s.back_thumb),
        frontMeta: s.front_meta ?? null, backMeta: s.back_meta ?? null, placements: s.placements ?? null,
      });
    }
    for (const p of o.packs || []) {
      packs.push({ id: p.id, orderId: o.id, packId: p.pack_id ?? null, packKey: p.pack_key ?? null, title: p.title, stickers: p.stickers, qty: p.qty, unitPrice: p.unit_price, lineTotal: p.line_total, thumbKey: key(p.thumb) });
    }

    // Control de plata: el total del pedido debe cerrar con sus renglones + envío − descuento.
    const lines =
      (o.sheets || []).reduce((a: number, x: J) => a + x.price, 0) + (o.items || []).reduce((a: number, x: J) => a + x.line_total, 0) +
      (o.shirts || []).reduce((a: number, x: J) => a + x.line_total, 0) + (o.packs || []).reduce((a: number, x: J) => a + x.line_total, 0);
    const expected = lines + (o.shipping_cost || 0) - (o.discount || 0);
    if (expected !== o.total) warnings.push(`${o.order_code}: el total (${o.total}) no coincide con la suma de renglones (${expected}). Se migra tal cual.`);
  }

  const gallery = (shop.gallery || []).map((g: J) => ({
    id: g.id, title: g.title, fileKey: key('galeria/' + g.file)!, thumbKey: key('galeria/' + g.thumb)!, hash: g.hash ?? null,
    featured: !!g.featured, source: g.source || 'propio', orderCode: g.order_code ?? null, createdAt: date(g.created_at),
  }));

  const contacts = Object.entries(shop.contacts || {}).map(([k, c]: [string, any]) => ({
    key: k, name: c.name ?? null, email: c.email ?? null, phone: c.phone ?? null, marketing: !!c.marketing,
    marketingAt: c.marketing_at ? date(c.marketing_at) : null, createdAt: date(c.created_at),
  }));
  const optouts = (shop.optouts || []).map((e: string) => ({ email: String(e).toLowerCase() }));
  const expenses = (shop.expenses || []).map((e: J) => ({ id: e.id, date: date(e.date), concept: e.concept, category: e.category, amount: e.amount, createdAt: date(e.created_at) }));
  const campaigns = (shop.campaigns || []).map((c: J) => ({ date: date(c.date), subject: c.subject, total: c.total, sent: c.sent, failed: c.failed }));

  if ((shop.pending || []).length) warnings.push(`Hay ${(shop.pending || []).length} diseños pendientes de aprobación en shop.json: no se migran (se re-suben desde el panel).`);

  return {
    users, orders, statusEvents, items, sheets, shirts, packs, gallery, contacts, optouts, expenses, campaigns,
    fileKeys: [...keys].sort(), warnings,
    totals: { legacyOrdersTotal: (shop.orders || []).reduce((a: number, o: J) => a + (o.total || 0), 0), planOrdersTotal: orders.reduce((a, o) => a + o.total, 0) },
  };
}
