// ============================================================
// Customer detail page — /customers/:id
// Shows the customer's contact info and ALL their warranties
// with status badges + a per-row actions menu (print/share/PDF).
// ============================================================
import { useMemo } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { useData } from "@/hooks/useData";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Phone, ShieldCheck, Plus } from "lucide-react";
import { StatusBadge } from "@/components/StatusBadge";
import { EmptyState } from "@/components/EmptyState";
import { WarrantyActions } from "@/components/WarrantyActions";
import { formatDate } from "@/utils/warranty";
import { cn } from "@/lib/utils";

export default function CustomerDetailPage() {
  const { id = "" } = useParams();
  const navigate = useNavigate();
  const { customers, warrantyViews } = useData();

  const customer = customers.find((c) => c.id === id);
  const items = useMemo(
    () => warrantyViews.filter((w) => w.customerId === id),
    [warrantyViews, id],
  );

  if (!customer) {
    return (
      <div className="space-y-4">
        <Button variant="ghost" onClick={() => navigate("/customers")}>
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
    active: items.filter((w) => w.status === "active").length,
    soon: items.filter((w) => w.status === "soon").length,
    expired: items.filter((w) => w.status === "expired").length,
  };

  return (
    <div className="space-y-5">
      <div>
        <Button variant="ghost" size="sm" onClick={() => navigate("/customers")} className="-ml-2">
          <ArrowLeft className="h-4 w-4 mr-1" /> Customers
        </Button>
      </div>

      <header className="card-elevated p-5">
        <h1 className="text-2xl font-semibold">{customer.name}</h1>
        <p className="text-sm text-muted-foreground inline-flex items-center gap-1.5 mt-1">
          <Phone className="h-3.5 w-3.5" /> {customer.phone}
        </p>
        <div className="flex flex-wrap gap-2 mt-4">
          <Pill label="Active" value={counts.active} cls="bg-status-active-bg text-status-active" />
          <Pill label="Expiring soon" value={counts.soon} cls="bg-status-soon-bg text-status-soon" />
          <Pill label="Expired" value={counts.expired} cls="bg-status-expired-bg text-status-expired" />
        </div>
      </header>

      <div className="flex items-center justify-between">
        <h2 className="font-semibold">Warranties ({items.length})</h2>
        <Button asChild size="sm">
          <Link to="/warranties"><Plus className="h-4 w-4 mr-1" /> New</Link>
        </Button>
      </div>

      {items.length === 0 ? (
        <EmptyState
          icon={<ShieldCheck className="h-5 w-5" />}
          title="No warranties yet"
          description="Register the first warranty for this customer."
        />
      ) : (
        <ul className="space-y-3">
          {items.map((w) => (
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
                <p className="font-semibold truncate">{w.product?.name ?? "Unknown product"}</p>
                <p className="text-xs text-muted-foreground mt-0.5">
                  <span className="mono">SN: {w.product?.serial ?? "—"}</span>
                  {" · "}{w.product?.brand ?? "—"}
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  Bought {formatDate(w.purchaseDate)} · {w.months}mo · Expires {formatDate(w.expiryDate)}
                </p>
              </div>
              <div className="flex items-center gap-2 sm:flex-col sm:items-end">
                <StatusBadge status={w.status} daysLeft={w.daysLeft} />
                <WarrantyActions warranty={w} />
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function Pill({ label, value, cls }: { label: string; value: number; cls: string }) {
  return (
    <span className={cn("inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium", cls)}>
      <span className="font-bold">{value}</span> {label}
    </span>
  );
}
