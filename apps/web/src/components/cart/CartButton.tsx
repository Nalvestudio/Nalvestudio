'use client';
import { cartCount, openCart } from '@/lib/cart';
import { useCart } from './useCart';

export function CartButton() {
  const items = useCart();
  return (
    <button className="cart-btn" id="open-cart" onClick={openCart}>
      {"Carrito "}
      <span className="cart-count" id="cart-count">{cartCount(items)}</span>
    </button>
  );
}
