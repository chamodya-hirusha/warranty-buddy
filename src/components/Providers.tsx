"use client";

import * as React from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ThemeProvider } from "@/hooks/useTheme";
import { DataProvider } from "@/hooks/useData";
import { ShopProvider } from "@/hooks/useShop";

export function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = React.useState(() => new QueryClient());

  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <ShopProvider>
          <DataProvider>
            <TooltipProvider>
              <Toaster />
              <Sonner position="top-right" richColors />
              {children}
            </TooltipProvider>
          </DataProvider>
        </ShopProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}
