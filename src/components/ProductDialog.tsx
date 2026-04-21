import { useEffect, useState } from "react";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import type { Product } from "@/db/types";
import { useData } from "@/hooks/useData";
import { toast } from "sonner";

interface Props {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  initial?: Product | null;
}

export function ProductDialog({ open, onOpenChange, initial }: Props) {
  const { addProduct, updateProduct, products } = useData();
  const [name, setName] = useState("");
  const [brand, setBrand] = useState("");
  const [serial, setSerial] = useState("");
  const [errors, setErrors] = useState<{ name?: string; brand?: string; serial?: string }>({});

  useEffect(() => {
    if (open) {
      setName(initial?.name ?? "");
      setBrand(initial?.brand ?? "");
      setSerial(initial?.serial ?? "");
      setErrors({});
    }
  }, [open, initial]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const next: typeof errors = {};
    if (!name.trim()) next.name = "Product name required";
    if (!brand.trim()) next.brand = "Brand required";
    if (!serial.trim()) next.serial = "Serial number required";
    else {
      const s = serial.trim().toLowerCase();
      const dupe = products.find((p) => p.serial.toLowerCase() === s && p.id !== initial?.id);
      if (dupe) next.serial = "This serial is already used";
    }
    setErrors(next);
    if (Object.keys(next).length) return;

    if (initial) {
      await updateProduct(initial.id, { name: name.trim(), brand: brand.trim(), serial: serial.trim() });
      toast.success("Product updated");
    } else {
      await addProduct({ name: name.trim(), brand: brand.trim(), serial: serial.trim() });
      toast.success("Product added");
    }
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{initial ? "Edit product" : "New product"}</DialogTitle>
        </DialogHeader>
        <form onSubmit={submit} className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="pname">Product name</Label>
            <Input id="pname" value={name} onChange={(e) => setName(e.target.value)} placeholder="MacBook Pro 14" autoFocus />
            {errors.name && <p className="text-xs text-destructive">{errors.name}</p>}
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="brand">Brand</Label>
              <Input id="brand" value={brand} onChange={(e) => setBrand(e.target.value)} placeholder="Apple" />
              {errors.brand && <p className="text-xs text-destructive">{errors.brand}</p>}
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="serial">Serial number</Label>
              <Input id="serial" className="mono" value={serial} onChange={(e) => setSerial(e.target.value)} placeholder="C02XXXXXX" />
              {errors.serial && <p className="text-xs text-destructive">{errors.serial}</p>}
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="ghost" onClick={() => onOpenChange(false)}>Cancel</Button>
            <Button type="submit">{initial ? "Save" : "Add product"}</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
