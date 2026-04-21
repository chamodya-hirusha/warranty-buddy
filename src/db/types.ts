// ============================================================
// Domain types for the Warranty Management System
// Beginner note: these are TypeScript "shapes" — not real data.
// They describe what each record looks like in IndexedDB.
// ============================================================

export interface Customer {
  id: string;
  name: string;
  phone: string;
  createdAt: number;
}

export interface Product {
  id: string;
  name: string;
  brand: string;
  serial: string;
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

export interface BackupFile {
  app: "warranty-manager";
  version: 1;
  exportedAt: string;
  customers: Customer[];
  products: Product[];
  warranties: Warranty[];
}
