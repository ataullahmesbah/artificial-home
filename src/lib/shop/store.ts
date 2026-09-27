"use client";
import { useSyncExternalStore } from "react";

/**
 * Tiny client stores for the cart, the wishlist and the cart drawer.
 * The cart and wishlist are saved in the visitor's browser (localStorage).
 * Prices in the cart are only for display — the database calculates the real
 * total when an order is placed.
 */
function createStore<T>(key: string | null, initial: T) {
  let state = initial;
  let loaded = false;
  const listeners = new Set<() => void>();
  const load = () => {
    if (loaded || typeof window === "undefined" || !key) return;
    loaded = true;
    try {
      const raw = window.localStorage.getItem(key);
      if (raw) state = JSON.parse(raw) as T;
    } catch {
      /* private mode or broken data: start empty */
    }
  };
  return {
    get: () => {
      load();
      return state;
    },
    server: () => initial,
    set: (fn: (s: T) => T) => {
      load();
      state = fn(state);
      if (key) {
        try {
          window.localStorage.setItem(key, JSON.stringify(state));
        } catch {
          /* storage full or blocked */
        }
      }
      listeners.forEach((l) => l());
    },
    subscribe: (l: () => void) => {
      listeners.add(l);
      const onStorage = (e: StorageEvent) => {
        if (key && e.key === key) {
          try {
            state = e.newValue ? (JSON.parse(e.newValue) as T) : initial;
          } catch {
            state = initial;
          }
          l();
        }
      };
      window.addEventListener("storage", onStorage);
      return () => {
        listeners.delete(l);
        window.removeEventListener("storage", onStorage);
      };
    },
  };
}

export type CartItem = {
  /** product id */
  id: string;
  slug: string;
  name: string;
  image: string | null;
  price: number;
  qty: number;
  color: string | null;
  stock: number;
};

const EMPTY_CART: CartItem[] = [];
const EMPTY_LIST: string[] = [];
const cartStore = createStore<CartItem[]>("ah-cart-v1", EMPTY_CART);
const wishStore = createStore<string[]>("ah-wishlist-v1", EMPTY_LIST);
const drawerStore = createStore<boolean>(null, false);

const lineKey = (i: { id: string; color: string | null }) => `${i.id}::${i.color ?? ""}`;

export function useCart() {
  const items = useSyncExternalStore(cartStore.subscribe, cartStore.get, cartStore.server);
  const count = items.reduce((n, i) => n + i.qty, 0);
  const subtotal = items.reduce((n, i) => n + i.qty * i.price, 0);
  return { items, count, subtotal };
}

export const cart = {
  add(item: Omit<CartItem, "qty">, qty = 1, open = true) {
    cartStore.set((items) => {
      const key = lineKey(item);
      const found = items.find((i) => lineKey(i) === key);
      const max = Math.max(1, Math.min(20, item.stock));
      if (found) return items.map((i) => (lineKey(i) === key ? { ...i, ...item, qty: Math.min(max, i.qty + qty) } : i));
      return [...items, { ...item, qty: Math.min(max, qty) }];
    });
    if (open) drawerStore.set(() => true);
  },
  setQty(id: string, color: string | null, qty: number) {
    cartStore.set((items) =>
      items.map((i) => (lineKey(i) === lineKey({ id, color }) ? { ...i, qty: Math.max(1, Math.min(Math.min(20, i.stock || 20), qty)) } : i))
    );
  },
  remove(id: string, color: string | null) {
    cartStore.set((items) => items.filter((i) => lineKey(i) !== lineKey({ id, color })));
  },
  clear() {
    cartStore.set(() => []);
  },
};

export function useWishlist() {
  return useSyncExternalStore(wishStore.subscribe, wishStore.get, wishStore.server);
}

export const wishlist = {
  toggle(id: string) {
    wishStore.set((list) => (list.includes(id) ? list.filter((x) => x !== id) : [...list, id]));
  },
  remove(id: string) {
    wishStore.set((list) => list.filter((x) => x !== id));
  },
};

export function useCartDrawer() {
  return useSyncExternalStore(drawerStore.subscribe, drawerStore.get, drawerStore.server);
}

export const cartDrawer = {
  open: () => drawerStore.set(() => true),
  close: () => drawerStore.set(() => false),
};
