"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useData } from "@/hooks/useData";
import { Button } from "@/components/ui/button";
import { 
  ArrowLeft, Wrench, Calendar, Phone, MessageSquare, 
  User, Cpu, DollarSign, FileText, Pencil, Printer, ShieldAlert
} from "lucide-react";
import { EmptyState } from "@/components/EmptyState";
import { RepairDialog } from "@/components/RepairDialog";
import { cn } from "@/lib/utils";

export default function RepairDetailPage({ params }: { params: { id: string } }) {
  const id = params.id;
  const router = useRouter();
  const { repairs, customers, products } = useData();

  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);

  const repair = repairs.find((r) => r.id === id);

  const customer = useMemo(() => {
    if (!repair) return null;
    return customers.find((c) => c.id === repair.customerId);
  }, [customers, repair]);

  const product = useMemo(() => {
    if (!repair || !repair.deviceId) return null;
    return products.find(
      (p) => p.id === repair.deviceId || (p.serial && p.serial === repair.deviceId)
    );
  }, [products, repair]);

  if (!repair) {
    return (
      <div className="space-y-4">
        <Button variant="ghost" onClick={() => router.push("/repairs")}>
          <ArrowLeft className="h-4 w-4 mr-1" /> Back to repairs
        </Button>
        <EmptyState
          icon={<Wrench className="h-5 w-5" />}
          title="Repair record not found"
          description="This repair ticket may have been deleted."
        />
      </div>
    );
  }

  // Handle printing
  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6 print:p-0">
      {/* Top Action Bar - Hidden during printing */}
      <div className="flex items-center justify-between print:hidden">
        <Button variant="ghost" size="sm" onClick={() => router.push("/repairs")} className="-ml-2">
          <ArrowLeft className="h-4 w-4 mr-1" /> Repairs
        </Button>
        <div className="flex gap-2">
          <Button onClick={handlePrint} variant="outline" size="sm">
            <Printer className="h-4 w-4 mr-1" /> Print Job Sheet
          </Button>
          <Button onClick={() => setIsEditDialogOpen(true)} size="sm">
            <Pencil className="h-4 w-4 mr-1" /> Edit Ticket
          </Button>
        </div>
      </div>

      {/* Main Repair Job Sheet Card */}
      <div className="card-elevated p-6 space-y-6 relative overflow-hidden bg-gradient-to-br from-card to-secondary/10 print:border-none print:shadow-none print:bg-white print:text-black">
        {/* Header Block */}
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 border-b border-border/40 pb-5">
          <div className="space-y-1">
            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-widest print:text-black/60">Repair Work Order</span>
            <h1 className="text-3xl font-extrabold tracking-tight text-foreground print:text-black">{repair.deviceName}</h1>
            <p className="text-sm font-medium text-destructive mt-1 italic print:text-black">
              Problem: {repair.problem}
            </p>
          </div>
          <span className={cn(
            "inline-flex items-center px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider shrink-0 print:border print:text-black",
            repair.status.toLowerCase() === "pending" ? "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400 border-amber-500/25" :
            repair.status.toLowerCase() === "completed" ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400 border-emerald-500/25" :
            "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400 border-blue-500/25"
          )}>
            {repair.status}
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
          {/* Customer Details Block */}
          <div className="space-y-4">
            <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
              <User className="h-3.5 w-3.5" /> Customer Info
            </h3>
            {customer ? (
              <div className="bg-background/40 p-4 rounded-lg border border-border/30 print:bg-gray-50 print:border-gray-200">
                <p className="font-bold text-lg text-foreground print:text-black">{customer.name}</p>
                
                <div className="space-y-2 mt-3">
                  <div className="flex items-center gap-2 text-sm">
                    <Phone className="h-4 w-4 text-muted-foreground shrink-0" />
                    <a href={`tel:${customer.phone}`} className="hover:text-primary transition-colors print:no-underline">
                      {customer.phone}
                    </a>
                  </div>

                  {customer.whatsapp && (
                    <div className="flex items-center gap-2 text-sm print:hidden">
                      <MessageSquare className="h-4 w-4 text-emerald-500 shrink-0" />
                      <a 
                        href={`https://wa.me/${customer.whatsapp.replace(/[^0-9]/g, "")}`} 
                        target="_blank" 
                        rel="noopener noreferrer" 
                        className="hover:text-primary transition-colors"
                      >
                        WhatsApp Chat
                      </a>
                    </div>
                  )}

                  {customer.address && (
                    <p className="text-xs text-muted-foreground mt-2">
                      Address: <span className="text-foreground font-medium print:text-black">{customer.address}</span>
                    </p>
                  )}
                </div>
              </div>
            ) : (
              <p className="text-sm text-muted-foreground italic">No customer linked</p>
            )}
          </div>

          {/* Product/Device Identification Block */}
          <div className="space-y-4">
            <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
              <Cpu className="h-3.5 w-3.5" /> Linked Product Inventory Info
            </h3>
            {product ? (
              <div className="bg-background/40 p-4 rounded-lg border border-border/30 print:bg-gray-50 print:border-gray-200">
                <Link href={`/products/${product.id}`} className="font-bold text-lg text-foreground hover:text-primary transition-colors block print:no-underline print:text-black">
                  {product.name}
                </Link>
                <div className="space-y-1.5 mt-3 text-xs text-muted-foreground print:text-black">
                  {product.serial && <p>Serial Number: <span className="mono font-semibold text-foreground print:text-black">{product.serial}</span></p>}
                  {product.sku && <p>SKU: <span className="mono font-semibold text-foreground print:text-black">{product.sku}</span></p>}
                  {product.warrantyPeriod && <p>Base Warranty: <span className="font-medium text-foreground print:text-black">{product.warrantyPeriod} Months</span></p>}
                </div>
              </div>
            ) : (
              <div className="bg-background/20 p-4 rounded-lg border border-border/20 border-dashed">
                <p className="text-sm font-semibold text-foreground">Custom/Non-Stock Device</p>
                <p className="text-xs text-muted-foreground mt-1">
                  Device ID/Serial: <span className="mono font-medium text-foreground">{repair.deviceId || "—"}</span>
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Cost and Timeline Metrics */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-6 border-t border-border/40">
          <div className="bg-background/40 p-4 rounded-lg border border-border/30 print:bg-gray-50">
            <span className="text-xs text-muted-foreground font-semibold flex items-center gap-1">
              <DollarSign className="h-3.5 w-3.5" /> Service Cost
            </span>
            <p className="text-xl font-extrabold text-emerald-600 dark:text-emerald-400 mt-1">
              {repair.cost ? (
                (() => {
                  const parsed = parseFloat(repair.cost);
                  return isNaN(parsed) ? repair.cost : `$${parsed.toFixed(2)}`;
                })()
              ) : "—"}
            </p>
          </div>

          <div className="bg-background/40 p-4 rounded-lg border border-border/30 print:bg-gray-50">
            <span className="text-xs text-muted-foreground font-semibold flex items-center gap-1">
              <Calendar className="h-3.5 w-3.5" /> Date Received
            </span>
            <p className="text-lg font-bold text-foreground mt-1 print:text-black">
              {repair.receivedDate || "—"}
            </p>
          </div>

          <div className="bg-background/40 p-4 rounded-lg border border-border/30 print:bg-gray-50">
            <span className="text-xs text-muted-foreground font-semibold flex items-center gap-1">
              <Calendar className="h-3.5 w-3.5" /> Promised Delivery Date
            </span>
            <p className="text-lg font-bold text-foreground mt-1 print:text-black">
              {repair.deliveryDate || "—"}
            </p>
          </div>
        </div>

        {/* Technician Work Notes */}
        <div className="space-y-2 pt-4 border-t border-border/40">
          <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
            <FileText className="h-3.5 w-3.5" /> Technician & Diagnostic Notes
          </h3>
          <div className="bg-secondary/40 p-4 rounded-lg border border-border/20 min-h-[80px] print:bg-gray-50 print:border-gray-200">
            {repair.techNotes ? (
              <p className="text-sm text-foreground whitespace-pre-wrap leading-relaxed print:text-black">{repair.techNotes}</p>
            ) : (
              <p className="text-sm text-muted-foreground italic">No technician notes logged yet.</p>
            )}
          </div>
        </div>

        {/* Print Disclaimer */}
        <div className="hidden print:block text-[10px] text-muted-foreground text-center pt-8 border-t border-dashed">
          Thank you for choosing our repair service. Please present this job sheet upon device collection.
        </div>
      </div>

      {/* Edit Repair Dialog */}
      <RepairDialog 
        open={isEditDialogOpen} 
        onOpenChange={setIsEditDialogOpen} 
        initial={repair} 
      />
    </div>
  );
}
