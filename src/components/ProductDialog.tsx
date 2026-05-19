"use client";

import { useEffect } from "react";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { useForm } from "react-hook-form";
import { useData } from "@/hooks/useData";
import { toast } from "sonner";
import type { Product } from "@/db/types";

interface Props {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  initial?: Product | null;
}

interface FormValues {
  name: string;
  sku: string;
  serial: string;
  barcode: string;
  costPrice: string;
  sellPrice: string;
  quantity: string;
  warrantyPeriod: string;
  categoryId: string;
  brandId: string;
  modelId: string;
  supplierId: string;
}

export function ProductDialog({ open, onOpenChange, initial }: Props) {
  const { addProduct, updateProduct, products, categories, brands, models, suppliers } = useData();

  const { register, handleSubmit, reset, formState: { errors } } = useForm<FormValues>({
    defaultValues: {
      name: "", sku: "", serial: "", barcode: "",
      costPrice: "0", sellPrice: "0", quantity: "0", warrantyPeriod: "",
      categoryId: "", brandId: "", modelId: "", supplierId: ""
    }
  });

  useEffect(() => {
    if (open) {
      reset({
        name: initial?.name ?? "",
        sku: initial?.sku ?? "",
        serial: initial?.serial ?? "",
        barcode: initial?.barcode ?? "",
        costPrice: initial?.costPrice?.toString() ?? "0",
        sellPrice: initial?.sellPrice?.toString() ?? "0",
        quantity: initial?.quantity?.toString() ?? "0",
        warrantyPeriod: initial?.warrantyPeriod?.toString() ?? "",
        categoryId: initial?.categoryId ?? "",
        brandId: initial?.brandId ?? "",
        modelId: initial?.modelId ?? "",
        supplierId: initial?.supplierId ?? "",
      });
    }
  }, [open, initial, reset]);

  const onSubmit = async (data: FormValues) => {
    const s = data.serial.trim().toLowerCase();
    if (s) {
      const dupe = products.find((p) => p.serial?.toLowerCase() === s && p.id !== initial?.id);
      if (dupe) {
        toast.error("This serial number is already in use.");
        return;
      }
    }

    const payload = {
      name: data.name.trim(),
      sku: data.sku.trim() || undefined,
      serial: data.serial.trim() || undefined,
      barcode: data.barcode.trim() || undefined,
      costPrice: parseFloat(data.costPrice) || 0,
      sellPrice: parseFloat(data.sellPrice) || 0,
      quantity: parseInt(data.quantity, 10) || 0,
      warrantyPeriod: data.warrantyPeriod ? parseInt(data.warrantyPeriod, 10) : undefined,
      categoryId: data.categoryId || undefined,
      brandId: data.brandId || undefined,
      modelId: data.modelId || undefined,
      supplierId: data.supplierId || undefined,
    };

    if (initial) {
      await updateProduct(initial.id, payload);
      toast.success("Product updated");
    } else {
      await addProduct(payload);
      toast.success("Product added");
    }
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{initial ? "Edit Product" : "New Product"}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 py-2">
          
          <div className="space-y-1.5">
            <Label htmlFor="name">Product Name</Label>
            <Input id="name" placeholder="MacBook Pro 14" {...register("name", { required: "Name is required" })} />
            {errors.name && <p className="text-xs text-destructive">{errors.name.message}</p>}
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="categoryId">Category</Label>
              <select id="categoryId" className="flex h-9 w-full items-center justify-between whitespace-nowrap rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-1 focus:ring-ring" {...register("categoryId")}>
                <option value="">None</option>
                {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="brandId">Brand</Label>
              <select id="brandId" className="flex h-9 w-full items-center justify-between whitespace-nowrap rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-1 focus:ring-ring" {...register("brandId")}>
                <option value="">None</option>
                {brands.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="modelId">Model</Label>
              <select id="modelId" className="flex h-9 w-full items-center justify-between whitespace-nowrap rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-1 focus:ring-ring" {...register("modelId")}>
                <option value="">None</option>
                {models.map(m => <option key={m.id} value={m.id}>{m.name}</option>)}
              </select>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="supplierId">Supplier</Label>
              <select id="supplierId" className="flex h-9 w-full items-center justify-between whitespace-nowrap rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-1 focus:ring-ring" {...register("supplierId")}>
                <option value="">None</option>
                {suppliers.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="sku">SKU</Label>
              <Input id="sku" placeholder="SKU-123" {...register("sku")} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="serial">Serial Number</Label>
              <Input id="serial" placeholder="S/N" {...register("serial")} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="barcode">Barcode</Label>
              <Input id="barcode" placeholder="123456789" {...register("barcode")} />
            </div>
          </div>

          <div className="grid grid-cols-4 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="costPrice">Cost Price</Label>
              <Input id="costPrice" type="number" step="0.01" {...register("costPrice")} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="sellPrice">Sell Price</Label>
              <Input id="sellPrice" type="number" step="0.01" {...register("sellPrice")} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="quantity">Quantity</Label>
              <Input id="quantity" type="number" {...register("quantity")} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="warrantyPeriod">Warranty (Months)</Label>
              <Input id="warrantyPeriod" type="number" placeholder="12" {...register("warrantyPeriod")} />
            </div>
          </div>

          <DialogFooter className="pt-2">
            <Button type="button" variant="ghost" onClick={() => onOpenChange(false)}>Cancel</Button>
            <Button type="submit">{initial ? "Save changes" : "Add Product"}</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
