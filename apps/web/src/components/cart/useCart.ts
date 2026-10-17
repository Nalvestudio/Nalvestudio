'use client';
import { useSyncExternalStore } from 'react';
import { getItems, getServerItems, subscribe, type CartItem } from '@/lib/cart';

export function useCart(): CartItem[] {
  return useSyncExternalStore(subscribe, getItems, getServerItems);
}
