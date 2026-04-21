import { useEffect, useRef, useState } from "react";
import { useData } from "@/hooks/useData";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Download, Upload, Trash2, Moon, Sun, ShieldHalf, Store, Save } from "lucide-react";
import { useTheme } from "@/hooks/useTheme";
import { useShop } from "@/hooks/useShop";
import { ConfirmDialog } from "@/components/ConfirmDialog";
import { toast } from "sonner";
import type { BackupFile } from "@/db/types";

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
    shopForm.address !== shop.address;

  const onExport = () => {
    const data = exportBackup();
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `warranty-backup-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success("Backup downloaded");
  };

  const onImport = async (file: File, mode: "merge" | "replace") => {
    try {
      const text = await file.text();
      const json = JSON.parse(text) as BackupFile;
      await importBackup(json, mode);
      toast.success(`Imported (${mode})`);
    } catch (err) {
      console.error(err);
      toast.error("Could not import — invalid file");
    }
  };

  return (
    <div className="space-y-6 max-w-2xl">
      <Card title="Shop details">
        <div className="px-5 py-4 space-y-4">
          <p className="text-sm text-muted-foreground inline-flex items-center gap-2">
            <Store className="h-4 w-4" /> Shown on printed warranty receipts.
          </p>
          <div className="grid sm:grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="shop-name">Shop name</Label>
              <Input id="shop-name" value={shopForm.name}
                onChange={(e) => setShopForm({ ...shopForm, name: e.target.value })}
                placeholder="WarrantyOps" />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="shop-phone">Phone</Label>
              <Input id="shop-phone" value={shopForm.phone}
                onChange={(e) => setShopForm({ ...shopForm, phone: e.target.value })}
                placeholder="+1 555 123 4567" />
            </div>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="shop-address">Address</Label>
            <Textarea id="shop-address" rows={2} value={shopForm.address}
              onChange={(e) => setShopForm({ ...shopForm, address: e.target.value })}
              placeholder="Street, City" />
          </div>
          <div className="flex justify-end">
            <Button
              disabled={!dirty || !shopForm.name.trim()}
              onClick={() => { saveShop({ ...shopForm, name: shopForm.name.trim() }); toast.success("Shop details saved"); }}
            >
              <Save className="h-4 w-4 mr-2" /> Save
            </Button>
          </div>
        </div>
      </Card>

      <Card title="Appearance">
        <Row
          title="Dark mode"
          description="Easier on the eyes in low light."
          action={
            <Button variant="outline" onClick={toggle}>
              {theme === "dark" ? <Sun className="h-4 w-4 mr-2" /> : <Moon className="h-4 w-4 mr-2" />}
              {theme === "dark" ? "Switch to light" : "Switch to dark"}
            </Button>
          }
        />
      </Card>

      <Card title="Backup & restore">
        <Row
          title="Export data as JSON"
          description={`Saves ${customers.length} customers, ${products.length} products, ${warranties.length} warranties.`}
          action={<Button onClick={onExport}><Download className="h-4 w-4 mr-2" /> Export</Button>}
        />
        <Row
          title="Import a backup"
          description="Merge with current data, or replace everything."
          action={
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => fileRef.current?.click()}>
                <Upload className="h-4 w-4 mr-2" /> Choose file…
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
                  const replace = window.confirm("Replace existing data? OK = Replace, Cancel = Merge");
                  await onImport(f, replace ? "replace" : "merge");
                }}
              />
            </div>
          }
        />
      </Card>

      <Card title="Danger zone">
        <Row
          title="Reset all data"
          description="Wipes every customer, product and warranty from this device."
          action={
            <Button variant="destructive" onClick={() => setResetting(true)}>
              <Trash2 className="h-4 w-4 mr-2" /> Reset
            </Button>
          }
        />
      </Card>

      <Card title="About">
        <div className="px-5 py-4 flex items-center gap-3 text-sm text-muted-foreground">
          <div className="h-9 w-9 rounded-xl flex items-center justify-center text-primary-foreground"
               style={{ background: "var(--gradient-primary)" }}>
            <ShieldHalf className="h-4 w-4" />
          </div>
          <div>
            <p className="text-foreground font-medium">WarrantyOps</p>
            <p>Local-first PWA · v1.0 · Works offline</p>
          </div>
        </div>
      </Card>

      <ConfirmDialog
        open={resetting}
        onOpenChange={setResetting}
        title="Wipe all data?"
        description="This permanently deletes all local records. Export a backup first if you want to keep them."
        confirmLabel="Wipe everything"
        onConfirm={async () => { await resetAll(); setResetting(false); toast.success("All data cleared"); }}
      />
    </div>
  );
}

function Card({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="card-elevated">
      <h2 className="px-5 py-3 border-b font-semibold text-sm uppercase tracking-wide text-muted-foreground">{title}</h2>
      <div className="divide-y">{children}</div>
    </section>
  );
}
function Row({ title, description, action }: { title: string; description?: string; action: React.ReactNode }) {
  return (
    <div className="px-5 py-4 flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4 sm:justify-between">
      <div className="min-w-0">
        <p className="font-medium">{title}</p>
        {description && <p className="text-sm text-muted-foreground">{description}</p>}
      </div>
      <div className="shrink-0">{action}</div>
    </div>
  );
}
