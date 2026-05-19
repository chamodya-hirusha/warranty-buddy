"use client";

import { useState } from "react";
import { useData } from "@/hooks/useData";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, Search, CreditCard, Pencil, Trash2, Calendar, Tag, DollarSign } from "lucide-react";
import { EmptyState } from "@/components/EmptyState";
import { ExpenseDialog } from "@/components/ExpenseDialog";
import { ConfirmDialog } from "@/components/ConfirmDialog";
import type { Expense } from "@/db/types";

export default function ExpensesPage() {
  const { expenses, deleteExpense } = useData();
  const [q, setQ] = useState("");
  
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Expense | null>(null);
  const [confirming, setConfirming] = useState<Expense | null>(null);

  const filtered = expenses.filter((e) =>
    [e.title, e.category].some((v) => v.toLowerCase().includes(q.toLowerCase())),
  );

  const totalExpense = filtered.reduce((acc, curr) => acc + curr.amount, 0);

  return (
    <div className="space-y-6">
      {/* Top Banner / Summary Card */}
      <div className="grid sm:grid-cols-3 gap-4">
        <div className="card-elevated p-5 flex items-center gap-4 bg-gradient-to-br from-red-500/10 to-orange-500/5 border border-red-500/20">
          <div className="p-3 bg-red-500/20 rounded-xl text-red-600 dark:text-red-400">
            <DollarSign className="h-6 w-6" />
          </div>
          <div>
            <p className="text-xs text-muted-foreground uppercase font-semibold tracking-wider">Total Expenses</p>
            <p className="text-2xl font-bold mt-0.5 text-foreground">${totalExpense.toFixed(2)}</p>
          </div>
        </div>

        <div className="card-elevated p-5 flex items-center gap-4">
          <div className="p-3 bg-blue-500/20 rounded-xl text-blue-600 dark:text-blue-400">
            <CreditCard className="h-6 w-6" />
          </div>
          <div>
            <p className="text-xs text-muted-foreground uppercase font-semibold tracking-wider">Transaction Count</p>
            <p className="text-2xl font-bold mt-0.5 text-foreground">{filtered.length}</p>
          </div>
        </div>

        <div className="card-elevated p-5 flex items-center gap-4">
          <div className="p-3 bg-emerald-500/20 rounded-xl text-emerald-600 dark:text-emerald-400">
            <Tag className="h-6 w-6" />
          </div>
          <div>
            <p className="text-xs text-muted-foreground uppercase font-semibold tracking-wider">Categories Used</p>
            <p className="text-2xl font-bold mt-0.5 text-foreground">
              {new Set(filtered.map(e => e.category)).size}
            </p>
          </div>
        </div>
      </div>

      {/* Action Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input 
            className="pl-9" 
            placeholder="Search expenses by description or category..." 
            value={q} 
            onChange={(e) => setQ(e.target.value)} 
          />
        </div>
        <Button onClick={() => { setEditing(null); setOpen(true); }}>
          <Plus className="h-4 w-4 mr-1" /> Add Expense
        </Button>
      </div>

      {/* Expenses List */}
      {filtered.length === 0 ? (
        <EmptyState
          icon={<CreditCard className="h-5 w-5" />}
          title="No expenses found"
          description="Add electric bills, rent, internet fees or other business costs."
        />
      ) : (
        <ul className="grid sm:grid-cols-2 gap-4">
          {filtered.map((e) => (
            <li key={e.id} className="card-elevated p-5 flex items-center justify-between gap-4 border border-border/40 hover:border-primary/20 transition-all duration-300">
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-medium bg-secondary text-secondary-foreground border border-border">
                    {e.category}
                  </span>
                  <span className="text-xs text-muted-foreground flex items-center gap-1">
                    <Calendar className="h-3 w-3" /> {e.date}
                  </span>
                </div>
                <p className="font-semibold text-lg mt-2 truncate text-foreground">{e.title}</p>
                <p className="text-2xl font-bold mt-1 text-red-500/90 dark:text-red-400">
                  -${e.amount.toFixed(2)}
                </p>
              </div>

              <div className="flex flex-col gap-1 shrink-0">
                <Button 
                  variant="ghost" 
                  size="icon" 
                  onClick={() => { setEditing(e); setOpen(true); }}
                  className="hover:bg-primary/10 hover:text-primary transition-colors"
                >
                  <Pencil className="h-4 w-4" />
                </Button>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  onClick={() => setConfirming(e)}
                  className="hover:bg-destructive/10 hover:text-destructive transition-colors"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </li>
          ))}
        </ul>
      )}

      {/* Dialogs */}
      <ExpenseDialog open={open} onOpenChange={setOpen} initial={editing} />

      <ConfirmDialog
        open={!!confirming}
        onOpenChange={(v) => !v && setConfirming(null)}
        title={`Delete expense: "${confirming?.title}"?`}
        description="This expense record will be permanently deleted from your local store."
        onConfirm={async () => {
          if (confirming) await deleteExpense(confirming.id);
          setConfirming(null);
        }}
      />
    </div>
  );
}
