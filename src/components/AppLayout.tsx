import { Outlet, useLocation } from "react-router-dom";
import { SideNav } from "./SideNav";
import { BottomNav } from "./BottomNav";
import { Button } from "@/components/ui/button";
import { Moon, Sun } from "lucide-react";
import { useTheme } from "@/hooks/useTheme";

const TITLES: Record<string, string> = {
  "/": "Dashboard",
  "/warranties": "Warranties",
  "/customers": "Customers",
  "/products": "Products",
  "/settings": "Settings",
};

export function AppLayout() {
  const { theme, toggle } = useTheme();
  const { pathname } = useLocation();
  const title = TITLES[pathname] ?? "WarrantyOps";

  return (
    <div className="min-h-screen flex bg-background">
      <SideNav />
      <div className="flex-1 flex flex-col min-w-0">
        <header className="sticky top-0 z-30 h-14 border-b bg-background/85 backdrop-blur flex items-center justify-between px-4 sm:px-6">
          <h1 className="text-base sm:text-lg font-semibold tracking-tight">{title}</h1>
          <Button
            variant="ghost"
            size="icon"
            onClick={toggle}
            aria-label="Toggle theme"
            className="rounded-full"
          >
            {theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
          </Button>
        </header>

        <main className="flex-1 p-4 sm:p-6 pb-24 md:pb-8 max-w-6xl w-full mx-auto">
          <Outlet />
        </main>
      </div>
      <BottomNav />
    </div>
  );
}
