"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, Plus, FileText, Printer, Trash2, User, Calendar, DollarSign, ExternalLink } from "lucide-react";
import { EmptyState } from "@/components/EmptyState";
import { useData } from "@/hooks/useData";
import { toast } from "sonner";

export default function InvoicesPage() {
  const { invoices, customers, deleteInvoice } = useData();
  const [q, setQ] = useState("");

  const cMap = new Map(customers.map((c) => [c.id, c]));

  const filtered = invoices.filter((inv) => {
    const cust = cMap.get(inv.customerId);
    const cName = cust ? cust.name : "";
    return [inv.number, cName, String(inv.total)].some((v) =>
      v.toLowerCase().includes(q.toLowerCase())
    );
  });

  const handleDelete = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    if (confirm("Are you sure you want to delete this invoice?")) {
      try {
        await deleteInvoice(id);
        toast.success("Invoice deleted successfully");
      } catch (err) {
        toast.error("Failed to delete invoice");
        console.error(err);
      }
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold tracking-tight text-foreground">Invoice Management</h1>
        <Link href="/invoices/new">
          <Button size="sm">
            <Plus className="h-4 w-4 mr-1" /> Create Invoice
          </Button>
        </Link>
      </div>

      <div className="flex flex-col sm:flex-row sm:items-center gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            className="pl-9"
            placeholder="Search invoices by number, customer name or amount"
            value={q}
            onChange={(e) => setQ(e.target.value)}
          />
        </div>
      </div>

      {filtered.length === 0 ? (
        <EmptyState
          icon={<FileText className="h-5 w-5" />}
          title="No invoices found"
          description="Create a new invoice or adjust your search filter."
          action={
            <Link href="/invoices/new">
              <Button>
                <Plus className="h-4 w-4 mr-1" /> Create Invoice
              </Button>
            </Link>
          }
        />
      ) : (
        <ul className="grid sm:grid-cols-2 gap-3">
          {filtered.map((inv) => {
            const cust = cMap.get(inv.customerId);
            const customerName = cust ? cust.name : "Unknown Customer";
            
            return (
              <li key={inv.id} className="relative group">
                <Link href={`/invoices/${inv.id}`}>
                  <div className="card-elevated p-5 flex items-start justify-between gap-4 border border-border/40 hover:border-primary/20 transition-all duration-300 cursor-pointer">
                    <div className="min-w-0 flex-1 space-y-2">
                      <div className="flex items-center gap-2">
                        <p className="font-bold text-lg text-foreground group-hover:text-primary transition-colors flex items-center gap-1.5">
                          {inv.number}
                          <ExternalLink className="h-3.5 w-3.5 opacity-0 group-hover:opacity-100 transition-opacity text-primary" />
                        </p>
                      </div>

                      <div className="space-y-1">
                        <p className="text-sm text-muted-foreground flex items-center gap-1.5 font-medium">
                          <User className="h-3.5 w-3.5 text-muted-foreground/80 shrink-0" />
                          {customerName}
                        </p>
                        <p className="text-xs text-muted-foreground/80 flex items-center gap-1.5">
                          <Calendar className="h-3.5 w-3.5 text-muted-foreground/80 shrink-0" />
                          Date: <span className="font-semibold text-foreground">{new Date(inv.date || inv.createdAt).toLocaleDateString()}</span>
                        </p>
                      </div>
                    </div>

                    <div className="shrink-0 text-right flex flex-col justify-between h-full min-h-[70px]">
                      <div>
                        <span className="text-[10px] uppercase text-muted-foreground font-semibold flex items-center justify-end gap-0.5">
                          <DollarSign className="h-3.5 w-3.5 text-muted-foreground/80" /> Total
                        </span>
                        <p className="font-extrabold text-xl text-primary text-emerald-600 dark:text-emerald-400">
                          ${parseFloat(String(inv.total)).toFixed(2)}
                        </p>
                      </div>

                      <div className="flex justify-end gap-2 mt-3">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={(e) => handleDelete(inv.id, e)}
                          className="h-8 w-8 text-destructive hover:bg-destructive/10"
                          title="Delete Invoice"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="icon"
                          className="h-8 w-8"
                          title="View & Print Invoice"
                        >
                          <Printer className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </Link>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
