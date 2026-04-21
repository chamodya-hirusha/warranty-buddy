import { useEffect, useMemo, useState } from "react";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import type { Warranty } from "@/db/types";
import { useData } from "@/hooks/useData";
import { calcExpiryDate, formatDate, todayISO, WARRANTY_PRESETS } from "@/utils/warranty";
import { toast } from "sonner";

interface Props {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  initial?: Warranty | null;
}

const PRESET_OPTIONS = [
  ...WARRANTY_PRESETS.map((m) => ({ value: String(m), label: m === 12 ? "12 months (1 year)" : `${m} months` })),
  { value: "custom", label: "Custom…" },
];

export function WarrantyDialog({ open, onOpenChange, initial }: Props) {
  const { addWarranty, updateWarranty, customers, products } = useData();

  const [customerId, setCustomerId] = useState("");
  const [productId, setProductId] = useState("");
  const [purchaseDate, setPurchaseDate] = useState(todayISO());
  const [preset, setPreset] = useState<string>("12");
  const [customMonths, setCustomMonths] = useState<string>("");
  const [notes, setNotes] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (!open) return;
    if (initial) {
      setCustomerId(initial.customerId);
      setProductId(initial.productId);
      setPurchaseDate(initial.purchaseDate);
      const isPreset = (WARRANTY_PRESETS as readonly number[]).includes(initial.months);
      setPreset(isPreset ? String(initial.months) : "custom");
      setCustomMonths(isPreset ? "" : String(initial.months));
      setNotes(initial.notes ?? "");
    } else {
      setCustomerId(""); setProductId("");
      setPurchaseDate(todayISO()); setPreset("12"); setCustomMonths(""); setNotes("");
    }
    setErrors({});
  }, [open, initial]);

  const months = preset === "custom" ? Number(customMonths) : Number(preset);

  const previewExpiry = useMemo(() => {
    if (!purchaseDate || !months || months <= 0) return null;
    try { return calcExpiryDate(purchaseDate, months); } catch { return null; }
  }, [purchaseDate, months]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const next: Record<string, string> = {};
    if (!customerId) next.customerId = "Pick a customer";
    if (!productId) next.productId = "Pick a product";
    if (!purchaseDate) next.purchaseDate = "Pick a date";
    if (!months || isNaN(months) || months <= 0 || months > 600) next.months = "Enter valid months (1–600)";
    setErrors(next);
    if (Object.keys(next).length) return;

    const payload = { customerId, productId, purchaseDate, months, notes: notes.trim() || undefined };
    if (initial) {
      await updateWarranty(initial.id, payload);
      toast.success("Warranty updated");
    } else {
      await addWarranty(payload);
      toast.success("Warranty registered");
    }
    onOpenChange(false);
  };

  const noCustomers = customers.length === 0;
  const noProducts = products.length === 0;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>{initial ? "Edit warranty" : "Register warranty"}</DialogTitle>
        </DialogHeader>

        {(noCustomers || noProducts) ? (
          <p className="text-sm text-muted-foreground">
            Add at least one {noCustomers ? "customer" : "product"} first.
          </p>
        ) : (
          <form onSubmit={submit} className="space-y-4">
            <div className="grid sm:grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label>Customer</Label>
                <Select value={customerId} onValueChange={setCustomerId}>
                  <SelectTrigger><SelectValue placeholder="Select customer" /></SelectTrigger>
                  <SelectContent>
                    {customers.map((c) => (
                      <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.customerId && <p className="text-xs text-destructive">{errors.customerId}</p>}
              </div>
              <div className="space-y-1.5">
                <Label>Product</Label>
                <Select value={productId} onValueChange={setProductId}>
                  <SelectTrigger><SelectValue placeholder="Select product" /></SelectTrigger>
                  <SelectContent>
                    {products.map((p) => (
                      <SelectItem key={p.id} value={p.id}>{p.name} · {p.brand}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.productId && <p className="text-xs text-destructive">{errors.productId}</p>}
              </div>
            </div>

            <div className="grid sm:grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label htmlFor="pdate">Purchase date</Label>
                <Input id="pdate" type="date" value={purchaseDate} max={todayISO()} onChange={(e) => setPurchaseDate(e.target.value)} />
                {errors.purchaseDate && <p className="text-xs text-destructive">{errors.purchaseDate}</p>}
              </div>
              <div className="space-y-1.5">
                <Label>Warranty period</Label>
                <Select value={preset} onValueChange={setPreset}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {PRESET_OPTIONS.map((o) => (
                      <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {preset === "custom" && (
              <div className="space-y-1.5">
                <Label htmlFor="cm">Custom months</Label>
                <Input id="cm" type="number" min={1} max={600} value={customMonths} onChange={(e) => setCustomMonths(e.target.value)} placeholder="e.g. 18" />
              </div>
            )}
            {errors.months && <p className="text-xs text-destructive">{errors.months}</p>}

            <div className="space-y-1.5">
              <Label htmlFor="notes">Notes (optional)</Label>
              <Textarea id="notes" rows={2} value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Invoice #, condition, etc." />
            </div>

            {previewExpiry && (
              <div className="rounded-lg border bg-accent text-accent-foreground px-3 py-2 text-sm">
                Expires on <strong>{formatDate(previewExpiry)}</strong>
              </div>
            )}

            <DialogFooter>
              <Button type="button" variant="ghost" onClick={() => onOpenChange(false)}>Cancel</Button>
              <Button type="submit">{initial ? "Save" : "Register"}</Button>
            </DialogFooter>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}
