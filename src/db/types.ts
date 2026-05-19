// ============================================================
// Domain types for the Warranty Management System
// Beginner note: these are TypeScript "shapes" — not real data.
// They describe what each record looks like in IndexedDB.
// ============================================================

export interface Customer {
  id: string;
  name: string;
  phone: string;
  whatsapp?: string;
  email?: string;
  address?: string;
  birthday?: string;
  createdAt: number;
}

export interface Category {
  id: string;
  name: string;
  createdAt: number;
}

export interface Brand {
  id: string;
  name: string;
  createdAt: number;
}

export interface Model {
  id: string;
  name: string;
  createdAt: number;
}

export interface Product {
  id: string;
  name: string;
  sku?: string;
  serial?: string;
  barcode?: string;
  costPrice: number;
  sellPrice: number;
  quantity: number;
  warrantyPeriod?: number; // months
  categoryId?: string;
  brandId?: string;
  modelId?: string;
  supplierId?: string;
  createdAt: number;
}

export interface Warranty {
  id: string;
  customerId: string;
  productId: string;
  /** ISO date string e.g. "2025-04-20" */
  purchaseDate: string;
  /** Warranty length in MONTHS */
  months: number;
  notes?: string;
  createdAt: number;
}

export type WarrantyStatus = "active" | "soon" | "expired";

export interface WarrantyView extends Warranty {
  customer?: Customer;
  product?: Product;
  expiryDate: string; // ISO
  daysLeft: number; // negative when expired
  status: WarrantyStatus;
}

export interface Supplier {
  id: string;
  name: string;
  company: string;
  phone: string;
  email?: string;
  createdAt: number;
}

export interface Repair {
  id: string;
  customerId: string;
  deviceId?: string;
  deviceName: string;
  problem: string;
  status: string;
  cost?: string;
  techNotes?: string;
  receivedDate?: string;
  deliveryDate?: string;
  createdAt: number;
}

export interface Expense {
  id: string;
  title: string;
  category: string;
  amount: number;
  date: string;
  createdAt: number;
}

export interface Cheque {
  id: string;
  number: string;
  bank: string;
  amount: number;
  date: string;
  status: "pending" | "cleared" | "returned";
  createdAt: number;
}

export interface InvoiceItem {
  id: string;
  invoiceId: string;
  productId: string;
  quantity: number;
  price: number;
}

export interface Invoice {
  id: string;
  number: string;
  customerId: string;
  total: number;
  date: string;
  createdAt: number;
  items?: InvoiceItem[];
}


export interface BackupFile {
  app: "warranty-manager";
  version: 1;
  exportedAt: string;
  customers: Customer[];
  products: Product[];
  warranties: Warranty[];
}
