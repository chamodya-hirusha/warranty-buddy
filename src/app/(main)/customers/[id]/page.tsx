"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useData } from "@/hooks/useData";
import { Button } from "@/components/ui/button";
import { 
  ArrowLeft, Phone, ShieldCheck, Plus, Pencil, Mail, 
  MapPin, Calendar, MessageSquare, Wrench as ToolIcon 
} from "lucide-react";
import { StatusBadge } from "@/components/StatusBadge";
import { EmptyState } from "@/components/EmptyState";
import { WarrantyActions } from "@/components/WarrantyActions";
import { CustomerDialog } from "@/components/CustomerDialog";
import { formatDate } from "@/utils/warranty";
import { cn } from "@/lib/utils";

type Tab = "warranties" | "repairs";

export default function CustomerDetailPage({ params }: { params: { id: string } }) {
  const id = params.id;
  const router = useRouter();
  const { customers, warrantyViews, repairs, brands } = useData();

  const [activeTab, setActiveTab] = useState<Tab>("warranties");
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);

  const customer = customers.find((c) => c.id === id);

  const customerWarranties = useMemo(
    () => warrantyViews.filter((w) => w.customerId === id),
    [warrantyViews, id],
  );

  const customerRepairs = useMemo(
    () => repairs.filter((r) => r.customerId === id),
    [repairs, id],
  );

  if (!customer) {
    return (
      <div className="space-y-4">
        <Button variant="ghost" onClick={() => router.push("/customers")}>
          <ArrowLeft className="h-4 w-4 mr-1" /> Back to customers
        </Button>
        <EmptyState
          icon={<ShieldCheck className="h-5 w-5" />}
          title="Customer not found"
          description="This customer may have been deleted."
        />
      </div>
    );
  }

  const counts = {
    active: customerWarranties.filter((w) => w.status === "active").length,
    soon: customerWarranties.filter((w) => w.status === "soon").length,
    expired: customerWarranties.filter((w) => w.status === "expired").length,
  };

  return (
    <div className="space-y-6">
      {/* Top Breadcrumb */}
      <div>
        <Button variant="ghost" size="sm" onClick={() => router.push("/customers")} className="-ml-2">
          <ArrowLeft className="h-4 w-4 mr-1" /> Customers
        </Button>
      </div>

      {/* Customer Header Info Card */}
      <div className="card-elevated p-6 space-y-6 relative overflow-hidden bg-gradient-to-br from-card to-secondary/10">
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
          <div className="space-y-2">
            <h1 className="text-3xl font-extrabold tracking-tight text-foreground">{customer.name}</h1>
            <div className="flex flex-wrap gap-2">
              <Pill label="Active" value={counts.active} cls="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20" />
              <Pill label="Expiring soon" value={counts.soon} cls="bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20" />
              <Pill label="Expired" value={counts.expired} cls="bg-red-500/10 text-red-600 dark:text-red-400 border border-red-500/20" />
            </div>
          </div>
          <Button onClick={() => setIsEditDialogOpen(true)} size="sm" variant="outline">
            <Pencil className="h-4 w-4 mr-1" /> Edit Profile
          </Button>
        </div>

        {/* Contact Details Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 pt-4 border-t border-border/40">
          <div className="flex items-center gap-3 text-sm">
            <div className="p-2 bg-secondary rounded-lg text-muted-foreground shrink-0">
              <Phone className="h-4 w-4" />
            </div>
            <div className="min-w-0">
              <p className="text-xs text-muted-foreground font-semibold">Phone</p>
              <a href={`tel:${customer.phone}`} className="hover:text-primary transition-colors truncate block">
                {customer.phone}
              </a>
            </div>
          </div>

          <div className="flex items-center gap-3 text-sm">
            <div className="p-2 bg-emerald-500/10 rounded-lg text-emerald-600 shrink-0">
              <MessageSquare className="h-4 w-4" />
            </div>
            <div className="min-w-0">
              <p className="text-xs text-muted-foreground font-semibold">WhatsApp</p>
              {customer.whatsapp ? (
                <a 
                  href={`https://wa.me/${customer.whatsapp.replace(/[^0-9]/g, "")}`} 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="hover:text-primary transition-colors truncate block"
                >
                  {customer.whatsapp}
                </a>
              ) : (
                <p className="text-muted-foreground">—</p>
              )}
            </div>
          </div>

          <div className="flex items-center gap-3 text-sm">
            <div className="p-2 bg-secondary rounded-lg text-muted-foreground shrink-0">
              <Mail className="h-4 w-4" />
            </div>
            <div className="min-w-0">
              <p className="text-xs text-muted-foreground font-semibold">Email</p>
              {customer.email ? (
                <a href={`mailto:${customer.email}`} className="hover:text-primary transition-colors truncate block">
                  {customer.email}
                </a>
              ) : (
                <p className="text-muted-foreground">—</p>
              )}
            </div>
          </div>

          <div className="flex items-center gap-3 text-sm sm:col-span-2">
            <div className="p-2 bg-secondary rounded-lg text-muted-foreground shrink-0">
              <MapPin className="h-4 w-4" />
            </div>
            <div className="min-w-0">
              <p className="text-xs text-muted-foreground font-semibold">Address</p>
              {customer.address ? (
                <a 
                  href={`https://maps.google.com/?q=${encodeURIComponent(customer.address)}`} 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="hover:text-primary transition-colors truncate block"
                >
                  {customer.address}
                </a>
              ) : (
                <p className="text-muted-foreground">—</p>
              )}
            </div>
          </div>

          <div className="flex items-center gap-3 text-sm">
            <div className="p-2 bg-secondary rounded-lg text-muted-foreground shrink-0">
              <Calendar className="h-4 w-4" />
            </div>
            <div className="min-w-0">
              <p className="text-xs text-muted-foreground font-semibold">Birthday</p>
              <p className="text-foreground font-medium">
                {customer.birthday ? customer.birthday : "—"}
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
          Warranties ({customerWarranties.length})
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
          Repairs ({customerRepairs.length})
        </button>
      </div>

      {/* Content based on Active Tab */}
      {activeTab === "warranties" && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="font-bold text-lg">Product Warranties</h2>
            <Button asChild size="sm">
              <Link href="/warranties"><Plus className="h-4 w-4 mr-1" /> Register Warranty</Link>
            </Button>
          </div>

          {customerWarranties.length === 0 ? (
            <EmptyState
              icon={<ShieldCheck className="h-5 w-5" />}
              title="No warranties registered"
              description="Register the first warranty for this customer."
            />
          ) : (
            <ul className="grid gap-3">
              {customerWarranties.map((w) => (
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
                    <p className="font-bold text-lg truncate text-foreground">{w.product?.name ?? "Unknown product"}</p>
                    <div className="flex flex-wrap gap-x-3 gap-y-1 text-xs text-muted-foreground mt-1">
                      <span className="mono bg-secondary px-1.5 py-0.5 rounded font-medium">SN: {w.product?.serial ?? "—"}</span>
                      {(() => {
                        const brandName = w.product?.brandId ? brands.find((b) => b.id === w.product.brandId)?.name : undefined;
                        return brandName ? <span>Brand: {brandName}</span> : null;
                      })()}
                      <span>Warranty Duration: {w.months} Months</span>
                    </div>
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
            <h2 className="font-bold text-lg">Repair Tickets</h2>
            <Button asChild size="sm">
              <Link href="/repairs"><Plus className="h-4 w-4 mr-1" /> Add Ticket</Link>
            </Button>
          </div>

          {customerRepairs.length === 0 ? (
            <EmptyState
              icon={<ToolIcon className="h-5 w-5" />}
              title="No repairs recorded"
              description="Create a repair ticket for this customer."
            />
          ) : (
            <ul className="grid gap-3">
              {customerRepairs.map((r) => (
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

      {/* Edit Customer Dialog */}
      <CustomerDialog 
        open={isEditDialogOpen} 
        onOpenChange={setIsEditDialogOpen} 
        initial={customer} 
      />
    </div>
  );
}

function Pill({ label, value, cls }: { label: string; value: number; cls: string }) {
  return (
    <span className={cn("inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold", cls)}>
      <span className="font-bold">{value}</span> {label}
    </span>
  );
}
