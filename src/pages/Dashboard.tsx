import { useMemo } from "react";
import { Link } from "react-router-dom";
import { useData } from "@/hooks/useData";
import { StatCard } from "@/components/StatCard";
import { StatusBadge } from "@/components/StatusBadge";
import { Cpu, Users, ShieldCheck, AlertTriangle, XCircle, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { formatDate } from "@/utils/warranty";
import { EmptyState } from "@/components/EmptyState";

export default function Dashboard() {
  const { customers, products, warrantyViews } = useData();

  const stats = useMemo(() => {
    const active = warrantyViews.filter((w) => w.status === "active").length;
    const soon = warrantyViews.filter((w) => w.status === "soon").length;
    const expired = warrantyViews.filter((w) => w.status === "expired").length;
    return { active, soon, expired };
  }, [warrantyViews]);

  const expiringSoon = warrantyViews.filter((w) => w.status === "soon").slice(0, 5);
  const recentlyExpired = warrantyViews.filter((w) => w.status === "expired").slice(0, 5);

  return (
    <div className="space-y-6">
      <section className="grid grid-cols-2 lg:grid-cols-5 gap-3 sm:gap-4">
        <StatCard title="Customers" value={customers.length} icon={<Users className="h-5 w-5" />} />
        <StatCard title="Products" value={products.length} icon={<Cpu className="h-5 w-5" />} />
        <StatCard title="Active" value={stats.active} icon={<ShieldCheck className="h-5 w-5" />} tone="active" />
        <StatCard title="Expiring ≤7d" value={stats.soon} icon={<AlertTriangle className="h-5 w-5" />} tone="soon" />
        <StatCard title="Expired" value={stats.expired} icon={<XCircle className="h-5 w-5" />} tone="expired" />
      </section>

      <section className="grid lg:grid-cols-2 gap-4">
        <Panel title="Expiring within 7 days" linkTo="/warranties?filter=soon">
          {expiringSoon.length === 0 ? (
            <EmptyState icon={<ShieldCheck className="h-5 w-5" />} title="All clear" description="No warranties are about to expire." />
          ) : (
            <ul className="divide-y">
              {expiringSoon.map((w) => (
                <Row key={w.id} title={w.product?.name ?? "Unknown product"}
                     subtitle={`${w.customer?.name ?? "Unknown"} · expires ${formatDate(w.expiryDate)}`}>
                  <StatusBadge status={w.status} daysLeft={w.daysLeft} />
                </Row>
              ))}
            </ul>
          )}
        </Panel>

        <Panel title="Recently expired" linkTo="/warranties?filter=expired">
          {recentlyExpired.length === 0 ? (
            <EmptyState icon={<XCircle className="h-5 w-5" />} title="Nothing expired" description="Expired warranties will show up here." />
          ) : (
            <ul className="divide-y">
              {recentlyExpired.map((w) => (
                <Row key={w.id} title={w.product?.name ?? "Unknown product"}
                     subtitle={`${w.customer?.name ?? "Unknown"} · ended ${formatDate(w.expiryDate)}`}>
                  <StatusBadge status={w.status} daysLeft={w.daysLeft} />
                </Row>
              ))}
            </ul>
          )}
        </Panel>
      </section>
    </div>
  );
}

function Panel({ title, linkTo, children }: { title: string; linkTo: string; children: React.ReactNode }) {
  return (
    <div className="card-elevated">
      <div className="flex items-center justify-between px-5 py-4 border-b">
        <h2 className="font-semibold">{title}</h2>
        <Button variant="ghost" size="sm" asChild>
          <Link to={linkTo}>View all <ArrowRight className="h-3.5 w-3.5 ml-1" /></Link>
        </Button>
      </div>
      <div className="p-2 sm:p-3">{children}</div>
    </div>
  );
}

function Row({ title, subtitle, children }: { title: string; subtitle: string; children?: React.ReactNode }) {
  return (
    <li className="flex items-center justify-between gap-3 px-3 py-3">
      <div className="min-w-0">
        <p className="font-medium truncate">{title}</p>
        <p className="text-xs text-muted-foreground truncate">{subtitle}</p>
      </div>
      {children}
    </li>
  );
}
