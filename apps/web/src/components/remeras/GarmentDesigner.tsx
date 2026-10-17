'use client';
import { Fragment, useRef, useState, type ChangeEvent } from 'react';
import { GARMENTS, SHIRT_COLORS, calcShirts, quoteGarment, type PrintMode } from '@nalv/shared';
import { CART_ITEM_TYPE, addItem, money, openCart } from '@/lib/cart';
import { useCart } from '@/components/cart/useCart';
import { GARMENT_VIEW, dims, geometry, icon, render, type GarmentLimits, type GarmentView } from '@/lib/garments';

const SIDE_NAME: Record<GarmentView, string> = { front: 'adelante', back: 'espalda' };
const PRINTS: [PrintMode, string, string][] = [
  ['front', 'Adelante', 'una estampa'],
  ['both', 'Adelante y atrás', 'doble estampa'],
];
const OK_TYPES = ['image/png', 'image/jpeg', 'image/webp', 'image/svg+xml'];

interface DesignSide {
  url: string | null;
  aspect: number;
  wCm: number;
  cx: number;
  top: number;
}

const emptySide = (): DesignSide => ({ url: null, aspect: 1, wCm: 20, cx: 0, top: 10 });
const clamp = (v: number, a: number, b: number) => Math.max(a, Math.min(b, v));
const r1 = (n: number) => Math.round(n * 10) / 10;
const maxWidthFor = (lim: GarmentLimits, aspect: number) => Math.max(3, Math.min(lim.halfW * 2, (lim.maxY - lim.minY) / aspect));

/** Keeps a design inside the printable area of the garment (legacy fit()). */
function fit(S: DesignSide, lim: GarmentLimits): DesignSide {
  if (!S.url) return S;
  const wCm = clamp(S.wCm, 3, maxWidthFor(lim, S.aspect));
  const h = wCm * S.aspect;
  return {
    ...S,
    wCm,
    cx: clamp(S.cx, -(lim.halfW - wCm / 2), lim.halfW - wCm / 2),
    top: clamp(S.top, lim.minY, Math.max(lim.minY, lim.maxY - h)),
  };
}

function gridMarkup(): string {
  let s = '';
  for (let x = -60; x <= 60; x += 10) s += `<line x1="${x}" y1="-30" x2="${x}" y2="99" stroke="rgba(17,17,18,${x === 0 ? '.14' : '.07'})" stroke-width=".18"/>`;
  for (let y = -30; y <= 90; y += 10) s += `<line x1="-64" y1="${y}" x2="64" y2="${y}" stroke="rgba(17,17,18,${y === 0 ? '.14' : '.07'})" stroke-width=".18"/>`;
  return s;
}
const GRID = gridMarkup();

function loadDataUrl(file: File): Promise<{ url: string; aspect: number }> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(new Error('No se pudo leer la imagen'));
    reader.onload = () => {
      const url = String(reader.result);
      const im = new Image();
      im.onload = () => resolve({ url, aspect: (im.naturalHeight || 1) / (im.naturalWidth || 1) });
      im.onerror = () => reject(new Error('No se pudo leer la imagen'));
      im.src = url;
    };
    reader.readAsDataURL(file);
  });
}

/** Garment designer (port of the client-side parts of legacy js/remeras.js). */
export function GarmentDesigner() {
  const cart = useCart();
  const [gi, setGi] = useState(0);
  const [sizeIdx, setSizeIdx] = useState(2);
  const [colorId, setColorId] = useState(SHIRT_COLORS[0].id);
  const [print, setPrint] = useState<PrintMode>('front');
  const [view, setView] = useState<GarmentView>(GARMENT_VIEW.FRONT);
  const [qty, setQty] = useState(1);
  const [qtyText, setQtyText] = useState('1');
  const [label, setLabel] = useState('');
  const fileRef = useRef<HTMLInputElement>(null);
  const [sides, setSides] = useState<Record<GarmentView, DesignSide>>({ front: emptySide(), back: emptySide() });

  const g = GARMENTS[gi];
  const size = g.sizes[sizeIdx] || g.sizes[Math.floor(g.sizes.length / 2)];
  const color = SHIRT_COLORS.find((c) => c.id === colorId) || SHIRT_COLORS[0];
  const sideActive = (v: GarmentView) => (v === GARMENT_VIEW.FRONT ? true : print === 'both');
  const limitsFor = (v: GarmentView) => geometry(g.geometry, size.chestCm, size.lengthCm, v).limits;
  const geo = render(g.geometry, size.chestCm, size.lengthCm, view, color.hex);
  const lim = geo.limits;
  const S = fit(sides[view], lim);
  const active = sideActive(view);

  // ---------- pricing (shared module; the server recalculates on checkout) ----------
  const shirtsInCart = cart.filter((it) => it.type === CART_ITEM_TYPE.SHIRT);
  const otherPrinted = shirtsInCart.reduce((a, it) => a + it.qty, 0);
  const priced = calcShirts([
    ...shirtsInCart.map((it) => ({ garment: it.garment, size: it.size, colorId: it.colorId, print: it.print, qty: it.qty })),
    { garment: g.id, size: size.id, colorId, print, qty },
  ]);
  const line = priced.lines[priced.lines.length - 1];
  const quote = quoteGarment(g.id, qty, otherPrinted);

  const setGarment = (i: number) => {
    const prevLabel = size.label;
    const next = GARMENTS[i];
    const same = next.sizes.findIndex((s) => s.label === prevLabel);
    setGi(i);
    setSizeIdx(same >= 0 ? same : Math.floor(next.sizes.length / 2));
  };
  const choosePrint = (p: PrintMode) => {
    setPrint(p);
    if (p !== 'both') setView(GARMENT_VIEW.FRONT);
  };
  const updateSide = (patch: Partial<DesignSide>) => setSides((prev) => ({ ...prev, [view]: fit({ ...fit(prev[view], lim), ...patch }, lim) }));
  const applyQty = (q: number) => {
    const next = Math.max(1, Math.min(500, Math.round(q)));
    setQty(next);
    setQtyText(String(next));
  };

  async function onFile(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;
    if (!OK_TYPES.includes(file.type)) {
      alert('Formato no soportado. Usá PNG, JPG, WEBP o SVG.');
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      alert('La imagen pesa más de 10MB, probá con una más liviana.');
      return;
    }
    // TODO(backend): upload the original (legacy /api/design-upload); trim and background removal (bg-remove.js) not ported yet.
    const { url, aspect } = await loadDataUrl(file);
    setSides((prev) => ({ ...prev, [view]: fit({ ...emptySide(), url, aspect }, lim) }));
  }

  const need: string[] = [];
  if (!sides.front.url) need.push('adelante');
  if (print === 'both' && !sides.back.url) need.push('espalda');

  const addToCart = () => {
    const item = (v: GarmentView) => {
      const side = fit(sides[v], limitsFor(v));
      const neckY = geometry(g.geometry, size.chestCm, size.lengthCm, v).neckY;
      return {
        imageDataUrl: side.url,
        placement: { wCm: r1(side.wCm), hCm: r1(side.wCm * side.aspect), cx: r1(side.cx), top: r1(side.top), fromNeck: r1(side.top - neckY) },
      };
    };
    addItem({
      type: CART_ITEM_TYPE.SHIRT,
      garment: g.id,
      size: size.id,
      colorId,
      qty,
      print,
      label: label || null,
      front: item(GARMENT_VIEW.FRONT),
      back: print === 'both' ? item(GARMENT_VIEW.BACK) : null,
    });
    openCart();
  };

  const h = S.wCm * S.aspect;
  const x = S.cx - S.wCm / 2;
  const n = g.sizes.length;

  return (
    <div className="designer">
      {/* ============ LIENZO ============ */}
      <div className="designer-canvas">
        <div className="side-tabs" id="side-tabs">
          <button type="button" className={'side-tab' + (view === GARMENT_VIEW.FRONT ? ' active' : '')} data-side="front" onClick={() => setView(GARMENT_VIEW.FRONT)}>
            Frente
          </button>
          {" "}
          <button
            type="button"
            className={'side-tab' + (view === GARMENT_VIEW.BACK ? ' active' : '')}
            data-side="back"
            disabled={print !== 'both'}
            onClick={() => setView(GARMENT_VIEW.BACK)}
          >
            Espalda
          </button>
        </div>
        <span className="canvas-tag right" id="canvas-tag">
          {g.label} · talle {size.label} · {color.label.toLowerCase()}
        </span>
        <div className="stage" id="stage">
          <svg id="stage-svg" viewBox="-64 -30 128 129" xmlns="http://www.w3.org/2000/svg" aria-label="Prenda a escala real">
            <defs>
              <linearGradient id="cloth" x1="0" x2="1" y1="0" y2="0">
                <stop offset="0" stopColor="#000" stopOpacity=".10" />
                <stop offset=".5" stopColor="#fff" stopOpacity=".05" />
                <stop offset="1" stopColor="#000" stopOpacity=".14" />
              </linearGradient>
              <marker id="arr" viewBox="0 0 6 6" refX="5" refY="3" markerWidth="2.2" markerHeight="2.2" markerUnits="userSpaceOnUse" orient="auto-start-reverse">
                <path d="M0 0 L6 3 L0 6 Z" fill="rgba(17,17,18,.75)" />
              </marker>
            </defs>
            <g id="grid-g" dangerouslySetInnerHTML={{ __html: GRID }} />
            <g id="garment-g" dangerouslySetInnerHTML={{ __html: geo.svg }} />
            <g id="dims-g" dangerouslySetInnerHTML={{ __html: dims(size.chestCm, size.lengthCm, geo.ext) }} />
            <rect
              id="print-guide"
              fill="none"
              stroke="#FF4D00"
              strokeWidth=".35"
              strokeDasharray="1.2 .9"
              opacity=".7"
              rx=".6"
              x={-lim.halfW}
              y={lim.minY}
              width={lim.halfW * 2}
              height={lim.maxY - lim.minY}
              style={{ display: active ? undefined : 'none' }}
            />
            <text
              id="guide-text"
              textAnchor="middle"
              fontFamily="IBM Plex Mono, monospace"
              fontSize="2"
              fill="#FF4D00"
              x={0}
              y={lim.minY + (lim.maxY - lim.minY) / 2}
              style={{ display: active && !S.url ? undefined : 'none' }}
            >
              zona de estampa {SIDE_NAME[view]}
            </text>
            {/* TODO: drag to move and the resize handle are not ported yet; use the slider and nudge buttons. */}
            <image
              id="design-image"
              preserveAspectRatio="none"
              href={S.url || undefined}
              x={x}
              y={S.top}
              width={S.wCm}
              height={h}
              style={{ display: active && S.url ? undefined : 'none', cursor: 'grab' }}
            />
            <rect id="design-frame" fill="none" stroke="#FF4D00" strokeWidth=".3" x={x} y={S.top} width={S.wCm} height={h} style={{ display: active && S.url ? undefined : 'none', pointerEvents: 'none' }} />
            <circle id="design-handle" r="1.7" fill="#FF4D00" stroke="#fff" strokeWidth=".5" cx={x + S.wCm} cy={S.top + h} style={{ display: active && S.url ? undefined : 'none', cursor: 'nwse-resize' }} />
          </svg>
        </div>
        <div className="design-readout" id="readout">
          {!active || !S.url ? (
            <span>
              {g.label} · talle <b>{size.label}</b> · <b>{size.chestCm} × {size.lengthCm} cm</b>
            </span>
          ) : (
            <>
              <span>
                Estampa {SIDE_NAME[view]}: <b>{r1(S.wCm)} × {r1(h)} cm</b>
              </span>
              <span>
                a <b>{r1(S.top - geo.neckY)} cm</b> del cuello
              </span>
              <span>
                {Math.abs(S.cx) < 0.3 ? (
                  <b>centrada</b>
                ) : (
                  <>
                    <b>{r1(Math.abs(S.cx))} cm</b> a la {S.cx > 0 ? 'derecha' : 'izquierda'}
                  </>
                )}
              </span>
            </>
          )}
        </div>
        <p className="stage-note">Cada cuadro = 10 cm · Arrastrá el diseño para moverlo y el punto naranja para agrandarlo.</p>
      </div>
      {/* ============ PANEL ============ */}
      <div className="designer-panel">
        <label className="section-label">
          {"1 · Prenda "}
          <span className="current" id="garment-name">{g.label}</span>
        </label>
        <div className="garment-grid" id="garment-grid">
          {GARMENTS.map((gg, i) => {
            const mid = gg.sizes[Math.floor(gg.sizes.length / 2)];
            return (
              <button type="button" key={gg.id} className={'garment-card' + (i === gi ? ' active' : '')} data-i={i} onClick={() => setGarment(i)}>
                <span dangerouslySetInnerHTML={{ __html: icon(gg.geometry, mid.chestCm, mid.lengthCm) }} style={{ display: 'contents' }} />
                <span>{gg.label}</span>
              </button>
            );
          })}
        </div>
        <p className="garment-material" id="garment-material">
          {g.material}
        </p>
        <label className="section-label">
          {"2 · Color "}
          <span className="current" id="color-name">{color.label}</span>
        </label>
        <div className="swatches" id="swatches">
          {SHIRT_COLORS.map((c) => (
            <button
              key={c.id}
              className={'swatch' + (c.id === color.id ? ' active' : '')}
              data-id={c.id}
              title={c.label}
              aria-label={c.label}
              style={{ background: c.hex }}
              onClick={() => setColorId(c.id)}
            />
          ))}
        </div>
        <label className="section-label">
          {"3 · Talle "}
          <span className="current" id="size-name">{size.label}</span>
        </label>
        <div className="size-scale">
          <div className="size-scale-track" id="size-track">
            {g.sizes.map((s, i) => {
              const pct = (i / (n - 1)) * 100;
              return (
                <Fragment key={s.id}>
                  <div className="size-scale-tick" style={{ left: `${pct}%` }} />
                  {i < n - 1 ? <div className="size-scale-tick minor" style={{ left: `${pct + 50 / (n - 1)}%` }} /> : null}
                  <button type="button" className={'size-scale-lbl' + (i === sizeIdx ? ' active' : '')} style={{ left: `${pct}%` }} data-idx={i} onClick={() => setSizeIdx(i)}>
                    {s.label}
                  </button>
                </Fragment>
              );
            })}
          </div>
          <input type="range" id="size-range" min="0" max={n - 1} step="1" value={sizeIdx} aria-label="Talle" onChange={(e) => setSizeIdx(Number(e.target.value))} />
          <div className="size-meta">
            <span>
              ancho <b id="size-chest">{size.chestCm}</b> cm
            </span>
            <span>
              largo <b id="size-length">{size.lengthCm}</b> cm
            </span>
          </div>
        </div>
        <label className="section-label">4 · Estampa</label>
        <div className="print-options" id="print-options">
          {PRINTS.map(([id, t, sub]) => (
            <button type="button" key={id} className={'print-opt' + (print === id ? ' active' : '')} data-print={id} onClick={() => choosePrint(id)}>
              <b>{t}</b>
              <small>{sub}</small>
              <em>{money(quote.unit[id])} c/u</em>
            </button>
          ))}
        </div>
        <div className="tier-table" id="tier-table">
          <div className="tier-title">Precio por prenda estampada adelante · {g.label}</div>
          <div className="tier-row">
            {quote.tiers.map((t, i) => (
              <div key={t.name} className={'tier' + (i === quote.activeTier ? ' active' : '')}>
                <small>
                  {t.name} · {t.label}
                </small>
                <b>{money(t.front)}</b>
                <em>doble {money(t.both)}</em>
              </div>
            ))}
          </div>
          <p>
            Estampa en la espalda: <b>+{money(quote.backExtra)}</b> por prenda (doble estampa). El escalón se calcula con todas las prendas estampadas de tu pedido.
          </p>
        </div>
        <div id="design-section">
          <label className="section-label">
            {"5 · Tu diseño "}
            <span className="current" id="design-side-name">{SIDE_NAME[view]}</span>
          </label>
          {" "}
          <label className="upload-zone" id="upload-zone" htmlFor="file-input" style={{ minHeight: '110px' }}>
            <strong id="upload-title">{S.url ? '✓ Diseño cargado — hacé clic para cambiarlo' : '📎 Subí tu diseño ' + SIDE_NAME[view]}</strong>
            {" "}
            <span>PNG, JPG, WEBP o SVG (máx. 10MB). Con fondo transparente queda mejor.</span>
            {" "}
            <input type="file" id="file-input" accept="image/png,image/jpeg,image/webp,image/svg+xml" ref={fileRef} onChange={onFile} />
          </label>
          <div id="design-actions" style={{ display: S.url ? 'flex' : 'none', gap: '8px', marginTop: '8px', flexWrap: 'wrap' }}>
            <button type="button" className="mini-btn" id="btn-change" onClick={() => fileRef.current?.click()}>
              🔄 Cambiar imagen
            </button>
            {" "}
            <button
              type="button"
              className="mini-btn"
              id="btn-remove-design"
              style={{ color: '#C0392B', borderColor: '#C0392B' }}
              onClick={() => setSides((prev) => ({ ...prev, [view]: emptySide() }))}
            >
              🗑 Quitar diseño
            </button>
          </div>
          <div className="design-controls" id="design-controls" style={{ display: S.url && active ? 'flex' : 'none' }}>
            {/* TODO: recommended sizes (rec-chips), trim and background removal are not ported yet. */}
            <div className="slider-row">
              <span>ancho</span>
              <input type="range" id="w-range" min="3" max={r1(maxWidthFor(lim, S.aspect))} step="0.5" value={S.wCm} onChange={(e) => updateSide({ wCm: Number(e.target.value) })} />
              <output id="w-out">{r1(S.wCm)} cm</output>
            </div>
            <div className="mini-btns">
              <button type="button" className="mini-btn" id="btn-center" onClick={() => updateSide({ cx: 0 })}>
                Centrar
              </button>
              {" "}
              <button type="button" className="mini-btn" id="btn-up" onClick={() => updateSide({ top: S.top - 1 })}>
                ↑ 1 cm
              </button>
              {" "}
              <button type="button" className="mini-btn" id="btn-down" onClick={() => updateSide({ top: S.top + 1 })}>
                ↓ 1 cm
              </button>
              {" "}
              <button type="button" className="mini-btn" id="btn-left" onClick={() => updateSide({ cx: S.cx - 1 })}>
                ← 1 cm
              </button>
              {" "}
              <button type="button" className="mini-btn" id="btn-right" onClick={() => updateSide({ cx: S.cx + 1 })}>
                → 1 cm
              </button>
            </div>
          </div>
        </div>
        <label className="section-label">6 · Cantidad</label>
        <div className="qty-row">
          <div className="qty-stepper">
            <button type="button" id="qty-minus" onClick={() => applyQty(qty - 1)}>
              −
            </button>
            {" "}
            <input type="number" id="qty-input" value={qtyText} min="1" max="500" onChange={(e) => setQtyText(e.target.value)} onBlur={() => applyQty(Number(qtyText) || 1)} />
            {" "}
            <button type="button" id="qty-plus" onClick={() => applyQty(qty + 1)}>
              +
            </button>
          </div>
        </div>
        <label className="section-label" htmlFor="label-input">
          Nombre del diseño (opcional)
        </label>
        {" "}
        <input className="label-input" id="label-input" type="text" maxLength={60} placeholder="Ej: Logo pecho, Frase espalda…" value={label} onChange={(e) => setLabel(e.target.value)} />
        <div className="price-box">
          <div>
            <div className="label" id="price-label">
              Total · {qty} × {money(line.unitPrice)}
            </div>
            <div className="amount">
              $<span id="price">{line.total.toLocaleString('es-AR')}</span>
            </div>
          </div>
          <button className="btn btn-dark" id="add-to-cart" disabled={need.length > 0} onClick={addToCart}>
            Agregar al carrito
          </button>
        </div>
        <p className="form-hint" id="add-hint">
          {need.length ? `Falta subir el diseño de ${need.join(' y ')}.` : ''}
        </p>
      </div>
    </div>
  );
}

/** Size chart cards for every garment ("Guía de talles"). */
export function SizeChart() {
  return (
    <div className="chart-grid" id="chart-grid">
      {GARMENTS.map((g) => {
        const mid = g.sizes[Math.floor(g.sizes.length / 2)];
        return (
          <div className="chart-card" key={g.id}>
            <div className="chart-head">
              <span dangerouslySetInnerHTML={{ __html: icon(g.geometry, mid.chestCm, mid.lengthCm) }} style={{ display: 'contents' }} />
              <div>
                <h3>{g.label}</h3>
                <small>{g.material}</small>
              </div>
            </div>
            <table className="size-chart">
              <tbody>
                <tr>
                  <th>Talle</th>
                  <th>Ancho (cm)</th>
                  <th>Largo (cm)</th>
                </tr>
                {g.sizes.map((s) => (
                  <tr key={s.id}>
                    <td>{s.label}</td>
                    <td>{s.chestCm}</td>
                    <td>{s.lengthCm}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        );
      })}
    </div>
  );
}
