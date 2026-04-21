import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ThemeProvider } from "@/hooks/useTheme";
import { DataProvider } from "@/hooks/useData";
import { ShopProvider } from "@/hooks/useShop";
import { AppLayout } from "@/components/AppLayout";
import Dashboard from "./pages/Dashboard";
import CustomersPage from "./pages/CustomersPage";
import CustomerDetailPage from "./pages/CustomerDetailPage";
import ProductsPage from "./pages/ProductsPage";
import WarrantiesPage from "./pages/WarrantiesPage";
import SettingsPage from "./pages/SettingsPage";
import NotFound from "./pages/NotFound.tsx";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider>
      <ShopProvider>
        <DataProvider>
          <TooltipProvider>
            <Toaster />
            <Sonner position="top-right" richColors />
            <BrowserRouter>
              <Routes>
                <Route element={<AppLayout />}>
                  <Route path="/" element={<Dashboard />} />
                  <Route path="/warranties" element={<WarrantiesPage />} />
                  <Route path="/customers" element={<CustomersPage />} />
                  <Route path="/customers/:id" element={<CustomerDetailPage />} />
                  <Route path="/products" element={<ProductsPage />} />
                  <Route path="/settings" element={<SettingsPage />} />
                </Route>
                {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
                <Route path="*" element={<NotFound />} />
              </Routes>
            </BrowserRouter>
          </TooltipProvider>
        </DataProvider>
      </ShopProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;
