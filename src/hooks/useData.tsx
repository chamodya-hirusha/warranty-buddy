// ============================================================
// Central data store (React Context) backed by IndexedDB.
// All pages read/write through here so the UI updates instantly
// after any change (no manual refetching).
// ============================================================

import { createContext, useCallback, useContext, useEffect, useMemo, useState, ReactNode } from "react";
import { db, uid } from "@/db/store";
import type { Customer, Product, Warranty, WarrantyView, BackupFile } from "@/db/types";
import { describeWarranty } from "@/utils/warranty";

interface DataCtx {
  ready: boolean;
  customers: Customer[];
  products: Product[];
  warranties: Warranty[];
  warrantyViews: WarrantyView[];

  // Customers
  addCustomer: (data: Omit<Customer, "id" | "createdAt">) => Promise<Customer>;
  updateCustomer: (id: string, data: Partial<Omit<Customer, "id">>) => Promise<void>;
  deleteCustomer: (id: string) => Promise<void>;

  // Products
  addProduct: (data: Omit<Product, "id" | "createdAt">) => Promise<Product>;
  updateProduct: (id: string, data: Partial<Omit<Product, "id">>) => Promise<void>;
  deleteProduct: (id: string) => Promise<void>;

  // Warranties
  addWarranty: (data: Omit<Warranty, "id" | "createdAt">) => Promise<Warranty>;
  updateWarranty: (id: string, data: Partial<Omit<Warranty, "id">>) => Promise<void>;
  deleteWarranty: (id: string) => Promise<void>;

  // Backup
  exportBackup: () => BackupFile;
  importBackup: (file: BackupFile, mode: "merge" | "replace") => Promise<void>;
  resetAll: () => Promise<void>;
}

const Ctx = createContext<DataCtx | null>(null);

export function DataProvider({ children }: { children: ReactNode }) {
  const [ready, setReady] = useState(false);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [warranties, setWarranties] = useState<Warranty[]>([]);
  // tick re-renders warrantyViews so daysLeft updates over time / at midnight
  const [, setTick] = useState(0);

  // Load everything once on mount
  useEffect(() => {
    (async () => {
      const [c, p, w] = await Promise.all([db.customers.all(), db.products.all(), db.warranties.all()]);
      setCustomers(c);
      setProducts(p);
      setWarranties(w);
      setReady(true);
    })();
  }, []);

  // Recompute "days left" every minute so cards refresh over time.
  useEffect(() => {
    const id = setInterval(() => setTick((n) => n + 1), 60_000);
    return () => clearInterval(id);
  }, []);

  // ---------- Customers ----------
  const addCustomer: DataCtx["addCustomer"] = useCallback(async (data) => {
    const c: Customer = { id: uid(), createdAt: Date.now(), ...data };
    await db.customers.put(c);
    setCustomers((prev) => [...prev, c]);
    return c;
  }, []);
  const updateCustomer: DataCtx["updateCustomer"] = useCallback(async (id, data) => {
    const existing = await db.customers.get(id);
    if (!existing) return;
    const next = { ...existing, ...data };
    await db.customers.put(next);
    setCustomers((prev) => prev.map((c) => (c.id === id ? next : c)));
  }, []);
  const deleteCustomer: DataCtx["deleteCustomer"] = useCallback(async (id) => {
    await db.customers.remove(id);
    // cascade: remove related warranties
    const related = (await db.warranties.all()).filter((w) => w.customerId === id);
    await Promise.all(related.map((w) => db.warranties.remove(w.id)));
    setCustomers((prev) => prev.filter((c) => c.id !== id));
    setWarranties((prev) => prev.filter((w) => w.customerId !== id));
  }, []);

  // ---------- Products ----------
  const addProduct: DataCtx["addProduct"] = useCallback(async (data) => {
    const p: Product = { id: uid(), createdAt: Date.now(), ...data };
    await db.products.put(p);
    setProducts((prev) => [...prev, p]);
    return p;
  }, []);
  const updateProduct: DataCtx["updateProduct"] = useCallback(async (id, data) => {
    const existing = await db.products.get(id);
    if (!existing) return;
    const next = { ...existing, ...data };
    await db.products.put(next);
    setProducts((prev) => prev.map((p) => (p.id === id ? next : p)));
  }, []);
  const deleteProduct: DataCtx["deleteProduct"] = useCallback(async (id) => {
    await db.products.remove(id);
    const related = (await db.warranties.all()).filter((w) => w.productId === id);
    await Promise.all(related.map((w) => db.warranties.remove(w.id)));
    setProducts((prev) => prev.filter((p) => p.id !== id));
    setWarranties((prev) => prev.filter((w) => w.productId !== id));
  }, []);

  // ---------- Warranties ----------
  const addWarranty: DataCtx["addWarranty"] = useCallback(async (data) => {
    const w: Warranty = { id: uid(), createdAt: Date.now(), ...data };
    await db.warranties.put(w);
    setWarranties((prev) => [...prev, w]);
    return w;
  }, []);
  const updateWarranty: DataCtx["updateWarranty"] = useCallback(async (id, data) => {
    const existing = await db.warranties.get(id);
    if (!existing) return;
    const next = { ...existing, ...data };
    await db.warranties.put(next);
    setWarranties((prev) => prev.map((w) => (w.id === id ? next : w)));
  }, []);
  const deleteWarranty: DataCtx["deleteWarranty"] = useCallback(async (id) => {
    await db.warranties.remove(id);
    setWarranties((prev) => prev.filter((w) => w.id !== id));
  }, []);

  // ---------- Joined view ----------
  const warrantyViews = useMemo<WarrantyView[]>(() => {
    const cMap = new Map(customers.map((c) => [c.id, c]));
    const pMap = new Map(products.map((p) => [p.id, p]));
    return warranties
      .map((w) => {
        const { expiry, daysLeft, status } = describeWarranty(w);
        return {
          ...w,
          customer: cMap.get(w.customerId),
          product: pMap.get(w.productId),
          expiryDate: expiry.toISOString(),
          daysLeft,
          status,
        };
      })
      .sort((a, b) => a.daysLeft - b.daysLeft);
  }, [warranties, customers, products]);

  // ---------- Backup ----------
  const exportBackup = useCallback<DataCtx["exportBackup"]>(() => ({
    app: "warranty-manager",
    version: 1,
    exportedAt: new Date().toISOString(),
    customers,
    products,
    warranties,
  }), [customers, products, warranties]);

  const importBackup = useCallback<DataCtx["importBackup"]>(async (file, mode) => {
    if (!file || file.app !== "warranty-manager") throw new Error("Invalid backup file");
    if (mode === "replace") {
      await Promise.all([db.customers.clear(), db.products.clear(), db.warranties.clear()]);
    }
    await Promise.all([
      ...file.customers.map((c) => db.customers.put(c)),
      ...file.products.map((p) => db.products.put(p)),
      ...file.warranties.map((w) => db.warranties.put(w)),
    ]);
    const [c, p, w] = await Promise.all([db.customers.all(), db.products.all(), db.warranties.all()]);
    setCustomers(c);
    setProducts(p);
    setWarranties(w);
  }, []);

  const resetAll = useCallback(async () => {
    await Promise.all([db.customers.clear(), db.products.clear(), db.warranties.clear()]);
    setCustomers([]); setProducts([]); setWarranties([]);
  }, []);

  const value: DataCtx = {
    ready, customers, products, warranties, warrantyViews,
    addCustomer, updateCustomer, deleteCustomer,
    addProduct, updateProduct, deleteProduct,
    addWarranty, updateWarranty, deleteWarranty,
    exportBackup, importBackup, resetAll,
  };

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useData() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useData must be inside <DataProvider>");
  return ctx;
}
