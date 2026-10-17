'use client';
import { useState, type FormEvent } from 'react';
import Link from 'next/link';
import { PROVINCES, calcOrder, calcShirts, quote, weightKg } from '@nalv/shared';
import { CART_ITEM_TYPE, money, priceCart, sheetPriceOf, type CartItem } from '@/lib/cart';
import { useCart } from '@/components/cart/useCart';

const DELIVERY = {
  PICKUP: 'retiro',
  HOME: 'correo_domicilio',
  BRANCH: 'correo_sucursal',
} as const;
type ShipType = typeof DELIVERY.HOME | typeof DELIVERY.BRANCH;

const isSingle = (it: CartItem) => it.type === CART_ITEM_TYPE.SINGLE || !it.type;

function SummaryRows({ items }: { items: CartItem[] }) {
  const singles = items.filter(isSingle);
  const sheets = items.filter((it) => it.type === CART_ITEM_TYPE.SHEET);
  const packs = items.filter((it) => it.type === CART_ITEM_TYPE.PACK);
  const shirts = items.filter((it) => it.type === CART_ITEM_TYPE.SHIRT);
  const priced = calcOrder(singles.map((it) => ({ sizeCm: it.sizeCm, qty: it.qty })));
  const pricedShirts = calcShirts(shirts.map((it) => ({ garment: it.garment, size: it.size, colorId: it.colorId, print: it.print, qty: it.qty })));
  return (
    <>
      {singles.map((it, idx) => (
        <div className="summary-line" key={it.id}>
          <span>
            {it.label || 'Sticker'} · {it.sizeCm}cm × {it.sizeCm}cm · x{it.qty}
          </span>
          <span>${priced.lines[idx].total.toLocaleString('es-AR')}</span>
        </div>
      ))}
      {sheets.map((sh) => {
        const subs = sh.subItems || [];
        return (
          <div className="summary-line" key={sh.id}>
            <span>
              Plancha 58 × 50 cm{(sh.planchas || 1) > 1 ? ' x' + sh.planchas : ''} ({subs.length} diseños: {subs.map((d) => `${d.sizeCm}cm×${d.qty}`).join(', ')})
            </span>
            <span>${sheetPriceOf(sh).toLocaleString('es-AR')}</span>
          </div>
        );
      })}
      {/* TODO(backend): ready-made pack titles and prices come from the legacy /api/pack-price. */}
      {packs.map((p) => (
        <div className="summary-line" key={p.id}>
          <span>
            Plancha armada · x{p.qty}
          </span>
          <span>${((p.price || 0) * p.qty).toLocaleString('es-AR')}</span>
        </div>
      ))}
      {shirts.map((it, idx) => {
        const line = pricedShirts.lines[idx];
        return (
          <div className="summary-line" key={it.id}>
            <span>
              {line.garmentLabel}
              {it.label ? ' · ' + it.label : ''} · {line.colorLabel} · talle {line.size} · {line.printLabel.toLowerCase()} · x{it.qty}
            </span>
            <span>${line.total.toLocaleString('es-AR')}</span>
          </div>
        );
      })}
    </>
  );
}

/** Checkout screen (port of legacy checkout.html + the client-side parts of js/checkout.js). */
export function CheckoutForm() {
  const items = useCart();
  const [shipping, setShipping] = useState(false);
  const [shipType, setShipType] = useState<ShipType>(DELIVERY.HOME);
  const [province, setProvince] = useState('');
  const [error, setError] = useState<string | null>(null);

  const method = shipping ? shipType : DELIVERY.PICKUP;
  const grandTotal = priceCart(items).total;
  const weight = weightKg({
    singles: items.filter(isSingle).reduce((a, it) => a + it.qty, 0),
    planchas: items.filter((it) => it.type === CART_ITEM_TYPE.SHEET).reduce((a, it) => a + (it.planchas || 1), 0),
    shirts: items.filter((it) => it.type === CART_ITEM_TYPE.SHIRT).map((it) => ({ garment: it.garment || '', qty: it.qty })),
  });
  const shipQuote = quote({ method, province: province || undefined, weight });
  const shipCost = method !== DELIVERY.PICKUP && province && shipQuote.ok ? shipQuote.cost : 0;
  const showShare = items.some((it) => isSingle(it) || it.type === CART_ITEM_TYPE.SHEET);

  const onSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    // TODO(backend): POST the order (with uploaded designs) to the legacy /api/orders flow and show #order-confirm.
    setError('Próximamente: la confirmación de pedidos todavía se está pasando a la nueva tienda. Escribinos por WhatsApp para hacer tu pedido.');
  };

  return (
    <div className="checkout-wrap">
      <h1>Finalizar pedido</h1>
      {items.length ? (
      <div id="checkout-form-area">
        <div className="checkout-card">
          <h2>Tu pedido</h2>
          <div id="summary-items">
            <SummaryRows items={items} />
          </div>
          <div id="summary-ship">
            {method === DELIVERY.PICKUP ? (
              <div className="summary-line">
                <span>Retiro en local</span>
                <span>Gratis</span>
              </div>
            ) : shipCost ? (
              <div className="summary-line">
                <span>Envío Correo Argentino {method === DELIVERY.BRANCH ? 'a sucursal' : 'a domicilio'}</span>
                <span>{money(shipCost)}</span>
              </div>
            ) : null}
          </div>
          <div className="summary-line total">
            <span>Total</span>
            <span>
              $
              <span id="summary-total">{(grandTotal + shipCost).toLocaleString('es-AR')}</span>
            </span>
          </div>
        </div>
        <form className="checkout-card" id="order-form" onSubmit={onSubmit} onInput={() => setError(null)}>
          <h2>Tus datos</h2>
          <p className="ship-note" id="acct-note" style={{ marginTop: "-6px" }}>
            {"¿Tenés cuenta? "}
            <Link href="/cuenta" style={{ color: "var(--accent)", fontWeight: "600" }}>Ingresá</Link>
            {" y tus datos y este pedido quedan guardados en “Mi cuenta”. Si no, podés comprar igual."}
          </p>
          <div className="form-grid">
            <div className="form-row">
              <label>Nombre y apellido</label>
              <input required name="customerName" />
            </div>
            <div className="form-row">
              <label>Teléfono / WhatsApp</label>
              <input required name="customerPhone" placeholder="Ej: 221 555 1234" />
            </div>
          </div>
          <div className="form-row">
            <label>Email (opcional)</label>
            <input type="email" name="customerEmail" />
          </div>
          <label style={{ display: "block", fontFamily: "var(--mono)", fontSize: ".78rem", textTransform: "uppercase", letterSpacing: ".05em", color: "var(--ink-soft)", marginBottom: "8px" }}>
            ¿Cómo lo recibís?
          </label>
          <div className="delivery-options" style={{ marginBottom: "16px" }}>
            <label>
              <input type="radio" name="deliveryMethod" value="retiro" checked={!shipping} onChange={() => setShipping(false)} />
              {" Retiro en local "}
              <small>(gratis)</small>
            </label>
            {" "}
            <label>
              <input type="radio" name="deliveryMethod" value="correo" checked={shipping} onChange={() => setShipping(true)} />
              {" Envío a todo el país "}
              <small>(Correo Argentino)</small>
            </label>
          </div>
          <p id="pickup-note" className="ship-note" style={{ display: shipping ? 'none' : 'block' }}>
            {"Retirás en nuestro local: "}
            <b id="pickup-addr">calle 45 e/ 145 y 146, La Plata</b>
            . Te avisamos por WhatsApp cuando el pedido esté listo y coordinamos el horario.
          </p>
          <div id="ship-area" style={{ display: shipping ? 'block' : 'none' }}>
            <div className="delivery-options" style={{ marginBottom: "16px" }}>
              <label>
                <input type="radio" name="shipType" value="correo_domicilio" checked={shipType === DELIVERY.HOME} onChange={() => setShipType(DELIVERY.HOME)} />
                {" A domicilio"}
              </label>
              {" "}
              <label>
                <input type="radio" name="shipType" value="correo_sucursal" checked={shipType === DELIVERY.BRANCH} onChange={() => setShipType(DELIVERY.BRANCH)} />
                {" A sucursal de Correo Argentino "}
                <small>(más barato)</small>
              </label>
            </div>
            <div className="form-grid">
              <div className="form-row">
                <label>Provincia</label>
                <select name="province" id="province" value={province} onChange={(e) => setProvince(e.target.value)}>
                  <option value="">Elegí tu provincia…</option>
                  {PROVINCES.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.label}
                    </option>
                  ))}
                </select>
              </div>
              <div className="form-row">
                <label>Localidad</label>
                <input name="city" autoComplete="address-level2" />
              </div>
            </div>
            <div className="form-grid">
              <div className="form-row">
                <label>Código postal</label>
                <input name="postalCode" inputMode="numeric" maxLength={8} autoComplete="postal-code" placeholder="Ej: 1900" />
              </div>
              <div className="form-row">
                <label>DNI de quien recibe</label>
                <input name="dni" inputMode="numeric" maxLength={10} placeholder="Solo números" />
              </div>
            </div>
            <div className="form-row" id="address-row" style={{ display: method === DELIVERY.HOME ? 'block' : 'none' }}>
              <label>Calle, número, piso/depto</label>
              {" "}
              <textarea name="address" rows={2} placeholder="Ej: Calle 7 nº 1234, piso 2 depto B" />
            </div>
            <div className="form-row" id="branch-row" style={{ display: method === DELIVERY.BRANCH ? 'block' : 'none' }}>
              <label>Sucursal de Correo donde retirás</label>
              {" "}
              <input name="branch" placeholder="Localidad o dirección de la sucursal" />
            </div>
            <p className="ship-note" id="ship-quote-line">
              {!province ? (
                'Elegí la provincia para ver el costo del envío.'
              ) : shipQuote.ok ? (
                <>
                  Envío estimado por Correo Argentino: <b>{money(shipQuote.cost)}</b> (paquete de ≈ {shipQuote.weightKg} kg). Se suma al total y se paga junto con el pedido.
                </>
              ) : (
                shipQuote.error
              )}
            </p>
          </div>
          <div className="form-row">
            <label>Notas (opcional)</label>
            {" "}
            <textarea name="notes" rows={2} placeholder="Aclaraciones sobre tu pedido" />
          </div>
          <label className="share-opt mk" id="mk-opt">
            <input type="checkbox" name="marketing" value="1" />
            {" "}
            <span>
              {"Quiero recibir ofertas y novedades de nalv.estudio por mail o WhatsApp "}
              <small>(opcional · te podés dar de baja cuando quieras)</small>
            </span>
          </label>
          {" "}
          <label className="share-opt" id="share-opt" hidden={!showShare}>
            <input type="checkbox" name="shareGallery" value="1" />
            {" "}
            <span>
              {"Permito que nalv.estudio publique los diseños de mis stickers en la galería de descargas gratis "}
              <small>(opcional · solo si son tuyos; los revisamos antes de publicar y podés pedir que los saquemos cuando quieras)</small>
            </span>
          </label>
          {" "}
          <button className="btn btn-primary" type="submit" id="submit-btn" style={{ width: "100%", justifyContent: "center" }}>Confirmar pedido</button>
          <p id="form-error" style={{ color: "#C0392B", fontSize: ".85rem", marginTop: "10px", display: error ? 'block' : 'none' }}>
            {error}
          </p>
        </form>
      </div>
      ) : (
        <div id="checkout-form-area">
          <div className="checkout-card" style={{ textAlign: 'center' }}>
            <h2>Tu carrito está vacío</h2>
            <p>
              <Link href="/" className="btn btn-primary" style={{ marginTop: '12px' }}>
                Ir a la tienda
              </Link>
            </p>
          </div>
        </div>
      )}
      {/* TODO(backend): shown after a successful order (code, bank details, WhatsApp link) from the legacy /api/orders. */}
      <div id="order-confirm" className="checkout-card">
        <h2>¡Pedido recibido! 🎉</h2>
        <p>Tu número de pedido es</p>
        <div className="code" id="order-code" />
        <p style={{ marginTop: "18px" }}>
          Para que empecemos a producir, transferí el total y enviános el comprobante por WhatsApp con tu número de pedido.
        </p>
        <div className="bank-box" id="bank-box" style={{ textAlign: "left", marginTop: "14px" }} />
        <p style={{ marginTop: "14px", fontSize: ".9rem" }}>
          {"También podés escribirnos a "}
          <a id="contact-mail" href="#" />
        </p>
        <a id="whatsapp-link" className="btn btn-primary" style={{ marginTop: "20px" }} href="#" target="_blank">Enviar comprobante por WhatsApp</a>
        <br />
        <br />
        <div style={{ display: "flex", gap: "10px", justifyContent: "center", flexWrap: "wrap" }}>
          <Link id="track-link" href="/seguimiento" className="btn btn-ghost" style={{ color: "var(--ink)", borderColor: "var(--line)" }}>
            Seguir mi pedido
          </Link>
          {" "}
          <Link href="/" className="btn btn-ghost" style={{ color: "var(--ink)", borderColor: "var(--line)" }}>Volver a la tienda</Link>
        </div>
      </div>
    </div>
  );
}
