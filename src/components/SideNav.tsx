import { NavLink } from "react-router-dom";
import { LayoutDashboard, Users, Cpu, ShieldCheck, Settings, ShieldHalf } from "lucide-react";
import { cn } from "@/lib/utils";

const items = [
  { to: "/", label: "Dashboard", icon: LayoutDashboard, end: true },
  { to: "/warranties", label: "Warranties", icon: ShieldCheck },
  { to: "/customers", label: "Customers", icon: Users },
  { to: "/products", label: "Products", icon: Cpu },
  { to: "/settings", label: "Settings", icon: Settings },
];

export function SideNav() {
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
      <nav className="flex-1 p-3 space-y-1">
        {items.map(({ to, label, icon: Icon, end }) => (
          <NavLink
            key={to}
            to={to}
            end={end}
            className={({ isActive }) =>
              cn(
                "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                isActive
                  ? "bg-sidebar-accent text-sidebar-accent-foreground"
                  : "text-muted-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
              )
            }
          >
            <Icon className="h-4 w-4" />
            {label}
          </NavLink>
        ))}
      </nav>
      <div className="p-4 text-[11px] text-muted-foreground border-t">
        Local-only · Offline ready
      </div>
    </aside>
  );
}
