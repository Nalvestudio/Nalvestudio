'use client';
import { Fragment, useEffect, useRef, useState, type ChangeEvent, type DragEvent } from 'react';
import { MAX_CM, MIN_CM, SHEET, SIZE_GUIDE, calcOrder } from '@nalv/shared';
import { CART_ITEM_TYPE, addItem, money, openCart } from '@/lib/cart';
import { useCart } from '@/components/cart/useCart';

const MODE = { SHEET: 'sheet', SINGLE: 'single' } as const;
type Mode = (typeof MODE)[keyof typeof MODE];

const OK_TYPES = ['image/png', 'image/jpeg', 'image/webp', 'image/svg+xml'];
const MAX_BYTES = 10 * 1024 * 1024;
const PREVIEW_MAX_PX = 220;
const PREVIEW_MIN_PX = 60;
const SIZE_PRESETS = [
  { size: 3, label: '3cm · celular' },
  { size: 5, label: '5cm · termo/botella' },
  { size: 7, label: '7cm · notebook' },
  { size: 10, label: '10cm · auto' },
];
const MAX_SHEET_CM = SHEET.maxStickerCm;
const MIN_SHEET_CM = 2;

const clampW = (w: number) => Math.round(Math.min(MAX_SHEET_CM, Math.max(MIN_SHEET_CM, w)) * 10) / 10;

interface Toast {
  text: string;
  error: boolean;
}

/** Ruler ticks for the single-sticker size slider (same markup as legacy buildRulerTicks). */
function RulerTicks({ min, max }: { min: number; max: number }) {
  const ticks = [];
  for (let cm = min; cm <= max + 1e-9; cm += 0.5) {
    const pct = ((cm - min) / (max - min)) * 100;
    const major = Number.isInteger(cm);
    ticks.push(<div key={`t${cm}`} className={'ruler-tick ' + (major ? 'major' : 'minor')} style={{ left: pct + '%' }} />);
    if (major) {
      ticks.push(
        <div key={`n${cm}`} className="ruler-num" style={{ left: pct + '%' }}>
          {cm}
        </div>,
      );
    }
  }
  return <>{ticks}</>;
}

function readAsDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = () => reject(new Error('No se pudo leer la imagen'));
    reader.readAsDataURL(file);
  });
}

/** "Armá tus stickers" section: sheet builder (UI only for now) and single-sticker mode. */
export function StickerConfigurator() {
  const [mode, setMode] = useState<Mode>(MODE.SHEET);
  const cart = useCart();

  // ---------- single sticker ----------
  const [imageDataUrl, setImageDataUrl] = useState<string | null>(null);
  const [sizeCm, setSizeCm] = useState(5);
  const [qty, setQty] = useState(1);
  const [qtyText, setQtyText] = useState('1');
  const [label, setLabel] = useState('');
  const [dragOver, setDragOver] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const singlesInCart = cart.filter((it) => it.type === CART_ITEM_TYPE.SINGLE || !it.type).map((it) => ({ sizeCm: it.sizeCm, qty: it.qty }));
  const priced = calcOrder([...singlesInCart, { sizeCm, qty }]);
  const thisLine = priced.lines[priced.lines.length - 1];
  const previewPx = PREVIEW_MIN_PX + ((sizeCm - MIN_CM) / (MAX_CM - MIN_CM)) * (PREVIEW_MAX_PX - PREVIEW_MIN_PX);

  const applyQty = (q: number) => {
    const next = Math.max(1, Math.min(500, Math.round(q)));
    setQty(next);
    setQtyText(String(next));
  };

  async function handleFile(file: File | undefined) {
    if (!file) return;
    if (!OK_TYPES.includes(file.type)) {
      alert('Formato no soportado. Usá PNG, JPG, WEBP o SVG.');
      return;
    }
    if (file.size > MAX_BYTES) {
      alert('La imagen pesa más de 10MB, probá con una más liviana.');
      return;
    }
    // TODO(backend): upload the full-quality original in the background (legacy /api/design-upload) and keep its ref.
    setImageDataUrl(await readAsDataUrl(file));
  }

  const onFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    void handleFile(e.target.files?.[0]);
    e.target.value = '';
  };
  const onDrag = (e: DragEvent<HTMLLabelElement>, over: boolean) => {
    e.preventDefault();
    setDragOver(over);
  };
  const onDrop = (e: DragEvent<HTMLLabelElement>) => {
    onDrag(e, false);
    void handleFile(e.dataTransfer.files[0]);
  };

  const addSingle = () => {
    if (!imageDataUrl) return;
    addItem({ type: CART_ITEM_TYPE.SINGLE, imageDataUrl, sizeCm, qty, label: label || null });
    openCart();
    setLabel('');
  };

  // ---------- sheet builder ----------
  const [toast, setToast] = useState<Toast | null>(null);
  const [useId, setUseId] = useState<string | null>(null);
  const toastTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  useEffect(() => () => clearTimeout(toastTimer.current), []);

  const showToast = (text: string, error = false) => {
    setToast({ text, error });
    clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => setToast(null), 4000);
  };

  const onSheetFiles = (e: ChangeEvent<HTMLInputElement>) => {
    e.target.value = '';
    // TODO(backend): port the sheet builder (legacy js/app.js: trim, crop and auto-nesting with @nalv/shared nesting).
    showToast('Próximamente: el armador de planchas todavía se está pasando a la nueva tienda.', true);
  };

  const guide = SIZE_GUIDE.find((g) => g.id === useId);

  return (
    <section id="crear">
      <div className="wrap">
        <div className="section-head">
          <h2>Armá tus stickers</h2>
          <p>
            Una plancha de 58 × 50 cm por $18.000. Subí tus imágenes, elegí la cantidad y se acomodan solas en la plancha. Después cambiás medida y cantidad de cada una, o la recortás para que entren más. ¿Un solo diseño suelto? También podés pedirlo aparte.
          </p>
        </div>
        <div className="mode-tabs" id="mode-tabs">
          <button className={'mode-tab' + (mode === MODE.SHEET ? ' active' : '')} data-mode="sheet" onClick={() => setMode(MODE.SHEET)}>
            {"Armar mis stickers · "}
            <span id="tab-sheet-price">{money(SHEET.price)}</span>
          </button>
          {" "}
          <button className={'mode-tab' + (mode === MODE.SINGLE ? ' active' : '')} data-mode="single" onClick={() => setMode(MODE.SINGLE)}>
            Sticker suelto
          </button>
        </div>
        {/* ===================== MODO: STICKER SUELTO ===================== */}
        <div className="configurator" id="single-mode" style={{ display: mode === MODE.SINGLE ? 'grid' : 'none' }}>
          <div>
            <label
              className={'upload-zone' + (dragOver ? ' dragover' : '')}
              id="upload-zone"
              htmlFor="file-input"
              onDragOver={(e) => onDrag(e, true)}
              onDragEnter={(e) => onDrag(e, true)}
              onDragLeave={(e) => onDrag(e, false)}
              onDrop={onDrop}
            >
              <strong>📎 Arrastrá tu imagen acá</strong>
              {" "}
              <span>o hacé clic para elegir un archivo — PNG, JPG, WEBP o SVG (máx. 10MB)</span>
              {" "}
              <input type="file" id="file-input" accept="image/png,image/jpeg,image/webp,image/svg+xml" ref={fileRef} onChange={onFileChange} />
            </label>
            <div id="single-actions" style={{ display: imageDataUrl ? 'flex' : 'none', gap: '8px', marginTop: '10px', flexWrap: 'wrap' }}>
              <button type="button" className="mini-btn" id="single-change" onClick={() => fileRef.current?.click()}>
                🔄 Cambiar imagen
              </button>
              {" "}
              <button type="button" className="mini-btn" id="single-remove" style={{ color: '#C0392B', borderColor: '#C0392B' }} onClick={() => setImageDataUrl(null)}>
                🗑 Quitar imagen
              </button>
            </div>
            <div className="preview-stage" style={{ marginTop: '16px' }}>
              <div className="preview-sticker" id="preview-sticker" style={{ width: previewPx + 'px', height: previewPx + 'px' }}>
                <img id="preview-img" src={imageDataUrl || undefined} style={{ display: imageDataUrl ? 'block' : 'none' }} alt="Vista previa" />
              </div>
            </div>
          </div>
          <div className="config-panel">
            <label className="section-label">Tamaño (usá la regla)</label>
            <div className="ruler">
              <div className="ruler-track" id="ruler-track">
                <RulerTicks min={MIN_CM} max={MAX_CM} />
              </div>
              <input type="range" id="size-range" min={MIN_CM} max={MAX_CM} step="0.5" value={sizeCm} onChange={(e) => setSizeCm(Number(e.target.value))} />
              <div className="ruler-readout">
                <span className="big">
                  <span id="size-value">{sizeCm}</span>
                </span>
                <span>cm × cm</span>
              </div>
              <div className="size-presets" id="size-presets">
                {SIZE_PRESETS.map((p, i) => (
                  <Fragment key={p.size}>
                    {i > 0 ? ' ' : null}
                    <button className={'size-chip' + (p.size === sizeCm ? ' active' : '')} data-size={p.size} onClick={() => setSizeCm(p.size)}>
                      {p.label}
                    </button>
                  </Fragment>
                ))}
              </div>
            </div>
            <label className="section-label">Cantidad</label>
            <div className="qty-row">
              <div className="qty-stepper">
                <button type="button" id="qty-minus" onClick={() => applyQty(qty - 1)}>
                  −
                </button>
                {" "}
                <input
                  type="number"
                  id="qty-input"
                  value={qtyText}
                  min="1"
                  max="500"
                  onChange={(e) => setQtyText(e.target.value)}
                  onBlur={() => applyQty(Number(qtyText) || 1)}
                />
                {" "}
                <button type="button" id="qty-plus" onClick={() => applyQty(qty + 1)}>
                  +
                </button>
              </div>
              <span className="qty-hint">$800 por unidad, de cualquier tamaño. Para muchos stickers conviene la plancha.</span>
            </div>
            <label className="section-label" htmlFor="label-input">
              Nombre del diseño (opcional)
            </label>
            {" "}
            <input
              className="label-input"
              id="label-input"
              type="text"
              placeholder="Ej: Logo redondo, Frase 'good vibes'…"
              maxLength={60}
              value={label}
              onChange={(e) => setLabel(e.target.value)}
            />
            <div className="price-box">
              <div>
                <div className="label">Precio de este sticker</div>
                <div className="amount">
                  $<span id="unit-price">{thisLine.total.toLocaleString('es-AR')}</span>{" "}
                  <span className="discount-tag" id="discount-tag" style={{ display: priced.discount > 0 ? 'inline-block' : 'none' }}>
                    {priced.discount > 0 ? `-${Math.round(priced.discount * 100)}% por cantidad` : null}
                  </span>
                </div>
              </div>
              <button className="btn btn-dark" id="add-to-cart" disabled={!imageDataUrl} onClick={addSingle}>
                Agregar al carrito
              </button>
            </div>
          </div>
        </div>
        {/* ===================== MODO: PLANCHA 58 x 50 ===================== */}
        <div className="configurator plancha" id="sheet-mode" style={{ display: mode === MODE.SHEET ? 'grid' : 'none' }}>
          <div className="plancha-left">
            <label className="section-label">1 · Subí tu diseño</label>
            {" "}
            <label className="upload-zone" id="sheet-upload-zone" htmlFor="sheet-file-input" style={{ minHeight: '110px' }}>
              <strong id="sheet-upload-title">📎 Arrastrá o elegí tus imágenes</strong>
              {" "}
              <span>Se acomodan solas en tu plancha. PNG, JPG, WEBP o SVG (máx. 10MB). Podés subir varias juntas.</span>
              {" "}
              <input type="file" id="sheet-file-input" multiple accept="image/png,image/jpeg,image/webp,image/svg+xml" onChange={onSheetFiles} />
            </label>
            <div className={'cat-toast' + (toast ? ' show' : '') + (toast?.error ? ' error' : '')} id="cat-toast" role="status" aria-live="polite">
              {toast?.text}
            </div>
            {/* 📁 Carpeta: stickers recomendados / todos / planchas armadas, con sus nombres (se muestra solo si hay algo cargado) */}
            {/* TODO(backend): the sticker library is filled from the legacy gallery/packs endpoints. */}
            <div className="biblio" id="biblio" hidden>
              <div className="biblio-head">
                <span>📁 Carpeta de stickers y planchas</span>
                <small>Tocá uno para sumarlo a tu plancha</small>
              </div>
              <div className="biblio-tabs" id="biblio-tabs" />
              <input type="search" id="biblio-search" placeholder="Buscar por nombre…" aria-label="Buscar en la carpeta" />
              <div className="biblio-grid" id="biblio-grid" />
            </div>
            <p className="start-note">
              {"Cada diseño entra con "}
              <b>1 unidad</b>
              {" y "}
              <b>5 cm de ancho</b>
              {". Después sumás las unidades que quieras y cambiás ancho y alto (o elegís una medida recomendada) en "}
              <b>Tus diseños</b>
              , al lado de la plancha.
            </p>
            <details className="use-details">
              <summary>¿Qué medida me conviene? Recomendaciones por uso</summary>
              <div className="use-chips" id="use-chips">
                {SIZE_GUIDE.map((g) => (
                  <button key={g.id} type="button" className={'use-chip' + (g.id === useId ? ' active' : '')} data-id={g.id} onClick={() => setUseId(g.id)}>
                    {g.label}
                  </button>
                ))}
              </div>
              <div className="use-tip" id="use-tip">
                {guide ? (
                  <>
                    <div>
                      <b>{guide.label}:</b> {guide.tip}
                    </div>
                    <div className="use-sizes">
                      <span>Medidas recomendadas:</span>
                      {[guide.min, guide.ideal, guide.max].map((z, i) => (
                        <button
                          key={i}
                          type="button"
                          className="use-size"
                          data-size={z}
                          onClick={() => showToast(`Tu próximo diseño va a entrar con ${clampW(z)} cm de ancho.`)}
                        >
                          {z} × {z} cm{i === 1 ? ' · ideal' : ''}
                        </button>
                      ))}
                    </div>
                  </>
                ) : (
                  'Elegí dónde lo vas a pegar y te recomendamos la medida (ancho × alto).'
                )}
              </div>
            </details>
          </div>
          <div className="plancha-right">
            <label className="section-label">
              {"Tu plancha · "}
              <span id="plancha-dim">
                {SHEET.widthCm} × {SHEET.lengthCm} cm
              </span>
            </label>
            <div className="plancha-board">
              <div className="plancha-viz">
                <div id="sheet-nest-wrap">
                  <svg id="sheet-nest-svg" viewBox="0 0 580 500" preserveAspectRatio="xMidYMin meet" role="img" aria-label="Vista previa de tu plancha de stickers" />
                </div>
                <div className="sheet-fit-bar-track">
                  <div className="sheet-fit-bar" id="sheet-fit-bar" />
                </div>
                <div id="sheet-fit-status" className="sheet-fit-status">
                  Subí tu primer diseño y se acomoda solo acá.
                </div>
                <div className="fill-hint" id="fill-hint" />
                <p className="sheet-note">
                  {"✂️ Dejamos "}
                  <strong>0,5 cm</strong>
                  {" entre stickers y contra el borde. Recortamos solos los márgenes vacíos, y con "}
                  <strong>Recortar</strong>
                  {" podés ajustar cada diseño para que entren más."}
                </p>
              </div>
              <div className="plancha-items">
                <div className="items-title">
                  {"Tus diseños "}
                  <span className="hint-inline">· cantidad, ancho, alto y recorte</span>
                </div>
                <div id="sheet-draft-list" />
              </div>
            </div>
            <div className="price-box">
              <div>
                <div className="label" id="sheet-price-label">
                  Plancha de {SHEET.widthCm} × {SHEET.lengthCm} cm
                </div>
                <div className="amount">
                  $<span id="sheet-price-display">{SHEET.price.toLocaleString('es-AR')}</span>
                </div>
              </div>
              <button className="btn btn-dark" id="add-sheet-to-cart" disabled>
                Agregar plancha al carrito
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
