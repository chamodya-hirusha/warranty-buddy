import Link from "next/link";
import { StatCard } from "@/components/StatCard";
import { StatusBadge } from "@/components/StatusBadge";
import { Users, ShieldCheck, AlertTriangle, XCircle, ArrowRight, DollarSign, TrendingUp, Wrench as Tool } from "lucide-react";
import { Button } from "@/components/ui/button";
import { formatDate, calcStatus } from "@/utils/warranty";
import { EmptyState } from "@/components/EmptyState";
import { DashboardCharts } from "@/components/DashboardCharts";
import prisma from "@/lib/prisma";
import { differenceInCalendarDays } from "date-fns";

export const dynamic = "force-dynamic";

// Mock data for the new features (to keep charts rendering for now)
const salesData = [
  { name: "Jan", sales: 4000, profit: 2400 },
  { name: "Feb", sales: 3000, profit: 1398 },
  { name: "Mar", sales: 2000, profit: 9800 },
  { name: "Apr", sales: 2780, profit: 3908 },
  { name: "May", sales: 1890, profit: 4800 },
  { name: "Jun", sales: 2390, profit: 3800 },
  { name: "Jul", sales: 3490, profit: 4300 },
];

const branchData = [
  { name: "Colombo", sales: 4000 },
  { name: "Kandy", sales: 3000 },
  { name: "Galle", sales: 2000 },
];

export default async function Dashboard() {
  const [customersCount, lowStockCount, pendingRepairs, warrantiesRaw, lowStockList, recentRepairs] = await Promise.all([
    prisma.customer.count(),
    prisma.product.count({ where: { quantity: { lt: 5 } } }),
    prisma.repair.count({ where: { status: { name: "Pending" } } }),
    prisma.warranty.findMany({ include: { product: true, customer: true } }),
    prisma.product.findMany({ where: { quantity: { lt: 5 } }, take: 3 }),
    prisma.repair.findMany({ orderBy: { receivedDate: "desc" }, take: 3, include: { status: true, customer: true } }),
  ]);

  const warrantyViews = warrantiesRaw.map((w) => {
    const daysLeft = differenceInCalendarDays(w.expiryDate, new Date());
    return {
      ...w,
      daysLeft,
      status: calcStatus(daysLeft),
    };
  }).sort((a, b) => a.daysLeft - b.daysLeft);

  const activeCount = warrantyViews.filter((w) => w.status === "active").length;
  const soonCount = warrantyViews.filter((w) => w.status === "soon").length;
  const expiredCount = warrantyViews.filter((w) => w.status === "expired").length;

  const expiringSoon = warrantyViews.filter((w) => w.status === "soon").slice(0, 5);

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Total Sales" value="$24,500" icon={<DollarSign className="h-5 w-5" />} tone="active" />
        <StatCard title="Monthly Profit" value="$8,200" icon={<TrendingUp className="h-5 w-5" />} tone="active" />
        <StatCard title="Total Customers" value={customersCount} icon={<Users className="h-5 w-5" />} />
        <StatCard title="Active Warranties" value={activeCount} icon={<ShieldCheck className="h-5 w-5" />} tone="active" />
      </section>

      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Low Stock Items" value={lowStockCount} icon={<AlertTriangle className="h-5 w-5" />} tone="soon" />
        <StatCard title="Pending Repairs" value={pendingRepairs} icon={<Tool className="h-5 w-5" />} tone="soon" />
        <StatCard title="Expiring Soon" value={soonCount} icon={<AlertTriangle className="h-5 w-5" />} tone="soon" />
        <StatCard title="Expired" value={expiredCount} icon={<XCircle className="h-5 w-5" />} tone="expired" />
      </section>

      {/* Charts Section */}
      <DashboardCharts salesData={salesData} branchData={branchData} />

      {/* Lists Section */}
      <section className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Expiring Soon */}
        <Panel title="Warranties Expiring Soon" linkTo="/warranties?filter=soon">
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

        {/* Recent Invoices (Mockup for now until invoice seed is populated) */}
        <Panel title="Recent Invoices" linkTo="/reports">
          <ul className="divide-y">
            <Row title="INV-001" subtitle="John Doe · $150.00">
              <span className="text-xs text-muted-foreground">Today</span>
            </Row>
            <Row title="INV-002" subtitle="Jane Smith · $450.00">
              <span className="text-xs text-muted-foreground">Yesterday</span>
            </Row>
            <Row title="INV-003" subtitle="Bob Johnson · $89.00">
              <span className="text-xs text-muted-foreground">2 days ago</span>
            </Row>
          </ul>
        </Panel>
      </section>

      {/* Repairs Section */}
      <section className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Panel title="Recent Repairs" linkTo="/repairs">
          {recentRepairs.length === 0 ? (
             <EmptyState icon={<Tool className="h-5 w-5" />} title="No repairs" description="No recent repairs found." />
          ) : (
             <ul className="divide-y">
               {recentRepairs.map((r) => (
                 <Row key={r.id} title={r.deviceName} subtitle={`${r.status.name} · Tech: Sam`}>
                   <StatusBadge status={r.status.name === "Pending" ? "soon" : "active"} />
                 </Row>
               ))}
             </ul>
          )}
        </Panel>

        <Panel title="Low Stock Alerts" linkTo="/products">
          {lowStockList.length === 0 ? (
            <EmptyState icon={<AlertTriangle className="h-5 w-5" />} title="Stock is good" description="No items are low on stock." />
          ) : (
            <ul className="divide-y">
              {lowStockList.map((p) => (
                <Row key={p.id} title={p.name} subtitle={`Stock: ${p.quantity}`}>
                  <span className="text-xs text-destructive font-medium">Low Stock</span>
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
          <Link href={linkTo}>View all <ArrowRight className="h-3.5 w-3.5 ml-1" /></Link>
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
