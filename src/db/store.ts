// ============================================================
// IndexedDB layer (via LocalForage)
// ----
// Why LocalForage? It wraps the browser's IndexedDB with a
// simple async key/value API, with automatic fallbacks.
// We keep one "store" per entity (customers / products / warranties).
// ============================================================

import localforage from "localforage";
import type { Customer, Product, Warranty, Category, Brand, Model, Supplier, Repair, Expense, Cheque, Invoice, InvoiceItem } from "./types";

localforage.config({
  name: "warranty-manager",
  storeName: "wm_default",
  description: "Warranty Management System local database",
});

const customers = localforage.createInstance({ name: "warranty-manager", storeName: "customers" });
const products = localforage.createInstance({ name: "warranty-manager", storeName: "products" });
const warranties = localforage.createInstance({ name: "warranty-manager", storeName: "warranties" });
const categories = localforage.createInstance({ name: "warranty-manager", storeName: "categories" });
const brands = localforage.createInstance({ name: "warranty-manager", storeName: "brands" });
const models = localforage.createInstance({ name: "warranty-manager", storeName: "models" });
const suppliers = localforage.createInstance({ name: "warranty-manager", storeName: "suppliers" });
const repairs = localforage.createInstance({ name: "warranty-manager", storeName: "repairs" });
const expenses = localforage.createInstance({ name: "warranty-manager", storeName: "expenses" });
const cheques = localforage.createInstance({ name: "warranty-manager", storeName: "cheques" });
const invoices = localforage.createInstance({ name: "warranty-manager", storeName: "invoices" });
const invoiceItems = localforage.createInstance({ name: "warranty-manager", storeName: "invoiceItems" });

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
  categories: {
    all: () => getAll<Category>(categories),
    get: (id: string) => categories.getItem<Category>(id),
    put: (c: Category) => categories.setItem(c.id, c),
    remove: (id: string) => categories.removeItem(id),
    clear: () => categories.clear(),
  },
  brands: {
    all: () => getAll<Brand>(brands),
    get: (id: string) => brands.getItem<Brand>(id),
    put: (b: Brand) => brands.setItem(b.id, b),
    remove: (id: string) => brands.removeItem(id),
    clear: () => brands.clear(),
  },
  models: {
    all: () => getAll<Model>(models),
    get: (id: string) => models.getItem<Model>(id),
    put: (m: Model) => models.setItem(m.id, m),
    remove: (id: string) => models.removeItem(id),
    clear: () => models.clear(),
  },
  suppliers: {
    all: () => getAll<Supplier>(suppliers),
    get: (id: string) => suppliers.getItem<Supplier>(id),
    put: (s: Supplier) => suppliers.setItem(s.id, s),
    remove: (id: string) => suppliers.removeItem(id),
    clear: () => suppliers.clear(),
  },
  repairs: {
    all: () => getAll<Repair>(repairs),
    get: (id: string) => repairs.getItem<Repair>(id),
    put: (r: Repair) => repairs.setItem(r.id, r),
    remove: (id: string) => repairs.removeItem(id),
    clear: () => repairs.clear(),
  },
  expenses: {
    all: () => getAll<Expense>(expenses),
    get: (id: string) => expenses.getItem<Expense>(id),
    put: (e: Expense) => expenses.setItem(e.id, e),
    remove: (id: string) => expenses.removeItem(id),
    clear: () => expenses.clear(),
  },
  cheques: {
    all: () => getAll<Cheque>(cheques),
    get: (id: string) => cheques.getItem<Cheque>(id),
    put: (c: Cheque) => cheques.setItem(c.id, c),
    remove: (id: string) => cheques.removeItem(id),
    clear: () => cheques.clear(),
  },
  invoices: {
    all: () => getAll<Invoice>(invoices),
    get: (id: string) => invoices.getItem<Invoice>(id),
    put: (i: Invoice) => invoices.setItem(i.id, i),
    remove: (id: string) => invoices.removeItem(id),
    clear: () => invoices.clear(),
  },
  invoiceItems: {
    all: () => getAll<InvoiceItem>(invoiceItems),
    get: (id: string) => invoiceItems.getItem<InvoiceItem>(id),
    put: (ii: InvoiceItem) => invoiceItems.setItem(ii.id, ii),
    remove: (id: string) => invoiceItems.removeItem(id),
    clear: () => invoiceItems.clear(),
  },
};

/** Cheap unique id (good enough offline; no collisions in practice). */
export const uid = () =>
  `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 9)}`;
