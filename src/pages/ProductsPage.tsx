import { useState } from "react";
import { useData } from "@/hooks/useData";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, Pencil, Trash2, Search, Cpu } from "lucide-react";
import { ProductDialog } from "@/components/ProductDialog";
import { ConfirmDialog } from "@/components/ConfirmDialog";
import { EmptyState } from "@/components/EmptyState";
import type { Product } from "@/db/types";
import { toast } from "sonner";

export default function ProductsPage() {
  const { products, warranties, deleteProduct } = useData();
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Product | null>(null);
  const [confirming, setConfirming] = useState<Product | null>(null);
  const [q, setQ] = useState("");

  const filtered = products.filter((p) =>
    [p.name, p.brand, p.serial].some((v) => v.toLowerCase().includes(q.toLowerCase())),
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
          <Input className="pl-9" placeholder="Search by name, brand or serial" value={q} onChange={(e) => setQ(e.target.value)} />
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
          {filtered.map((p) => (
            <li key={p.id} className="card-elevated p-4 flex items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="font-semibold truncate">{p.name}</p>
                <p className="text-xs text-muted-foreground mt-0.5">{p.brand}</p>
                <p className="text-xs mono mt-2 text-muted-foreground truncate">SN: {p.serial}</p>
                {used(p.id) && <span className="text-[11px] text-muted-foreground">In use</span>}
              </div>
              <div className="flex gap-1">
                <Button variant="ghost" size="icon" onClick={() => { setEditing(p); setOpen(true); }}>
                  <Pencil className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="icon" onClick={() => setConfirming(p)}>
                  <Trash2 className="h-4 w-4 text-destructive" />
                </Button>
              </div>
            </li>
          ))}
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
