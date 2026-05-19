"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, Users, Cpu, ShieldCheck, Settings, ShieldHalf, Wrench, Truck, CreditCard, BarChart3, FileText } from "lucide-react";
import { cn } from "@/lib/utils";

const items = [
  { to: "/", label: "Dashboard", icon: LayoutDashboard, end: true },
  { to: "/warranties", label: "Warranties", icon: ShieldCheck },
  { to: "/invoices", label: "Invoices", icon: FileText },
  { to: "/customers", label: "Customers", icon: Users },
  { to: "/products", label: "Products", icon: Cpu },
  { to: "/repairs", label: "Repairs", icon: Wrench },
  { to: "/suppliers", label: "Suppliers", icon: Truck },
  { to: "/expenses", label: "Expenses", icon: CreditCard },
  { to: "/cheques", label: "Cheques", icon: CreditCard },
  { to: "/reports", label: "Reports", icon: BarChart3 },
  { to: "/attributes", label: "Attributes", icon: Settings },
  { to: "/settings", label: "Settings", icon: Settings },
];

export function SideNav() {
  const pathname = usePathname();

  return (
    <aside className="hidden md:flex md:w-60 lg:w-64 shrink-0 flex-col border-r bg-sidebar text-sidebar-foreground">
      <div className="px-5 py-5 flex items-center gap-2.5 border-b">
        <div
          className="h-9 w-9 rounded-xl flex items-center justify-center text-primary-foreground"
          style={{ background: "var(--gradient-primary)" }}
        >
          <ShieldHalf className="h-5 w-5" />
        </div>
        <div className="leading-tight">
          <p className="font-semibold">WarrantyOps</p>
          <p className="text-[11px] text-muted-foreground">Shop manager</p>
        </div>
      </div>
      <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
        {items.map(({ to, label, icon: Icon, end }) => {
          const isActive = end ? pathname === to : pathname.startsWith(to);
          return (
            <Link
              key={to}
              href={to}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                isActive
                  ? "bg-sidebar-accent text-sidebar-accent-foreground"
                  : "text-muted-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
              )}
            >
              <Icon className="h-4 w-4" />
              {label}
            </Link>
          );
        })}
      </nav>
      <div className="p-4 text-[11px] text-muted-foreground border-t">
        Local-only · Offline ready
      </div>
    </aside>
  );
}
