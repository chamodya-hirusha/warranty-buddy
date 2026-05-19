"use client";

import { useEffect, useRef, useState } from "react";
import { useData } from "@/hooks/useData";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { 
  Download, 
  Upload, 
  Trash2, 
  Moon, 
  Sun, 
  ShieldHalf, 
  Store, 
  Save, 
  Image as ImageIcon,
  Check,
  ChevronRight,
  Database
} from "lucide-react";
import { useTheme } from "@/hooks/useTheme";
import { useShop } from "@/hooks/useShop";
import { ConfirmDialog } from "@/components/ConfirmDialog";
import { toast } from "sonner";
import type { BackupFile } from "@/db/types";
import { cn } from "@/lib/utils";

export default function SettingsPage() {
  const { theme, toggle } = useTheme();
  const { exportBackup, importBackup, resetAll, customers, products, warranties } = useData();
  const { shop, saveShop } = useShop();
  const fileRef = useRef<HTMLInputElement>(null);
  const [resetting, setResetting] = useState(false);

  const [shopForm, setShopForm] = useState(shop);
  useEffect(() => { setShopForm(shop); }, [shop]);
  const dirty =
    shopForm.name !== shop.name ||
    shopForm.phone !== shop.phone ||
    shopForm.address !== shop.address ||
    shopForm.logo !== shop.logo;

  const onExport = () => {
    const data = exportBackup();
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `warranty-backup-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success("Backup downloaded successfully");
  };

  const onImport = async (file: File, mode: "merge" | "replace") => {
    try {
      const text = await file.text();
      const json = JSON.parse(text) as BackupFile;
      await importBackup(json, mode);
      toast.success(`Successfully imported database (${mode} mode)`);
    } catch (err) {
      console.error(err);
      toast.error("Could not import backup file. Ensure it is a valid backup JSON format.");
    }
  };

  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 2 * 1024 * 1024) {
      toast.error("Logo file size must be less than 2MB");
      return;
    }
    const reader = new FileReader();
    reader.onload = (event) => {
      setShopForm((prev) => ({ ...prev, logo: event.target?.result as string }));
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className="space-y-12 max-w-4xl mx-auto pb-16">
      
      {/* Header section */}
      <div className="border-b border-neutral-100 dark:border-neutral-800/80 pb-6">
        <h1 className="text-2xl font-semibold tracking-tight text-neutral-900 dark:text-neutral-50">Settings</h1>
        <p className="text-sm text-neutral-500 dark:text-neutral-400 mt-1">Configure your offline PWA environment, printed receipt assets, and database backups.</p>
      </div>

      <div className="space-y-12 divide-y divide-neutral-100 dark:divide-neutral-800/80">
        
        {/* Section 1: Shop Details & Branding */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 pt-8">
          <div className="md:col-span-1">
            <h2 className="text-sm font-semibold uppercase tracking-wider text-neutral-400 dark:text-neutral-500">Shop Profile</h2>
            <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-2 leading-relaxed">
              Define your shop name and business address. The uploaded brand logo will appear instantly on all generated warranty PDFs and invoices.
            </p>
          </div>
          <div className="md:col-span-2 space-y-6 bg-white dark:bg-neutral-900/60 border border-neutral-100 dark:border-neutral-800/80 rounded-2xl p-6 shadow-sm">
            
            {/* Logo Upload Zone */}
            <div className="space-y-2">
              <Label className="text-xs font-semibold text-neutral-500 dark:text-neutral-400">Shop Branding Logo</Label>
              <div className="flex items-center gap-6">
                <div className="relative group h-20 w-20 rounded-2xl bg-neutral-50 dark:bg-neutral-950 border border-neutral-200/50 dark:border-neutral-800/60 shadow-inner flex items-center justify-center overflow-hidden transition-all duration-300 hover:border-neutral-300 dark:hover:border-neutral-700">
                  {shopForm.logo ? (
                    <img src={shopForm.logo} alt="Shop logo" className="h-full w-full object-contain p-1" />
                  ) : (
                    <ImageIcon className="h-7 w-7 text-neutral-300 dark:text-neutral-700" />
                  )}
                </div>
                <div className="space-y-2">
                  <input
                    type="file"
                    accept="image/*"
                    id="logo-picker"
                    className="hidden"
                    onChange={handleLogoChange}
                  />
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      type="button"
                      onClick={() => document.getElementById("logo-picker")?.click()}
                      className="rounded-xl border-neutral-200 dark:border-neutral-800 text-xs font-medium hover:bg-neutral-50 dark:hover:bg-neutral-950 transition-all duration-200"
                    >
                      Choose New Image
                    </Button>
                    {shopForm.logo && (
                      <Button
                        variant="ghost"
                        size="sm"
                        type="button"
                        onClick={() => setShopForm((prev) => ({ ...prev, logo: "" }))}
                        className="rounded-xl text-neutral-400 hover:text-red-500 text-xs transition-all duration-200"
                      >
                        Remove
                      </Button>
                    )}
                  </div>
                  <p className="text-[10px] text-neutral-400 dark:text-neutral-500">Supported formats: PNG, JPG under 2MB</p>
                </div>
              </div>
            </div>

            {/* Input grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="shop-name" className="text-xs font-semibold text-neutral-500 dark:text-neutral-400">Shop name</Label>
                <Input 
                  id="shop-name" 
                  value={shopForm.name}
                  onChange={(e) => setShopForm({ ...shopForm, name: e.target.value })}
                  placeholder="WarrantyOps" 
                  className="rounded-xl bg-neutral-50/50 dark:bg-neutral-950/40 border-neutral-200/60 dark:border-neutral-800/80 focus-visible:ring-1 focus-visible:ring-neutral-950 dark:focus-visible:ring-neutral-200"
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="shop-phone" className="text-xs font-semibold text-neutral-500 dark:text-neutral-400">Phone</Label>
                <Input 
                  id="shop-phone" 
                  value={shopForm.phone}
                  onChange={(e) => setShopForm({ ...shopForm, phone: e.target.value })}
                  placeholder="+1 555 123 4567" 
                  className="rounded-xl bg-neutral-50/50 dark:bg-neutral-950/40 border-neutral-200/60 dark:border-neutral-800/80 focus-visible:ring-1 focus-visible:ring-neutral-950 dark:focus-visible:ring-neutral-200"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="shop-address" className="text-xs font-semibold text-neutral-500 dark:text-neutral-400">Address</Label>
              <Textarea 
                id="shop-address" 
                rows={2} 
                value={shopForm.address}
                onChange={(e) => setShopForm({ ...shopForm, address: e.target.value })}
                placeholder="123 Luxury Avenue, Colombo" 
                className="rounded-xl bg-neutral-50/50 dark:bg-neutral-950/40 border-neutral-200/60 dark:border-neutral-800/80 focus-visible:ring-1 focus-visible:ring-neutral-950 dark:focus-visible:ring-neutral-200 resize-none"
              />
            </div>

            <div className="flex justify-end pt-2">
              <Button
                disabled={!dirty || !shopForm.name.trim()}
                onClick={() => { 
                  saveShop({ ...shopForm, name: shopForm.name.trim() }); 
                  toast.success("Shop details saved"); 
                }}
                className="rounded-xl bg-neutral-900 hover:bg-neutral-800 text-white dark:bg-neutral-50 dark:hover:bg-neutral-200 dark:text-neutral-900 font-medium px-5 py-2 transition-all duration-200 disabled:opacity-40"
              >
                <Save className="h-4 w-4 mr-2" /> Save Changes
              </Button>
            </div>
          </div>
        </div>

        {/* Section 2: Appearance & Light/Dark Segmented Toggle */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 pt-8">
          <div className="md:col-span-1">
            <h2 className="text-sm font-semibold uppercase tracking-wider text-neutral-400 dark:text-neutral-500">Appearance</h2>
            <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-2 leading-relaxed">
              Switch themes cleanly. Select between a minimalist light view or a low-fatigue slate dark mode.
            </p>
          </div>
          <div className="md:col-span-2 bg-white dark:bg-neutral-900/60 border border-neutral-100 dark:border-neutral-800/80 rounded-2xl p-6 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <p className="text-sm font-medium text-neutral-900 dark:text-neutral-100">Interface Theme</p>
              <p className="text-xs text-neutral-400 dark:text-neutral-500">Toggles background styling PWA-wide.</p>
            </div>
            
            {/* Apple-style Segmented Theme Toggle */}
            <div className="bg-neutral-100 dark:bg-neutral-950 p-1 rounded-xl flex gap-1 border border-neutral-200/30 dark:border-neutral-800/30">
              <button 
                onClick={() => theme === "dark" && toggle()}
                className={cn(
                  "inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-200",
                  theme === "light" 
                    ? "bg-white dark:bg-neutral-900 text-neutral-950 dark:text-neutral-50 shadow-sm"
                    : "text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-200"
                )}
              >
                <Sun className="h-3.5 w-3.5" /> Light Mode
              </button>
              <button 
                onClick={() => theme === "light" && toggle()}
                className={cn(
                  "inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-200",
                  theme === "dark" 
                    ? "bg-white dark:bg-neutral-900 text-neutral-950 dark:text-neutral-50 shadow-sm"
                    : "text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-200"
                )}
              >
                <Moon className="h-3.5 w-3.5" /> Dark Mode
              </button>
            </div>
          </div>
        </div>

        {/* Section 3: Backup & Restore */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 pt-8">
          <div className="md:col-span-1">
            <h2 className="text-sm font-semibold uppercase tracking-wider text-neutral-400 dark:text-neutral-500">Backup & Restore</h2>
            <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-2 leading-relaxed">
              Import and export full backups directly from your client-side IndexedDB database storage. Keep your offline data secure.
            </p>
          </div>
          <div className="md:col-span-2 space-y-4">
            
            {/* Export Card */}
            <div className="bg-white dark:bg-neutral-900/60 border border-neutral-100 dark:border-neutral-800/80 rounded-2xl p-6 shadow-sm flex items-center justify-between">
              <div className="space-y-1">
                <p className="text-sm font-medium text-neutral-900 dark:text-neutral-100 flex items-center gap-2">
                  <Database className="h-4 w-4 text-neutral-400" /> Export Database Backup
                </p>
                <p className="text-xs text-neutral-400 dark:text-neutral-500">
                  Saves <strong className="text-neutral-600 dark:text-neutral-300">{customers.length}</strong> customers, <strong className="text-neutral-600 dark:text-neutral-300">{products.length}</strong> products, and <strong className="text-neutral-600 dark:text-neutral-300">{warranties.length}</strong> warranties.
                </p>
              </div>
              <Button 
                onClick={onExport}
                className="rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white hover:bg-neutral-50 dark:bg-neutral-900 dark:hover:bg-neutral-950 text-neutral-800 dark:text-neutral-200 text-xs font-semibold px-4 py-2 flex items-center transition-all duration-200 shadow-sm"
              >
                <Download className="h-3.5 w-3.5 mr-2" /> Export
              </Button>
            </div>

            {/* Import Card */}
            <div className="bg-white dark:bg-neutral-900/60 border border-neutral-100 dark:border-neutral-800/80 rounded-2xl p-6 shadow-sm flex items-center justify-between">
              <div className="space-y-1">
                <p className="text-sm font-medium text-neutral-900 dark:text-neutral-100 flex items-center gap-2">
                  <Upload className="h-4 w-4 text-neutral-400" /> Import Backup Schema
                </p>
                <p className="text-xs text-neutral-400 dark:text-neutral-500">
                  Merge records or replace all current local database entries.
                </p>
              </div>
              <div>
                <Button 
                  onClick={() => fileRef.current?.click()}
                  className="rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white hover:bg-neutral-50 dark:bg-neutral-900 dark:hover:bg-neutral-950 text-neutral-800 dark:text-neutral-200 text-xs font-semibold px-4 py-2 flex items-center transition-all duration-200 shadow-sm"
                >
                  <Upload className="h-3.5 w-3.5 mr-2" /> Choose File
                </Button>
                <input
                  ref={fileRef}
                  type="file"
                  accept="application/json"
                  hidden
                  onChange={async (e) => {
                    const f = e.target.files?.[0];
                    e.target.value = "";
                    if (!f) return;
                    const replace = window.confirm("Replace existing database data? OK = Replace all, Cancel = Merge with current");
                    await onImport(f, replace ? "replace" : "merge");
                  }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Section 4: Danger Zone */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 pt-8">
          <div className="md:col-span-1">
            <h2 className="text-sm font-semibold uppercase tracking-wider text-neutral-400 dark:text-neutral-500">Danger Zone</h2>
            <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-2 leading-relaxed">
              Highly critical operations. These actions permanently wipe local database schemas and cannot be reverted.
            </p>
          </div>
          <div className="md:col-span-2 bg-white dark:bg-neutral-900/60 border border-neutral-100 dark:border-neutral-800/80 rounded-2xl p-6 shadow-sm flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-neutral-900 dark:text-neutral-100">Reset Local Database</p>
              <p className="text-xs text-neutral-400 dark:text-neutral-500">Wipes all stored local history.</p>
            </div>
            <Button 
              variant="destructive" 
              onClick={() => setResetting(true)}
              className="rounded-xl bg-red-50 hover:bg-red-100/80 dark:bg-red-950/20 dark:hover:bg-red-950/30 text-red-600 dark:text-red-400 text-xs font-semibold px-4 py-2 transition-all duration-200"
            >
              <Trash2 className="h-3.5 w-3.5 mr-2" /> Wipe Data
            </Button>
          </div>
        </div>

        {/* Section 5: Metadata & About Footer */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 pt-8 border-t border-neutral-100 dark:border-neutral-800/80">
          <div className="md:col-span-1"></div>
          <div className="md:col-span-2 flex items-center gap-4 text-xs text-neutral-400 dark:text-neutral-500">
            <div className="h-10 w-10 rounded-2xl flex items-center justify-center text-primary-foreground"
                 style={{ background: "var(--gradient-primary)" }}>
              <ShieldHalf className="h-5 w-5" />
            </div>
            <div>
              <p className="font-semibold text-neutral-800 dark:text-neutral-200">WarrantyOps Suite</p>
              <p className="leading-normal">Offline-first local PWA · v1.0.0 · Local IndexedDB active</p>
            </div>
          </div>
        </div>

      </div>

      <ConfirmDialog
        open={resetting}
        onOpenChange={setResetting}
        title="Permanently Wipe All Local Data?"
        description="This will instantly purge all client-side IndexedDB databases, including customers, products, stock entries, and warranties. This action is final. Ensure you export a backup first."
        confirmLabel="Yes, Wipe Database"
        onConfirm={async () => { 
          await resetAll(); 
          setResetting(false); 
          toast.success("Database fully reset"); 
        }}
      />
    </div>
  );
}
