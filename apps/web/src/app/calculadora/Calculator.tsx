'use client';
import { useState } from 'react';

type Out = { price?: any; ship?: any; pack?: any };

export default function Calculator() {
  const [size, setSize] = useState(5);
  const [qty, setQty] = useState(10);
  const [province, setProvince] = useState('buenos_aires');
  const [out, setOut] = useState<Out>({});
  const [busy, setBusy] = useState(false);

  async function calcular() {
    setBusy(true);
    const post = (url: string, body: unknown) =>
      fetch(url, { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify(body) }).then((r) => r.json());
    const [price, pack, ship] = await Promise.all([
      post('/api/price', { stickers: [{ sizeCm: size, qty }] }),
      post('/api/sheet/pack', { items: [{ sizeCm: size, qty }] }),
      post('/api/shipping/quote', { method: 'correo_domicilio', province, singles: qty }),
    ]);
    setOut({ price, pack, ship });
    setBusy(false);
  }

  const box = { padding: 12, background: '#fff', border: '1px solid #e5e0d6', borderRadius: 10, marginTop: 12 } as const;
  return (
    <section>
      <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
        <label>Tamaño (cm) <input type="number" value={size} min={2} max={15} step={0.1} onChange={(e) => setSize(+e.target.value)} /></label>
        <label>Cantidad <input type="number" value={qty} min={1} onChange={(e) => setQty(+e.target.value)} /></label>
        <label>Provincia <input value={province} onChange={(e) => setProvince(e.target.value)} /></label>
        <button onClick={calcular} disabled={busy}>{busy ? 'Calculando…' : 'Calcular'}</button>
      </div>
      {out.price && (
        <div style={box}>
          <b>Stickers sueltos:</b> ${out.price.total?.toLocaleString('es-AR')} ({out.price.stickers?.totalQty} u.)<br />
          <b>Plancha:</b> {out.pack?.planchas} plancha(s) · ${out.pack?.price?.toLocaleString('es-AR')} · {out.pack?.fillPct}% ocupada · entran {out.pack?.totalUnits - out.pack?.overflowCount} de {out.pack?.totalUnits}<br />
          <b>Envío:</b> {out.ship?.ok ? `$${out.ship.cost.toLocaleString('es-AR')} (${out.ship.weightKg} kg)` : out.ship?.error}
        </div>
      )}
    </section>
  );
}
