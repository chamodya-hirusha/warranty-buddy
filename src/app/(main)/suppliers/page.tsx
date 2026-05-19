"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, Search, Truck, ChevronRight, Pencil, Trash2 } from "lucide-react";
import { EmptyState } from "@/components/EmptyState";
import { useData } from "@/hooks/useData";
import { SupplierDialog } from "@/components/SupplierDialog";
import { ConfirmDialog } from "@/components/ConfirmDialog";
import type { Supplier } from "@/db/types";

export default function SuppliersPage() {
  const { suppliers, deleteSupplier } = useData();
  const [q, setQ] = useState("");

  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Supplier | null>(null);
  const [confirming, setConfirming] = useState<Supplier | null>(null);

  const filtered = suppliers.filter((s) =>
    [s.name, s.company, s.phone, s.email].some((v) => v?.toLowerCase().includes(q.toLowerCase())),
  );

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input className="pl-9" placeholder="Search suppliers" value={q} onChange={(e) => setQ(e.target.value)} />
        </div>
        <Button onClick={() => { setEditing(null); setOpen(true); }}>
          <Plus className="h-4 w-4 mr-1" /> Add supplier
        </Button>
      </div>

      {filtered.length === 0 ? (
        <EmptyState
          icon={<Truck className="h-5 w-5" />}
          title="No suppliers found"
          description="Try a different search or add a new supplier."
        />
      ) : (
        <ul className="grid sm:grid-cols-2 gap-3">
          {filtered.map((s) => (
            <li key={s.id} className="card-elevated p-4 flex items-start justify-between gap-3">
              <div className="min-w-0 flex-1 group">
                <p className="font-semibold truncate group-hover:text-primary inline-flex items-center gap-1">
                  {s.name}
                </p>
                <p className="text-sm text-muted-foreground mt-0.5">{s.company}</p>
                <p className="text-xs text-muted-foreground mt-2">{s.phone} {s.email ? `· ${s.email}` : ""}</p>
              </div>
              <div className="flex flex-col gap-1 shrink-0">
                <Button variant="ghost" size="icon" onClick={() => { setEditing(s); setOpen(true); }}>
                  <Pencil className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="icon" onClick={() => setConfirming(s)}>
                  <Trash2 className="h-4 w-4 text-destructive" />
                </Button>
              </div>
            </li>
          ))}
        </ul>
      )}

      <SupplierDialog open={open} onOpenChange={setOpen} initial={editing} />

      <ConfirmDialog
        open={!!confirming}
        onOpenChange={(v) => !v && setConfirming(null)}
        title={`Delete ${confirming?.name}?`}
        description="This will permanently delete the supplier."
        onConfirm={async () => {
          if (confirming) await deleteSupplier(confirming.id);
          setConfirming(null);
        }}
      />
    </div>
  );
}
