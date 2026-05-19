"use client";

import { usePathname } from "next/navigation";
import { SideNav } from "@/components/SideNav";
import { BottomNav } from "@/components/BottomNav";
import { Button } from "@/components/ui/button";
import { Moon, Sun } from "lucide-react";
import { useTheme } from "@/hooks/useTheme";
import { InstallButton } from "@/components/InstallButton";

const TITLES: Record<string, string> = {
  "/": "Dashboard",
  "/warranties": "Warranties",
  "/invoices": "Invoices",
  "/customers": "Customers",
  "/products": "Products",
  "/attributes": "Attributes",
  "/settings": "Settings",
};

export default function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { theme, toggle } = useTheme();
  const pathname = usePathname();
  const title = TITLES[pathname] ?? "WarrantyOps";

  return (
    <div className="h-screen flex bg-background overflow-hidden">
      <SideNav />
      <div className="flex-1 flex flex-col min-w-0 h-full overflow-hidden">
        <header className="sticky top-0 z-30 min-h-14 pt-[env(safe-area-inset-top,0px)] border-b bg-background/85 backdrop-blur flex items-center justify-between px-4 sm:px-6">
          <h1 className="text-base sm:text-lg font-semibold tracking-tight">{title}</h1>
          <div className="flex items-center gap-2">
            <InstallButton />
            <Button
              variant="ghost"
              size="icon"
              onClick={toggle}
              aria-label="Toggle theme"
              className="rounded-full"
            >
              {theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
            </Button>
          </div>
        </header>

        <main className="flex-1 p-4 sm:p-6 pb-24 md:pb-8 max-w-6xl w-full mx-auto overflow-y-auto">
          {children}
        </main>
      </div>
      <BottomNav />
    </div>
  );
}
