"use client";

import { useState } from "react";
import { useData } from "@/hooks/useData";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, Pencil, Trash2, Search, Cpu, ChevronRight } from "lucide-react";
import Link from "next/link";
import { ProductDialog } from "@/components/ProductDialog";
import { ConfirmDialog } from "@/components/ConfirmDialog";
import { EmptyState } from "@/components/EmptyState";
import type { Product } from "@/db/types";
import { toast } from "sonner";

export default function ProductsPage() {
  const { products, warranties, brands, models, deleteProduct } = useData();
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Product | null>(null);
  const [confirming, setConfirming] = useState<Product | null>(null);
  const [q, setQ] = useState("");

  const getBrandName = (id?: string) => brands.find(b => b.id === id)?.name || "Unknown Brand";
  const getModelName = (id?: string) => models.find(m => m.id === id)?.name || "";

  const filtered = products.filter((p) =>
    [p.name, p.sku, p.serial, getBrandName(p.brandId), getModelName(p.modelId)].some((v) => v?.toLowerCase().includes(q.toLowerCase())),
  );

  const used = (id: string) => warranties.some((w) => w.productId === id);

  const onConfirmDelete = async () => {
    if (!confirming) return;
    await deleteProduct(confirming.id);
    toast.success("Product deleted");
    setConfirming(null);
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input className="pl-9" placeholder="Search by name, brand, model, SKU or serial" value={q} onChange={(e) => setQ(e.target.value)} />
        </div>
        <Button onClick={() => { setEditing(null); setOpen(true); }}>
          <Plus className="h-4 w-4 mr-1" /> Add product
        </Button>
      </div>

      {filtered.length === 0 ? (
        <EmptyState
          icon={<Cpu className="h-5 w-5" />}
          title={products.length === 0 ? "No products yet" : "No matches"}
          description={products.length === 0 ? "Add laptops, components or any item you want to track." : "Try a different search."}
          action={products.length === 0 ? <Button onClick={() => setOpen(true)}><Plus className="h-4 w-4 mr-1" /> Add product</Button> : undefined}
        />
      ) : (
        <ul className="grid sm:grid-cols-2 gap-3">
          {filtered.map((p) => {
            const brandName = getBrandName(p.brandId);
            const modelName = getModelName(p.modelId);
            return (
              <li key={p.id} className="card-elevated p-4 flex items-start justify-between gap-3">
                <Link href={`/products/${p.id}`} className="min-w-0 flex-1 group">
                  <p className="font-semibold truncate group-hover:text-primary inline-flex items-center gap-1">
                    {p.name} <ChevronRight className="h-4 w-4 opacity-0 group-hover:opacity-100 transition-opacity" />
                  </p>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {brandName} {modelName ? `· ${modelName}` : ""}
                  </p>
                  <div className="mt-2 text-xs text-muted-foreground flex gap-3">
                    {p.sku && <span>SKU: <span className="mono">{p.sku}</span></span>}
                    {p.serial && <span>SN: <span className="mono">{p.serial}</span></span>}
                  </div>
                  <div className="mt-1 text-xs text-muted-foreground flex gap-3">
                    <span>Stock: <span className="font-medium text-foreground">{p.quantity}</span></span>
                    <span>Price: <span className="font-medium text-foreground">${p.sellPrice.toFixed(2)}</span></span>
                  </div>
                  {used(p.id) && <span className="text-[11px] text-muted-foreground mt-1 inline-block">In use</span>}
                </Link>
                <div className="flex flex-col gap-1 shrink-0">
                  <Button variant="ghost" size="icon" onClick={() => { setEditing(p); setOpen(true); }}>
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="icon" onClick={() => setConfirming(p)}>
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                </div>
              </li>
            );
          })}
        </ul>
      )}

      <ProductDialog open={open} onOpenChange={setOpen} initial={editing} />
      <ConfirmDialog
        open={!!confirming}
        onOpenChange={(v) => !v && setConfirming(null)}
        title={`Delete ${confirming?.name}?`}
        description="Any warranties registered for this product will also be removed."
        onConfirm={onConfirmDelete}
      />
    </div>
  );
}
