// ============================================================
// Warranty math + status helpers
// ----
// expiryDate = purchaseDate + months
// status:
//   "expired" if today > expiry
//   "soon"    if 0 <= daysLeft <= 7
//   "active"  otherwise
// ----
// BUG FIX NOTE: naive `new Date(year, month + N)` overflows when
// the source day doesn't exist in the target month (e.g. Jan 31 + 1m
// -> Mar 3). We use date-fns's `addMonths` which clamps to the last
// day of the target month — the correct behavior for warranties.
// ============================================================

import { addMonths, differenceInCalendarDays, format, parseISO } from "date-fns";
import type { Warranty, WarrantyStatus } from "@/db/types";

export const SOON_THRESHOLD_DAYS = 7;

export const WARRANTY_PRESETS = [3, 6, 12, 24, 36] as const;

export function calcExpiryDate(purchaseISO: string, months: number): Date {
  const start = parseISO(purchaseISO);
  return addMonths(start, months);
}

export function calcDaysLeft(purchaseISO: string, months: number, today: Date = new Date()): number {
  return differenceInCalendarDays(calcExpiryDate(purchaseISO, months), today);
}

export function calcStatus(daysLeft: number): WarrantyStatus {
  if (daysLeft < 0) return "expired";
  if (daysLeft <= SOON_THRESHOLD_DAYS) return "soon";
  return "active";
}

export function formatDate(iso: string | Date): string {
  const d = typeof iso === "string" ? parseISO(iso) : iso;
  return format(d, "dd MMM yyyy");
}

export function todayISO(): string {
  return format(new Date(), "yyyy-MM-dd");
}

export function statusLabel(s: WarrantyStatus): string {
  return s === "active" ? "Active" : s === "soon" ? "Expiring soon" : "Expired";
}

export function describeWarranty(w: Warranty) {
  const expiry = calcExpiryDate(w.purchaseDate, w.months);
  const daysLeft = differenceInCalendarDays(expiry, new Date());
  return { expiry, daysLeft, status: calcStatus(daysLeft) };
}
