// ============================================================
// IndexedDB layer (via LocalForage)
// ----
// Why LocalForage? It wraps the browser's IndexedDB with a
// simple async key/value API, with automatic fallbacks.
// We keep one "store" per entity (customers / products / warranties).
// ============================================================

import localforage from "localforage";
import type { Customer, Product, Warranty } from "./types";

localforage.config({
  name: "warranty-manager",
  storeName: "wm_default",
  description: "Warranty Management System local database",
});

const customers = localforage.createInstance({ name: "warranty-manager", storeName: "customers" });
const products = localforage.createInstance({ name: "warranty-manager", storeName: "products" });
const warranties = localforage.createInstance({ name: "warranty-manager", storeName: "warranties" });

/** Generic helper: load every value from a store as an array. */
async function getAll<T>(store: LocalForage): Promise<T[]> {
  const items: T[] = [];
  await store.iterate<T, void>((value) => {
    items.push(value);
  });
  return items;
}

export const db = {
  customers: {
    all: () => getAll<Customer>(customers),
    get: (id: string) => customers.getItem<Customer>(id),
    put: (c: Customer) => customers.setItem(c.id, c),
    remove: (id: string) => customers.removeItem(id),
    clear: () => customers.clear(),
  },
  products: {
    all: () => getAll<Product>(products),
    get: (id: string) => products.getItem<Product>(id),
    put: (p: Product) => products.setItem(p.id, p),
    remove: (id: string) => products.removeItem(id),
    clear: () => products.clear(),
  },
  warranties: {
    all: () => getAll<Warranty>(warranties),
    get: (id: string) => warranties.getItem<Warranty>(id),
    put: (w: Warranty) => warranties.setItem(w.id, w),
    remove: (id: string) => warranties.removeItem(id),
    clear: () => warranties.clear(),
  },
};

/** Cheap unique id (good enough offline; no collisions in practice). */
export const uid = () =>
  `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 9)}`;
