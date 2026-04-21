import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { useData } from "@/hooks/useData";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, Pencil, Trash2, Search, ShieldCheck, ScanLine, X } from "lucide-react";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { WarrantyDialog } from "@/components/WarrantyDialog";
import { ConfirmDialog } from "@/components/ConfirmDialog";
import { StatusBadge } from "@/components/StatusBadge";
import { EmptyState } from "@/components/EmptyState";
import { BarcodeScanner } from "@/components/BarcodeScanner";
import { WarrantyActions } from "@/components/WarrantyActions";
import { formatDate } from "@/utils/warranty";
import type { Warranty } from "@/db/types";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { Link } from "react-router-dom";

type Filter = "all" | "active" | "soon" | "expired";

export default function WarrantiesPage() {
  const { warrantyViews, deleteWarranty } = useData();
  const [params, setParams] = useSearchParams();
  const initialFilter = (params.get("filter") as Filter) ?? "all";
  const [filter, setFilter] = useState<Filter>(initialFilter);
  const [q, setQ] = useState("");
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Warranty | null>(null);
  const [confirming, setConfirming] = useState<Warranty | null>(null);
  const [scanOpen, setScanOpen] = useState(false);

  const onScanned = (text: string) => {
    setQ(text);
    const match = warrantyViews.find(
      (w) => (w.product?.serial ?? "").toLowerCase() === text.toLowerCase(),
    );
    if (match) toast.success(`Found: ${match.product?.name ?? "product"}`);
    else toast.message("No exact match — showing search results", { description: text });
  };

  useEffect(() => {
    const next = new URLSearchParams(params);
    if (filter === "all") next.delete("filter"); else next.set("filter", filter);
    setParams(next, { replace: true });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filter]);

  const list = useMemo(() => {
    const term = q.trim().toLowerCase();
    return warrantyViews.filter((w) => {
      if (filter !== "all" && w.status !== filter) return false;
      if (!term) return true;
      return [
        w.product?.name, w.product?.brand, w.product?.serial,
        w.customer?.name, w.customer?.phone, w.notes,
      ].some((v) => (v ?? "").toLowerCase().includes(term));
    });
  }, [warrantyViews, filter, q]);

  const onConfirmDelete = async () => {
    if (!confirming) return;
    await deleteWarranty(confirming.id);
    toast.success("Warranty deleted");
    setConfirming(null);
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            className="pl-9 pr-9"
            placeholder="Search by product, customer or serial"
            value={q}
            onChange={(e) => setQ(e.target.value)}
          />
          {q && (
            <button
              onClick={() => setQ("")}
              className="absolute right-2 top-1/2 -translate-y-1/2 p-1 rounded-md hover:bg-muted text-muted-foreground"
              aria-label="Clear search"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => setScanOpen(true)} aria-label="Scan barcode">
            <ScanLine className="h-4 w-4 sm:mr-1" /><span className="hidden sm:inline">Scan</span>
          </Button>
          <Button onClick={() => { setEditing(null); setOpen(true); }}>
            <Plus className="h-4 w-4 mr-1" /> New warranty
          </Button>
        </div>
      </div>

      <Tabs value={filter} onValueChange={(v) => setFilter(v as Filter)}>
        <TabsList className="grid grid-cols-4 w-full sm:w-auto">
          <TabsTrigger value="all">All</TabsTrigger>
          <TabsTrigger value="active">Active</TabsTrigger>
          <TabsTrigger value="soon">Expiring</TabsTrigger>
          <TabsTrigger value="expired">Expired</TabsTrigger>
        </TabsList>
      </Tabs>

      {list.length === 0 ? (
        <EmptyState
          icon={<ShieldCheck className="h-5 w-5" />}
          title="No warranties to show"
          description="Register a warranty to see it here, or change the filter."
          action={<Button onClick={() => { setEditing(null); setOpen(true); }}><Plus className="h-4 w-4 mr-1" /> New warranty</Button>}
        />
      ) : (
        <ul className="space-y-3">
          {list.map((w) => (
            <li
              key={w.id}
              className={cn(
                "card-elevated p-4 flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4 border-l-4",
                w.status === "active" && "border-l-status-active",
                w.status === "soon" && "border-l-status-soon",
                w.status === "expired" && "border-l-status-expired",
              )}
            >
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <p className="font-semibold truncate">{w.product?.name ?? "Unknown product"}</p>
                  <span className="text-xs text-muted-foreground">· {w.product?.brand}</span>
                </div>
                <p className="text-sm text-muted-foreground truncate">
                  {w.customer ? (
                    <Link to={`/customers/${w.customer.id}`} className="hover:text-foreground hover:underline">
                      {w.customer.name}
                    </Link>
                  ) : "Unknown"} · {w.customer?.phone ?? "—"}
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  <span className="mono">SN: {w.product?.serial ?? "—"}</span>
                  {" · "}Bought {formatDate(w.purchaseDate)} · {w.months}mo · Expires {formatDate(w.expiryDate)}
                </p>
                {w.notes && <p className="text-xs mt-1 italic text-muted-foreground">"{w.notes}"</p>}
              </div>
              <div className="flex items-center gap-2 sm:flex-col sm:items-end">
                <StatusBadge status={w.status} daysLeft={w.daysLeft} />
                <div className="flex gap-1">
                  <WarrantyActions warranty={w} />
                  <Button variant="ghost" size="icon" onClick={() => { setEditing(w); setOpen(true); }}>
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="icon" onClick={() => setConfirming(w)}>
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}

      <WarrantyDialog open={open} onOpenChange={setOpen} initial={editing} />
      <BarcodeScanner open={scanOpen} onOpenChange={setScanOpen} onResult={onScanned} />
      <ConfirmDialog
        open={!!confirming}
        onOpenChange={(v) => !v && setConfirming(null)}
        title="Delete this warranty?"
        description="The customer and product will remain — only this warranty record is removed."
        onConfirm={onConfirmDelete}
      />
    </div>
  );
}
