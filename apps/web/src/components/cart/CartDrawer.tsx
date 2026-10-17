'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { CART_ITEM_TYPE, closeCart, money, onCartToggle, priceCart, removeItem, sheetPriceOf, type CartItem } from '@/lib/cart';
import { useCart } from './useCart';

const thumbStyle = { width: '26px', height: '26px', objectFit: 'cover', borderRadius: '6px', border: '1px solid var(--line)' } as const;

function RemoveButton({ id }: { id: string }) {
  return (
    <button className="remove" data-id={id} onClick={() => removeItem(id)}>
      Quitar
    </button>
  );
}

function CartLines({ items }: { items: CartItem[] }) {
  const priced = priceCart(items);
  let si = 0;
  let shi = 0;
  return (
    <>
      {items.map((it) => {
        if (it.type === CART_ITEM_TYPE.SHEET) {
          const subs = it.subItems || [];
          const stickers = subs.reduce((a, d) => a + d.qty, 0);
          return (
            <div className="cart-item" key={it.id}>
              <div style={{ display: 'flex', gap: '2px', flexWrap: 'wrap', width: '60px' }}>
                {subs.slice(0, 4).map((s, i) => (
                  <img key={i} src={s.imageDataUrl} alt="" style={thumbStyle} />
                ))}
              </div>
              <div className="meta">
                <div className="name">
                  Plancha 58 × 50 cm{(it.planchas || 1) > 1 ? ' · x' + it.planchas : ''}
                </div>
                <div className="sub">
                  {subs.length} diseño{subs.length === 1 ? '' : 's'} · {stickers} stickers
                </div>
                <div className="sub">{money(sheetPriceOf(it))}</div>
                <RemoveButton id={it.id} />
              </div>
            </div>
          );
        }
        if (it.type === CART_ITEM_TYPE.PACK) {
          // TODO(backend): pack title/thumb come from the legacy /api/pack-price endpoint.
          return (
            <div className="cart-item" key={it.id}>
              <div className="meta">
                <div className="name">{it.label || 'Plancha armada'}</div>
                <div className="sub">Plancha armada · x{it.qty}</div>
              </div>
              <RemoveButton id={it.id} />
            </div>
          );
        }
        if (it.type === CART_ITEM_TYPE.SHIRT) {
          const line = priced.shirts.lines[shi++];
          return (
            <div className="cart-item" key={it.id}>
              <div
                style={{ width: '60px', height: '60px', flex: 'none', borderRadius: '8px', border: '1px solid var(--line)', background: line.colorHex, display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}
              >
                {it.front?.imageDataUrl ? (
                  <img src={it.front.imageDataUrl} alt="" style={{ width: '60%', height: '60%', objectFit: 'contain', border: 'none', borderRadius: 0 }} />
                ) : null}
              </div>
              <div className="meta">
                <div className="name">
                  {line.garmentLabel}
                  {it.label ? ' · ' + it.label : ''}
                </div>
                <div className="sub">
                  {line.colorLabel} · talle {line.size} · x{it.qty}
                </div>
                <div className="sub">{line.printLabel}</div>
                <div className="sub">{money(line.total)}</div>
                <RemoveButton id={it.id} />
              </div>
            </div>
          );
        }
        const line = priced.singles.lines[si++];
        return (
          <div className="cart-item" key={it.id}>
            <img src={it.imageDataUrl} alt="" />
            <div className="meta">
              <div className="name">{it.label || 'Sticker personalizado'}</div>
              <div className="sub">
                {it.sizeCm}cm × {it.sizeCm}cm · x{it.qty}
              </div>
              <div className="sub">{money(line.total)}</div>
              <RemoveButton id={it.id} />
            </div>
          </div>
        );
      })}
    </>
  );
}

/** Shared cart drawer (port of legacy js/cart-ui.js). */
export function CartDrawer() {
  const items = useCart();
  const [open, setOpen] = useState(false);
  useEffect(() => onCartToggle(() => setOpen(true), () => setOpen(false)), []);
  const total = items.length ? priceCart(items).total : 0;
  const empty = !items.length;
  return (
    <>
      <div className={'overlay' + (open ? ' open' : '')} id="overlay" onClick={closeCart} />
      <aside className={'drawer' + (open ? ' open' : '')} id="drawer">
        <div className="drawer-head">
          <h3>Tu carrito</h3>
          <button className="drawer-close" id="close-cart" onClick={closeCart}>
            ✕
          </button>
        </div>
        <div className="drawer-body" id="cart-items">
          {empty ? (
            <div className="empty-cart">
              Todavía no agregaste nada.
              <br />
              ¡Armá tus stickers o tu remera personalizada! 👆
            </div>
          ) : (
            <CartLines items={items} />
          )}
        </div>
        <div className="drawer-foot">
          <div className="total-row">
            <span>Total</span>
            <span>
              $<span id="cart-total">{total.toLocaleString('es-AR')}</span>
            </span>
          </div>
          <Link
            href="/checkout"
            className="btn btn-primary"
            style={{ width: '100%', justifyContent: 'center', pointerEvents: empty ? 'none' : 'auto', opacity: empty ? 0.5 : 1 }}
            id="checkout-link"
          >
            Ir a pagar
          </Link>
        </div>
      </aside>
    </>
  );
}
