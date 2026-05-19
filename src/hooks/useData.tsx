// ============================================================
// Central data store (React Context) backed by IndexedDB.
// All pages read/write through here so the UI updates instantly
// after any change (no manual refetching).
// ============================================================

import { createContext, useCallback, useContext, useEffect, useMemo, useState, ReactNode } from "react";
import { db, uid } from "@/db/store";
import type { Customer, Product, Warranty, WarrantyView, BackupFile, Category, Brand, Model, Supplier, Repair, Expense, Cheque, Invoice, InvoiceItem } from "@/db/types";
import { describeWarranty } from "@/utils/warranty";

interface DataCtx {
  ready: boolean;
  customers: Customer[];
  products: Product[];
  warranties: Warranty[];
  warrantyViews: WarrantyView[];
  categories: Category[];
  brands: Brand[];
  models: Model[];
  suppliers: Supplier[];
  repairs: Repair[];
  expenses: Expense[];
  cheques: Cheque[];
  invoices: Invoice[];
  invoiceItems: InvoiceItem[];

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

  // Attributes
  addCategory: (name: string) => Promise<Category>;
  updateCategory: (id: string, name: string) => Promise<void>;
  deleteCategory: (id: string) => Promise<void>;
  
  addBrand: (name: string) => Promise<Brand>;
  updateBrand: (id: string, name: string) => Promise<void>;
  deleteBrand: (id: string) => Promise<void>;

  addModel: (name: string) => Promise<Model>;
  updateModel: (id: string, name: string) => Promise<void>;
  deleteModel: (id: string) => Promise<void>;

  addSupplier: (data: Omit<Supplier, "id" | "createdAt">) => Promise<Supplier>;
  updateSupplier: (id: string, data: Partial<Omit<Supplier, "id">>) => Promise<void>;
  deleteSupplier: (id: string) => Promise<void>;

  addRepair: (data: Omit<Repair, "id" | "createdAt">) => Promise<Repair>;
  updateRepair: (id: string, data: Partial<Omit<Repair, "id">>) => Promise<void>;
  deleteRepair: (id: string) => Promise<void>;

  addExpense: (data: Omit<Expense, "id" | "createdAt">) => Promise<Expense>;
  updateExpense: (id: string, data: Partial<Omit<Expense, "id">>) => Promise<void>;
  deleteExpense: (id: string) => Promise<void>;

  addCheque: (data: Omit<Cheque, "id" | "createdAt">) => Promise<Cheque>;
  updateCheque: (id: string, data: Partial<Omit<Cheque, "id">>) => Promise<void>;
  deleteCheque: (id: string) => Promise<void>;

  addInvoice: (data: Omit<Invoice, "id" | "createdAt">, items: Omit<InvoiceItem, "id" | "invoiceId">[]) => Promise<Invoice>;
  deleteInvoice: (id: string) => Promise<void>;

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
  const [categories, setCategories] = useState<Category[]>([]);
  const [brands, setBrands] = useState<Brand[]>([]);
  const [models, setModels] = useState<Model[]>([]);
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [repairs, setRepairs] = useState<Repair[]>([]);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [cheques, setCheques] = useState<Cheque[]>([]);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [invoiceItems, setInvoiceItems] = useState<InvoiceItem[]>([]);
  // tick re-renders warrantyViews so daysLeft updates over time / at midnight
  const [, setTick] = useState(0);

  const syncToCloud = useCallback(async (action: "create" | "update" | "delete", entity: string, id: string, data?: any) => {
    try {
      await fetch("/api/sync", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action, entity, id, data }),
      });
    } catch (err) {
      console.error(`Sync warning: Failed to sync ${entity} with cloud.`, err);
    }
  }, []);

  // Load everything once on mount
  useEffect(() => {
    (async () => {
      const [c, p, w, cat, br, mod, sup, rep, exp, chq, inv, invIt] = await Promise.all([
        db.customers.all(), db.products.all(), db.warranties.all(),
        db.categories.all(), db.brands.all(), db.models.all(),
        db.suppliers.all(), db.repairs.all(), db.expenses.all(),
        db.cheques.all(), db.invoices.all(), db.invoiceItems.all()
      ]);
      setCustomers(c);
      setProducts(p);
      setWarranties(w);
      setCategories(cat);
      setBrands(br);
      setModels(mod);
      setSuppliers(sup);
      setRepairs(rep);
      setExpenses(exp);
      setCheques(chq);
      setInvoices(inv);
      setInvoiceItems(invIt);
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
    syncToCloud("create", "Customer", c.id, data);
    return c;
  }, [syncToCloud]);
  const updateCustomer: DataCtx["updateCustomer"] = useCallback(async (id, data) => {
    const existing = await db.customers.get(id);
    if (!existing) return;
    const next = { ...existing, ...data };
    await db.customers.put(next);
    setCustomers((prev) => prev.map((c) => (c.id === id ? next : c)));
    syncToCloud("update", "Customer", id, data);
  }, [syncToCloud]);
  const deleteCustomer: DataCtx["deleteCustomer"] = useCallback(async (id) => {
    await db.customers.remove(id);
    // cascade: remove related warranties
    const related = (await db.warranties.all()).filter((w) => w.customerId === id);
    await Promise.all(related.map((w) => db.warranties.remove(w.id)));
    setCustomers((prev) => prev.filter((c) => c.id !== id));
    setWarranties((prev) => prev.filter((w) => w.customerId !== id));
    syncToCloud("delete", "Customer", id);
  }, [syncToCloud]);

  // ---------- Products ----------
  const addProduct: DataCtx["addProduct"] = useCallback(async (data) => {
    const p: Product = { id: uid(), createdAt: Date.now(), ...data };
    await db.products.put(p);
    setProducts((prev) => [...prev, p]);
    syncToCloud("create", "Product", p.id, data);
    return p;
  }, [syncToCloud]);
  const updateProduct: DataCtx["updateProduct"] = useCallback(async (id, data) => {
    const existing = await db.products.get(id);
    if (!existing) return;
    const next = { ...existing, ...data };
    await db.products.put(next);
    setProducts((prev) => prev.map((p) => (p.id === id ? next : p)));
    syncToCloud("update", "Product", id, data);
  }, [syncToCloud]);
  const deleteProduct: DataCtx["deleteProduct"] = useCallback(async (id) => {
    await db.products.remove(id);
    const related = (await db.warranties.all()).filter((w) => w.productId === id);
    await Promise.all(related.map((w) => db.warranties.remove(w.id)));
    setProducts((prev) => prev.filter((p) => p.id !== id));
    setWarranties((prev) => prev.filter((w) => w.productId !== id));
    syncToCloud("delete", "Product", id);
  }, [syncToCloud]);

  // ---------- Warranties ----------
  const addWarranty: DataCtx["addWarranty"] = useCallback(async (data) => {
    const w: Warranty = { id: uid(), createdAt: Date.now(), ...data };
    await db.warranties.put(w);
    setWarranties((prev) => [...prev, w]);
    syncToCloud("create", "Warranty", w.id, data);
    return w;
  }, [syncToCloud]);
  const updateWarranty: DataCtx["updateWarranty"] = useCallback(async (id, data) => {
    const existing = await db.warranties.get(id);
    if (!existing) return;
    const next = { ...existing, ...data };
    await db.warranties.put(next);
    setWarranties((prev) => prev.map((w) => (w.id === id ? next : w)));
    syncToCloud("update", "Warranty", id, data);
  }, [syncToCloud]);
  const deleteWarranty: DataCtx["deleteWarranty"] = useCallback(async (id) => {
    await db.warranties.remove(id);
    setWarranties((prev) => prev.filter((w) => w.id !== id));
    syncToCloud("delete", "Warranty", id);
  }, [syncToCloud]);

  // ---------- Attributes ----------
  const addCategory: DataCtx["addCategory"] = useCallback(async (name) => {
    const c: Category = { id: uid(), createdAt: Date.now(), name: name.trim() };
    await db.categories.put(c);
    setCategories((prev) => [...prev, c]);
    syncToCloud("create", "Category", c.id, { name: name.trim() });
    return c;
  }, [syncToCloud]);
  const updateCategory: DataCtx["updateCategory"] = useCallback(async (id, name) => {
    const existing = await db.categories.get(id);
    if (!existing) return;
    const next = { ...existing, name: name.trim() };
    await db.categories.put(next);
    setCategories((prev) => prev.map((c) => (c.id === id ? next : c)));
    syncToCloud("update", "Category", id, { name: name.trim() });
  }, [syncToCloud]);
  const deleteCategory: DataCtx["deleteCategory"] = useCallback(async (id) => {
    await db.categories.remove(id);
    setCategories((prev) => prev.filter((c) => c.id !== id));
    syncToCloud("delete", "Category", id);
  }, [syncToCloud]);

  const addBrand: DataCtx["addBrand"] = useCallback(async (name) => {
    const b: Brand = { id: uid(), createdAt: Date.now(), name: name.trim() };
    await db.brands.put(b);
    setBrands((prev) => [...prev, b]);
    syncToCloud("create", "Brand", b.id, { name: name.trim() });
    return b;
  }, [syncToCloud]);
  const updateBrand: DataCtx["updateBrand"] = useCallback(async (id, name) => {
    const existing = await db.brands.get(id);
    if (!existing) return;
    const next = { ...existing, name: name.trim() };
    await db.brands.put(next);
    setBrands((prev) => prev.map((b) => (b.id === id ? next : b)));
    syncToCloud("update", "Brand", id, { name: name.trim() });
  }, [syncToCloud]);
  const deleteBrand: DataCtx["deleteBrand"] = useCallback(async (id) => {
    await db.brands.remove(id);
    setBrands((prev) => prev.filter((b) => b.id !== id));
    syncToCloud("delete", "Brand", id);
  }, [syncToCloud]);

  const addModel: DataCtx["addModel"] = useCallback(async (name) => {
    const m: Model = { id: uid(), createdAt: Date.now(), name: name.trim() };
    await db.models.put(m);
    setModels((prev) => [...prev, m]);
    syncToCloud("create", "Model", m.id, { name: name.trim() });
    return m;
  }, [syncToCloud]);
  const updateModel: DataCtx["updateModel"] = useCallback(async (id, name) => {
    const existing = await db.models.get(id);
    if (!existing) return;
    const next = { ...existing, name: name.trim() };
    await db.models.put(next);
    setModels((prev) => prev.map((m) => (m.id === id ? next : m)));
    syncToCloud("update", "Model", id, { name: name.trim() });
  }, [syncToCloud]);
  const deleteModel: DataCtx["deleteModel"] = useCallback(async (id) => {
    await db.models.remove(id);
    setModels((prev) => prev.filter((m) => m.id !== id));
    syncToCloud("delete", "Model", id);
  }, [syncToCloud]);

  // ---------- Suppliers ----------
  const addSupplier: DataCtx["addSupplier"] = useCallback(async (data) => {
    const s: Supplier = { id: uid(), createdAt: Date.now(), ...data };
    await db.suppliers.put(s);
    setSuppliers((prev) => [...prev, s]);
    syncToCloud("create", "Supplier", s.id, data);
    return s;
  }, [syncToCloud]);
  const updateSupplier: DataCtx["updateSupplier"] = useCallback(async (id, data) => {
    const existing = await db.suppliers.get(id);
    if (!existing) return;
    const next = { ...existing, ...data };
    await db.suppliers.put(next);
    setSuppliers((prev) => prev.map((s) => (s.id === id ? next : s)));
    syncToCloud("update", "Supplier", id, data);
  }, [syncToCloud]);
  const deleteSupplier: DataCtx["deleteSupplier"] = useCallback(async (id) => {
    await db.suppliers.remove(id);
    setSuppliers((prev) => prev.filter((s) => s.id !== id));
    syncToCloud("delete", "Supplier", id);
  }, [syncToCloud]);

  // ---------- Repairs ----------
  const addRepair: DataCtx["addRepair"] = useCallback(async (data) => {
    const r: Repair = { id: uid(), createdAt: Date.now(), ...data };
    await db.repairs.put(r);
    setRepairs((prev) => [...prev, r]);
    syncToCloud("create", "Repair", r.id, data);
    return r;
  }, [syncToCloud]);
  const updateRepair: DataCtx["updateRepair"] = useCallback(async (id, data) => {
    const existing = await db.repairs.get(id);
    if (!existing) return;
    const next = { ...existing, ...data };
    await db.repairs.put(next);
    setRepairs((prev) => prev.map((r) => (r.id === id ? next : r)));
    syncToCloud("update", "Repair", id, data);
  }, [syncToCloud]);
  const deleteRepair: DataCtx["deleteRepair"] = useCallback(async (id) => {
    await db.repairs.remove(id);
    setRepairs((prev) => prev.filter((r) => r.id !== id));
    syncToCloud("delete", "Repair", id);
  }, [syncToCloud]);

  // ---------- Expenses ----------
  const addExpense: DataCtx["addExpense"] = useCallback(async (data) => {
    const e: Expense = { id: uid(), createdAt: Date.now(), ...data };
    await db.expenses.put(e);
    setExpenses((prev) => [...prev, e]);
    syncToCloud("create", "Expense", e.id, data);
    return e;
  }, [syncToCloud]);
  const updateExpense: DataCtx["updateExpense"] = useCallback(async (id, data) => {
    const existing = await db.expenses.get(id);
    if (!existing) return;
    const next = { ...existing, ...data };
    await db.expenses.put(next);
    setExpenses((prev) => prev.map((e) => (e.id === id ? next : e)));
    syncToCloud("update", "Expense", id, data);
  }, [syncToCloud]);
  const deleteExpense: DataCtx["deleteExpense"] = useCallback(async (id) => {
    await db.expenses.remove(id);
    setExpenses((prev) => prev.filter((e) => e.id !== id));
    syncToCloud("delete", "Expense", id);
  }, [syncToCloud]);

  const addCheque: DataCtx["addCheque"] = useCallback(async (data) => {
    const c = { id: uid(), ...data, createdAt: Date.now() };
    await db.cheques.put(c);
    setCheques((prev) => [...prev, c]);
    syncToCloud("create", "Cheque", c.id, data);
    return c;
  }, [syncToCloud]);
  const updateCheque: DataCtx["updateCheque"] = useCallback(async (id, data) => {
    const existing = await db.cheques.get(id);
    if (!existing) return;
    const next = { ...existing, ...data } as Cheque;
    await db.cheques.put(next);
    setCheques((prev) => prev.map((c) => (c.id === id ? next : c)));
    syncToCloud("update", "Cheque", id, data);
  }, [syncToCloud]);
  const deleteCheque: DataCtx["deleteCheque"] = useCallback(async (id) => {
    await db.cheques.remove(id);
    setCheques((prev) => prev.filter((c) => c.id !== id));
    syncToCloud("delete", "Cheque", id);
  }, [syncToCloud]);

  const addInvoice: DataCtx["addInvoice"] = useCallback(async (data, items) => {
    const invId = uid();
    const inv = { id: invId, ...data, createdAt: Date.now() };
    await db.invoices.put(inv);
    setInvoices((prev) => [...prev, inv]);
    syncToCloud("create", "Invoice", inv.id, data);

    const savedItems: InvoiceItem[] = [];
    for (const item of items) {
      const itemWithId = { id: uid(), invoiceId: invId, ...item };
      await db.invoiceItems.put(itemWithId);
      savedItems.push(itemWithId);
      syncToCloud("create", "InvoiceItem", itemWithId.id, item);
    }
    setInvoiceItems((prev) => [...prev, ...savedItems]);

    return { ...inv, items: savedItems };
  }, [syncToCloud]);

  const deleteInvoice: DataCtx["deleteInvoice"] = useCallback(async (id) => {
    await db.invoices.remove(id);
    setInvoices((prev) => prev.filter((i) => i.id !== id));
    syncToCloud("delete", "Invoice", id);

    const related = invoiceItems.filter((ii) => ii.invoiceId === id);
    for (const item of related) {
      await db.invoiceItems.remove(item.id);
      syncToCloud("delete", "InvoiceItem", item.id);
    }
    setInvoiceItems((prev) => prev.filter((ii) => ii.invoiceId !== id));
  }, [invoiceItems, syncToCloud]);

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
    ready, customers, products, warranties, warrantyViews, categories, brands, models, suppliers, repairs, expenses, cheques, invoices, invoiceItems,
    addCustomer, updateCustomer, deleteCustomer,
    addProduct, updateProduct, deleteProduct,
    addWarranty, updateWarranty, deleteWarranty,
    addCategory, updateCategory, deleteCategory,
    addBrand, updateBrand, deleteBrand,
    addModel, updateModel, deleteModel,
    addSupplier, updateSupplier, deleteSupplier,
    addRepair, updateRepair, deleteRepair,
    addExpense, updateExpense, deleteExpense,
    addCheque, updateCheque, deleteCheque,
    addInvoice, deleteInvoice,
    exportBackup, importBackup, resetAll,
  };

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useData() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useData must be inside <DataProvider>");
  return ctx;
}
