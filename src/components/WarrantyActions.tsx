// ============================================================
// Reusable dropdown of "Print / Share / Download" actions for a
// single warranty. Used on Warranties list and Customer detail.
// ============================================================
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Printer, Share2, Download, FileText } from "lucide-react";
import type { WarrantyView } from "@/db/types";
import { useShop } from "@/hooks/useShop";
import { downloadWarrantyCard, printWarrantyCard, shareWarrantyCard } from "@/utils/warrantyPdf";
import { toast } from "sonner";

export function WarrantyActions({ warranty }: { warranty: WarrantyView }) {
  const { shop } = useShop();

  const guard = (fn: () => Promise<void>) => async () => {
    try { await fn(); } catch (e) { console.error(e); toast.error("Couldn't generate PDF"); }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" aria-label="Warranty card">
          <FileText className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={guard(() => printWarrantyCard(warranty, shop))}>
          <Printer className="h-4 w-4 mr-2" /> Print receipt
        </DropdownMenuItem>
        <DropdownMenuItem onClick={guard(() => shareWarrantyCard(warranty, shop))}>
          <Share2 className="h-4 w-4 mr-2" /> Share PDF
        </DropdownMenuItem>
        <DropdownMenuItem onClick={guard(() => downloadWarrantyCard(warranty, shop))}>
          <Download className="h-4 w-4 mr-2" /> Download PDF
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
