"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useData } from "@/hooks/useData";
import { Button } from "@/components/ui/button";
import { 
  ArrowLeft, Cpu, Plus, Pencil, ShieldCheck, 
  Wrench as ToolIcon, Barcode, Layers, Tag, Bookmark, Truck, DollarSign, Archive, TrendingUp
} from "lucide-react";
import { StatusBadge } from "@/components/StatusBadge";
import { EmptyState } from "@/components/EmptyState";
import { WarrantyActions } from "@/components/WarrantyActions";
import { ProductDialog } from "@/components/ProductDialog";
import { RepairDialog } from "@/components/RepairDialog";
import { formatDate } from "@/utils/warranty";
import { cn } from "@/lib/utils";

type Tab = "warranties" | "repairs";

export default function ProductDetailPage({ params }: { params: { id: string } }) {
  const id = params.id;
  const router = useRouter();
  const { products, warrantyViews, repairs, categories, brands, models, suppliers } = useData();

  const [activeTab, setActiveTab] = useState<Tab>("warranties");
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isRepairDialogOpen, setIsRepairDialogOpen] = useState(false);

  const product = products.find((p) => p.id === id);

  const productWarranties = useMemo(
    () => warrantyViews.filter((w) => w.productId === id),
    [warrantyViews, id],
  );

  const productRepairs = useMemo(() => {
    if (!product) return [];
    return repairs.filter(
      (r) => 
        (product.serial && r.deviceId === product.serial) || 
        r.deviceId === product.id
    );
  }, [repairs, product]);

  const categoryName = product?.categoryId ? categories.find(c => c.id === product.categoryId)?.name : null;
  const brandName = product?.brandId ? brands.find(b => b.id === product.brandId)?.name : null;
  const modelName = product?.modelId ? models.find(m => m.id === product.modelId)?.name : null;
  const supplierName = product?.supplierId ? suppliers.find(s => s.id === product.supplierId)?.name : null;

  if (!product) {
    return (
      <div className="space-y-4">
        <Button variant="ghost" onClick={() => router.push("/products")}>
          <ArrowLeft className="h-4 w-4 mr-1" /> Back to products
        </Button>
        <EmptyState
          icon={<Cpu className="h-5 w-5" />}
          title="Product not found"
          description="This product may have been deleted."
        />
      </div>
    );
  }

  // Financial Stats
  const cost = parseFloat(product.costPrice as any || "0");
  const retail = parseFloat(product.sellPrice as any || "0");
  const margin = retail - cost;
  const markupPercent = cost > 0 ? (margin / cost) * 100 : 0;
  const totalCostValue = cost * product.quantity;
  const totalRetailValue = retail * product.quantity;
  const potentialProfit = totalRetailValue - totalCostValue;

  return (
    <div className="space-y-6">
      {/* Top Breadcrumb */}
      <div>
        <Button variant="ghost" size="sm" onClick={() => router.push("/products")} className="-ml-2">
          <ArrowLeft className="h-4 w-4 mr-1" /> Products
        </Button>
      </div>

      {/* Product Premium Details Card */}
      <div className="card-elevated p-6 space-y-6 relative overflow-hidden bg-gradient-to-br from-card to-secondary/15">
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
          <div className="space-y-2">
            <h1 className="text-3xl font-extrabold tracking-tight text-foreground">{product.name}</h1>
            <div className="flex flex-wrap gap-2 text-xs">
              {brandName && <span className="bg-primary/10 text-primary border border-primary/20 px-2.5 py-0.5 rounded-full font-semibold">{brandName}</span>}
              {modelName && <span className="bg-secondary text-secondary-foreground border border-border px-2.5 py-0.5 rounded-full font-semibold">{modelName}</span>}
              {categoryName && <span className="bg-secondary text-secondary-foreground border border-border px-2.5 py-0.5 rounded-full font-semibold">{categoryName}</span>}
            </div>
          </div>
          <Button onClick={() => setIsEditDialogOpen(true)} size="sm" variant="outline">
            <Pencil className="h-4 w-4 mr-1" /> Edit Product
          </Button>
        </div>

        {/* Product Identifiers & Info Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 pt-4 border-t border-border/40">
          <div className="flex items-center gap-3 text-sm">
            <div className="p-2 bg-secondary rounded-lg text-muted-foreground shrink-0">
              <Barcode className="h-4 w-4" />
            </div>
            <div className="min-w-0">
              <p className="text-xs text-muted-foreground font-semibold">SKU</p>
              <p className="mono font-semibold text-foreground truncate">{product.sku || "—"}</p>
            </div>
          </div>

          <div className="flex items-center gap-3 text-sm">
            <div className="p-2 bg-secondary rounded-lg text-muted-foreground shrink-0">
              <Tag className="h-4 w-4" />
            </div>
            <div className="min-w-0">
              <p className="text-xs text-muted-foreground font-semibold">Serial Number</p>
              <p className="mono font-semibold text-foreground truncate">{product.serial || "—"}</p>
            </div>
          </div>

          <div className="flex items-center gap-3 text-sm">
            <div className="p-2 bg-secondary rounded-lg text-muted-foreground shrink-0">
              <Bookmark className="h-4 w-4" />
            </div>
            <div className="min-w-0">
              <p className="text-xs text-muted-foreground font-semibold">Barcode</p>
              <p className="mono font-semibold text-foreground truncate">{product.barcode || "—"}</p>
            </div>
          </div>

          <div className="flex items-center gap-3 text-sm">
            <div className="p-2 bg-secondary rounded-lg text-muted-foreground shrink-0">
              <Truck className="h-4 w-4" />
            </div>
            <div className="min-w-0">
              <p className="text-xs text-muted-foreground font-semibold">Supplier</p>
              <p className="font-semibold text-foreground truncate">{supplierName || "—"}</p>
            </div>
          </div>
        </div>

        {/* Product Financial Statistics / Dashboards */}
        <div className="pt-4 border-t border-border/40 space-y-3">
          <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Inventory Metrics</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-background/40 p-3 rounded-lg border border-border/30">
              <div className="flex justify-between items-center text-xs text-muted-foreground">
                <span>Unit Cost</span>
                <DollarSign className="h-3 w-3 opacity-60" />
              </div>
              <p className="text-lg font-extrabold text-foreground mt-1">${cost.toFixed(2)}</p>
            </div>

            <div className="bg-background/40 p-3 rounded-lg border border-border/30">
              <div className="flex justify-between items-center text-xs text-muted-foreground">
                <span>Unit Retail</span>
                <DollarSign className="h-3 w-3 opacity-60" />
              </div>
              <p className="text-lg font-extrabold text-foreground mt-1">${retail.toFixed(2)}</p>
            </div>

            <div className="bg-background/40 p-3 rounded-lg border border-border/30">
              <div className="flex justify-between items-center text-xs text-muted-foreground">
                <span>Margin (Markup)</span>
                <TrendingUp className="h-3 w-3 text-emerald-500" />
              </div>
              <p className="text-lg font-extrabold text-emerald-600 dark:text-emerald-400 mt-1">
                +${margin.toFixed(2)} <span className="text-[10px] font-medium opacity-80">({markupPercent.toFixed(0)}%)</span>
              </p>
            </div>

            <div className="bg-background/40 p-3 rounded-lg border border-border/30">
              <div className="flex justify-between items-center text-xs text-muted-foreground">
                <span>Current Stock Value</span>
                <Archive className="h-3 w-3 opacity-60" />
              </div>
              <p className="text-lg font-extrabold text-foreground mt-1">
                {product.quantity} <span className="text-xs text-muted-foreground font-medium">units (${totalRetailValue.toFixed(0)})</span>
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs Switcher */}
      <div className="flex border-b border-border/60">
        <button
          onClick={() => setActiveTab("warranties")}
          className={cn(
            "px-6 py-3 font-semibold text-sm transition-all duration-300 border-b-2 -mb-[2px]",
            activeTab === "warranties" 
              ? "border-primary text-primary" 
              : "border-transparent text-muted-foreground hover:text-foreground"
          )}
        >
          Customer Warranties ({productWarranties.length})
        </button>
        <button
          onClick={() => setActiveTab("repairs")}
          className={cn(
            "px-6 py-3 font-semibold text-sm transition-all duration-300 border-b-2 -mb-[2px]",
            activeTab === "repairs" 
              ? "border-primary text-primary" 
              : "border-transparent text-muted-foreground hover:text-foreground"
          )}
        >
          Repair Activities ({productRepairs.length})
        </button>
      </div>

      {/* Content based on Active Tab */}
      {activeTab === "warranties" && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="font-bold text-lg">Active Subscribed Warranties</h2>
            <Button asChild size="sm">
              <Link href="/warranties"><Plus className="h-4 w-4 mr-1" /> New Warranty</Link>
            </Button>
          </div>

          {productWarranties.length === 0 ? (
            <EmptyState
              icon={<ShieldCheck className="h-5 w-5" />}
              title="No warranties issued"
              description="Register the first warranty for this product."
            />
          ) : (
            <ul className="grid gap-3">
              {productWarranties.map((w) => (
                <li
                  key={w.id}
                  className={cn(
                    "card-elevated p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-l-4",
                    w.status === "active" && "border-l-status-active",
                    w.status === "soon" && "border-l-status-soon",
                    w.status === "expired" && "border-l-status-expired",
                  )}
                >
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-lg truncate text-foreground">{w.customer?.name ?? "Unknown Customer"}</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      Phone: <span className="font-medium text-foreground">{w.customer?.phone ?? "—"}</span>
                      {w.customer?.email && <span> · Email: {w.customer.email}</span>}
                    </p>
                    <p className="text-xs text-muted-foreground mt-2">
                      Purchase Date: <span className="font-medium text-foreground">{formatDate(w.purchaseDate)}</span> · Expiry Date: <span className="font-medium text-foreground">{formatDate(w.expiryDate)}</span>
                    </p>
                  </div>
                  <div className="flex items-center gap-3 shrink-0">
                    <StatusBadge status={w.status} daysLeft={w.daysLeft} />
                    <WarrantyActions warranty={w} />
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}

      {activeTab === "repairs" && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="font-bold text-lg">Logged Repairs for Product</h2>
            <Button onClick={() => setIsRepairDialogOpen(true)} size="sm">
              <Plus className="h-4 w-4 mr-1" /> Add Repair Ticket
            </Button>
          </div>

          {productRepairs.length === 0 ? (
            <EmptyState
              icon={<ToolIcon className="h-5 w-5" />}
              title="No repairs recorded"
              description="Create a repair ticket using this product's Serial Number/ID."
              action={
                <Button onClick={() => setIsRepairDialogOpen(true)}>
                  <Plus className="h-4 w-4 mr-1" /> Add Repair Ticket
                </Button>
              }
            />
          ) : (
            <ul className="grid gap-3">
              {productRepairs.map((r) => (
                <li key={r.id} className="card-elevated p-5 flex items-center justify-between gap-4 border border-border/40 hover:border-primary/20 transition-all duration-300">
                  <Link href={`/repairs/${r.id}`} className="min-w-0 flex-1 group">
                    <div className="flex items-center gap-2">
                      <span className={cn(
                        "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold uppercase tracking-wider",
                        r.status === "Pending" ? "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400" :
                        r.status === "Completed" ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400" :
                        "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400"
                      )}>
                        {r.status}
                      </span>
                      {r.receivedDate && (
                        <span className="text-xs text-muted-foreground">Received: {r.receivedDate}</span>
                      )}
                    </div>
                    <p className="font-bold text-lg mt-2 text-foreground group-hover:text-primary transition-colors">{r.deviceName}</p>
                    <p className="text-sm text-muted-foreground mt-1 font-medium italic">Problem: {r.problem}</p>
                    {r.techNotes && (
                      <p className="text-xs text-muted-foreground/80 mt-2 bg-secondary/40 p-2 rounded border border-border/20">
                        <span className="font-semibold block text-[10px] text-muted-foreground uppercase tracking-wider mb-0.5">Tech Notes</span>
                        {r.techNotes}
                      </p>
                    )}
                  </Link>
                  {r.cost && (
                    <div className="shrink-0 text-right">
                      <p className="text-xs text-muted-foreground">Repair Cost</p>
                      <p className="font-bold text-lg text-primary text-emerald-600 dark:text-emerald-400">
                        {(() => {
                          const parsed = parseFloat(r.cost);
                          return isNaN(parsed) ? r.cost : `$${parsed.toFixed(2)}`;
                        })()}
                      </p>
                    </div>
                  )}
                </li>
              ))}
            </ul>
          )}
        </div>
      )}

      {/* Edit Product Dialog */}
      <ProductDialog 
        open={isEditDialogOpen} 
        onOpenChange={setIsEditDialogOpen} 
        initial={product} 
      />

      {/* Quick Add Repair Ticket Dialog */}
      <RepairDialog
        open={isRepairDialogOpen}
        onOpenChange={setIsRepairDialogOpen}
        initial={{
          deviceId: product.serial || product.id || "",
          deviceName: product.name || "",
          status: "pending",
        } as any}
      />
    </div>
  );
}
