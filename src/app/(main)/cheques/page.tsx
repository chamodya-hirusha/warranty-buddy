"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, CreditCard, Plus, Calendar, DollarSign, Landmark } from "lucide-react";
import { EmptyState } from "@/components/EmptyState";
import { useData } from "@/hooks/useData";
import { ChequeDialog } from "@/components/ChequeDialog";
import type { Cheque } from "@/db/types";

export default function ChequesPage() {
  const { cheques } = useData();
  const [q, setQ] = useState("");
  
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedCheque, setSelectedCheque] = useState<Cheque | null>(null);

  const filtered = cheques.filter((c) =>
    [c.number, c.bank, String(c.amount), c.status].some((v) =>
      v.toLowerCase().includes(q.toLowerCase())
    )
  );

  const handleEditCheque = (cheque: Cheque) => {
    setSelectedCheque(cheque);
    setDialogOpen(true);
  };

  const handleAddCheque = () => {
    setSelectedCheque(null);
    setDialogOpen(true);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold tracking-tight text-foreground">Cheque Management</h1>
        <Button onClick={handleAddCheque} size="sm">
          <Plus className="h-4 w-4 mr-1" /> Add Cheque
        </Button>
      </div>
      
      <div className="flex flex-col sm:flex-row sm:items-center gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input 
            className="pl-9" 
            placeholder="Search cheques by number, bank or status" 
            value={q} 
            onChange={(e) => setQ(e.target.value)} 
          />
        </div>
      </div>

      {filtered.length === 0 ? (
        <EmptyState
          icon={<CreditCard className="h-5 w-5" />}
          title="No cheques found"
          description="Create a new cheque record or adjust your search filter."
          action={
            <Button onClick={handleAddCheque}>
              <Plus className="h-4 w-4 mr-1" /> Add Cheque
            </Button>
          }
        />
      ) : (
        <ul className="grid sm:grid-cols-2 gap-3">
          {filtered.map((c) => (
            <li 
              key={c.id} 
              onClick={() => handleEditCheque(c)}
              className="card-elevated p-5 flex items-start justify-between gap-4 border border-border/40 hover:border-primary/20 transition-all duration-300 cursor-pointer"
            >
              <div className="min-w-0 flex-1 space-y-2">
                <div className="flex items-center gap-2">
                  <p className="font-bold text-lg truncate text-foreground hover:text-primary transition-colors">
                    {c.number}
                  </p>
                  <ChequeStatusBadge status={c.status} />
                </div>
                
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground flex items-center gap-1.5 font-medium">
                    <Landmark className="h-3.5 w-3.5 text-muted-foreground/80 shrink-0" />
                    {c.bank}
                  </p>
                  <p className="text-xs text-muted-foreground/80 flex items-center gap-1.5">
                    <Calendar className="h-3.5 w-3.5 text-muted-foreground/80 shrink-0" />
                    Due Date: <span className="font-semibold text-foreground">{c.date}</span>
                  </p>
                </div>
              </div>

              <div className="shrink-0 text-right space-y-1">
                <span className="text-xs text-muted-foreground font-semibold flex items-center justify-end gap-0.5">
                  <DollarSign className="h-3.5 w-3.5 text-muted-foreground/80" /> Amount
                </span>
                <p className="font-extrabold text-xl text-primary text-emerald-600 dark:text-emerald-400">
                  ${parseFloat(String(c.amount)).toFixed(2)}
                </p>
              </div>
            </li>
          ))}
        </ul>
      )}

      {/* Cheque Register / Edit Dialog */}
      <ChequeDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        initial={selectedCheque}
      />
    </div>
  );
}

function ChequeStatusBadge({ status }: { status: string }) {
  const colors = {
    pending: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-500 border-yellow-500/25",
    cleared: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-500 border-green-500/25",
    returned: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-500 border-red-500/25",
  };
  
  const cls = colors[status as keyof typeof colors] || "bg-gray-100 text-gray-800";
  
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold uppercase tracking-wider border ${cls}`}>
      {status}
    </span>
  );
}
