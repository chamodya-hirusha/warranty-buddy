"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, Search, Wrench as Tool, ChevronRight, Pencil, Trash2 } from "lucide-react";
import Link from "next/link";
import { EmptyState } from "@/components/EmptyState";
import { useData } from "@/hooks/useData";
import { RepairDialog } from "@/components/RepairDialog";
import { ConfirmDialog } from "@/components/ConfirmDialog";
import type { Repair } from "@/db/types";

function RepairStatusBadge({ status }: { status: string }) {
  const colors = {
    pending: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-500",
    soon: "bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-500",
    active: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-500",
    diagnosing: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-500",
    repairing: "bg-indigo-100 text-indigo-800 dark:bg-indigo-900/30 dark:text-indigo-500",
    completed: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-500",
    delivered: "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-400",
  };
  
  const cls = colors[status.toLowerCase() as keyof typeof colors] || "bg-gray-100 text-gray-800";
  
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${cls}`}>
      {status.charAt(0).toUpperCase() + status.slice(1)}
    </span>
  );
}

export default function RepairsPage() {
  const { repairs, deleteRepair } = useData();
  const [q, setQ] = useState("");

  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Repair | null>(null);
  const [confirming, setConfirming] = useState<Repair | null>(null);

  const filtered = repairs.filter((r) =>
    [r.deviceName, r.problem, r.status].some((v) => v?.toLowerCase().includes(q.toLowerCase())),
  );

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input className="pl-9" placeholder="Search repairs by device or problem" value={q} onChange={(e) => setQ(e.target.value)} />
        </div>
        <Button onClick={() => { setEditing(null); setOpen(true); }}>
          <Plus className="h-4 w-4 mr-1" /> Add repair
        </Button>
      </div>

      {filtered.length === 0 ? (
        <EmptyState
          icon={<Tool className="h-5 w-5" />}
          title="No repairs found"
          description="Try a different search or add a new repair."
        />
      ) : (
        <ul className="grid sm:grid-cols-2 gap-3">
          {filtered.map((r) => (
            <li key={r.id} className="card-elevated p-4 flex items-start justify-between gap-3">
              <Link href={`/repairs/${r.id}`} className="min-w-0 flex-1 group">
                <p className="font-semibold truncate group-hover:text-primary inline-flex items-center gap-1">
                  {r.deviceName} <ChevronRight className="h-4 w-4 opacity-0 group-hover:opacity-100 transition-opacity shrink-0" />
                </p>
                <p className="text-sm text-muted-foreground mt-0.5">{r.problem}</p>
                {r.cost && (
                  <p className="text-xs text-muted-foreground mt-2">
                    Cost: <span className="font-semibold text-foreground">
                      {(() => {
                        const parsed = parseFloat(r.cost);
                        return isNaN(parsed) ? r.cost : `$${parsed.toFixed(2)}`;
                      })()}
                    </span>
                  </p>
                )}
                {r.techNotes && <p className="text-xs text-muted-foreground mt-1 line-clamp-1 italic text-opacity-80">"{r.techNotes}"</p>}
              </Link>
              <div className="flex flex-col items-end justify-between gap-2 shrink-0 h-full">
                <RepairStatusBadge status={r.status} />
                <div className="flex gap-1 mt-2">
                  <Button variant="ghost" size="icon" onClick={() => { setEditing(r); setOpen(true); }}>
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="icon" onClick={() => setConfirming(r)}>
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}

      <RepairDialog open={open} onOpenChange={setOpen} initial={editing} />

      <ConfirmDialog
        open={!!confirming}
        onOpenChange={(v) => !v && setConfirming(null)}
        title={`Delete repair for ${confirming?.deviceName}?`}
        description="This will permanently delete the repair record."
        onConfirm={async () => {
          if (confirming) await deleteRepair(confirming.id);
          setConfirming(null);
        }}
      />
    </div>
  );
}
