// ============================================================
// Shop branding (name, phone, address) for the printed PDF.
// Stored in localStorage — independent of warranty data.
// ============================================================
import { createContext, useCallback, useContext, useEffect, useState, ReactNode } from "react";

export interface ShopInfo {
  name: string;
  phone: string;
  address: string;
}

const KEY = "warrantyops.shop";
const DEFAULTS: ShopInfo = { name: "WarrantyOps", phone: "", address: "" };

interface Ctx {
  shop: ShopInfo;
  saveShop: (s: ShopInfo) => void;
}

const ShopCtx = createContext<Ctx | null>(null);

export function ShopProvider({ children }: { children: ReactNode }) {
  const [shop, setShop] = useState<ShopInfo>(DEFAULTS);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(KEY);
      if (raw) setShop({ ...DEFAULTS, ...JSON.parse(raw) });
    } catch { /* ignore */ }
  }, []);

  const saveShop = useCallback((s: ShopInfo) => {
    setShop(s);
    localStorage.setItem(KEY, JSON.stringify(s));
  }, []);

  return <ShopCtx.Provider value={{ shop, saveShop }}>{children}</ShopCtx.Provider>;
}

export function useShop() {
  const ctx = useContext(ShopCtx);
  if (!ctx) throw new Error("useShop must be inside <ShopProvider>");
  return ctx;
}
