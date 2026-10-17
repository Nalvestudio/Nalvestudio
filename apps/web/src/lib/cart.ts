// Client-side cart persisted in localStorage (port of legacy js/cart.js).
// Same storage key as the legacy store so existing carts keep working.
import { SHEET, calcOrder, calcShirts } from '@nalv/shared';

const KEY = 'sticker_cart_v1';
const UPDATED_EVENT = 'cart:updated';
const OPEN_EVENT = 'cart:open';
const CLOSE_EVENT = 'cart:close';

export const CART_ITEM_TYPE = {
  SINGLE: 'single',
  SHEET: 'sheet',
  SHIRT: 'shirt',
  PACK: 'pack',
} as const;

export type CartItemType = (typeof CART_ITEM_TYPE)[keyof typeof CART_ITEM_TYPE];

export interface SheetSubItem {
  imageDataUrl: string;
  sizeCm?: number;
  qty: number;
}

export interface ShirtPlacement {
  wCm: number;
  hCm: number;
  cx: number;
  top: number;
  fromNeck: number;
}

export interface ShirtSide {
  imageDataUrl: string | null;
  placement?: ShirtPlacement;
}

export interface CartItem {
  id: string;
  type?: CartItemType;
  qty: number;
  label?: string | null;
  imageDataUrl?: string;
  sizeCm?: number;
  price?: number;
  planchas?: number;
  subItems?: SheetSubItem[];
  garment?: string;
  size?: string;
  colorId?: string;
  print?: string;
  front?: ShirtSide | null;
  back?: ShirtSide | null;
  packId?: string;
}

const EMPTY: CartItem[] = [];
let lastRaw: string | null = null;
let lastItems: CartItem[] = EMPTY;

function readRaw(): string | null {
  try {
    return localStorage.getItem(KEY);
  } catch {
    return null;
  }
}

function parse(raw: string | null): CartItem[] {
  if (!raw) return EMPTY;
  try {
    const value: unknown = JSON.parse(raw);
    return Array.isArray(value) ? (value as CartItem[]) : EMPTY;
  } catch {
    return EMPTY;
  }
}

/** Stable snapshot for useSyncExternalStore: only re-parses when the stored string changes. */
export function getItems(): CartItem[] {
  const raw = readRaw();
  if (raw !== lastRaw) {
    lastRaw = raw;
    lastItems = parse(raw);
  }
  return lastItems;
}

export const getServerItems = (): CartItem[] => EMPTY;

export function saveItems(items: CartItem[]): void {
  try {
    localStorage.setItem(KEY, JSON.stringify(items));
  } catch {
    alert('No se pudo guardar en el carrito: las imágenes pesan demasiado. Quitá algún diseño del carrito o usá una imagen más liviana.');
    return;
  }
  document.dispatchEvent(new CustomEvent(UPDATED_EVENT, { detail: items }));
}

export function addItem(item: Omit<CartItem, 'id'>): void {
  saveItems([...getItems(), { id: crypto.randomUUID(), ...item }]);
}

export function removeItem(id: string): void {
  saveItems(getItems().filter((it) => it.id !== id));
}

export function clearCart(): void {
  saveItems([]);
}

export function subscribe(callback: () => void): () => void {
  document.addEventListener(UPDATED_EVENT, callback);
  window.addEventListener('storage', callback);
  return () => {
    document.removeEventListener(UPDATED_EVENT, callback);
    window.removeEventListener('storage', callback);
  };
}

/** Sheets count as one unit each (same rule as the legacy cart badge). */
export const cartCount = (items: CartItem[]): number =>
  items.reduce((acc, it) => acc + (it.type === CART_ITEM_TYPE.SHEET ? 1 : it.qty), 0);

export const sheetPriceOf = (it: CartItem): number => it.price || (it.planchas || 1) * SHEET.price;

export const money = (n: number): string => '$' + Number(n).toLocaleString('es-AR');

export interface PricedCart {
  singles: ReturnType<typeof calcOrder>;
  shirts: ReturnType<typeof calcShirts>;
  total: number;
}

/** Live prices computed with the shared pricing module (the server recalculates on checkout). */
export function priceCart(items: CartItem[]): PricedCart {
  const singles = calcOrder(items.filter((it) => it.type === CART_ITEM_TYPE.SINGLE || !it.type).map((it) => ({ sizeCm: it.sizeCm, qty: it.qty })));
  const shirts = calcShirts(
    items
      .filter((it) => it.type === CART_ITEM_TYPE.SHIRT)
      .map((it) => ({ garment: it.garment, size: it.size, colorId: it.colorId, print: it.print, qty: it.qty })),
  );
  const sheets = items.filter((it) => it.type === CART_ITEM_TYPE.SHEET).reduce((acc, it) => acc + sheetPriceOf(it), 0);
  // TODO(backend): ready-made packs ("planchas armadas") are priced by the legacy /api/pack-price endpoint.
  const packs = items.filter((it) => it.type === CART_ITEM_TYPE.PACK).reduce((acc, it) => acc + (it.price || 0) * it.qty, 0);
  return { singles, shirts, total: singles.total + shirts.total + sheets + packs };
}

export const openCart = (): void => {
  document.dispatchEvent(new Event(OPEN_EVENT));
};
export const closeCart = (): void => {
  document.dispatchEvent(new Event(CLOSE_EVENT));
};

export function onCartToggle(onOpen: () => void, onClose: () => void): () => void {
  document.addEventListener(OPEN_EVENT, onOpen);
  document.addEventListener(CLOSE_EVENT, onClose);
  return () => {
    document.removeEventListener(OPEN_EVENT, onOpen);
    document.removeEventListener(CLOSE_EVENT, onClose);
  };
}
