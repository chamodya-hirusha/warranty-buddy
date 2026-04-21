import { useState } from "react";
import { useData } from "@/hooks/useData";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, Pencil, Trash2, Phone, Search, Users, ChevronRight } from "lucide-react";
import { Link } from "react-router-dom";
import { CustomerDialog } from "@/components/CustomerDialog";
import { ConfirmDialog } from "@/components/ConfirmDialog";
import { EmptyState } from "@/components/EmptyState";
import type { Customer } from "@/db/types";
import { toast } from "sonner";

export default function CustomersPage() {
  const { customers, warranties, deleteCustomer } = useData();
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Customer | null>(null);
  const [confirming, setConfirming] = useState<Customer | null>(null);
  const [q, setQ] = useState("");

  const filtered = customers.filter((c) =>
    [c.name, c.phone].some((v) => v.toLowerCase().includes(q.toLowerCase())),
  );

  const onConfirmDelete = async () => {
    if (!confirming) return;
    await deleteCustomer(confirming.id);
    toast.success("Customer deleted");
    setConfirming(null);
  };

  const countWarranties = (id: string) => warranties.filter((w) => w.customerId === id).length;

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input className="pl-9" placeholder="Search customers" value={q} onChange={(e) => setQ(e.target.value)} />
        </div>
        <Button onClick={() => { setEditing(null); setOpen(true); }}>
          <Plus className="h-4 w-4 mr-1" /> Add customer
        </Button>
      </div>

      {filtered.length === 0 ? (
        <EmptyState
          icon={<Users className="h-5 w-5" />}
          title={customers.length === 0 ? "No customers yet" : "No matches"}
          description={customers.length === 0 ? "Add your first customer to start tracking warranties." : "Try a different search."}
          action={customers.length === 0 ? <Button onClick={() => setOpen(true)}><Plus className="h-4 w-4 mr-1" /> Add customer</Button> : undefined}
        />
      ) : (
        <ul className="grid sm:grid-cols-2 gap-3">
          {filtered.map((c) => (
            <li key={c.id} className="card-elevated p-4 flex items-start justify-between gap-3">
              <Link to={`/customers/${c.id}`} className="min-w-0 flex-1 group">
                <p className="font-semibold truncate group-hover:text-primary inline-flex items-center gap-1">
                  {c.name} <ChevronRight className="h-4 w-4 opacity-0 group-hover:opacity-100 transition-opacity" />
                </p>
                <p className="text-sm text-muted-foreground inline-flex items-center gap-1.5 mt-0.5">
                  <Phone className="h-3.5 w-3.5" /> {c.phone}
                </p>
                <p className="text-xs text-muted-foreground mt-2">{countWarranties(c.id)} warranties</p>
              </Link>
              <div className="flex gap-1">
                <Button variant="ghost" size="icon" onClick={() => { setEditing(c); setOpen(true); }} aria-label="Edit">
                  <Pencil className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="icon" onClick={() => setConfirming(c)} aria-label="Delete">
                  <Trash2 className="h-4 w-4 text-destructive" />
                </Button>
              </div>
            </li>
          ))}
        </ul>
      )}

      <CustomerDialog open={open} onOpenChange={setOpen} initial={editing} />
      <ConfirmDialog
        open={!!confirming}
        onOpenChange={(v) => !v && setConfirming(null)}
        title={`Delete ${confirming?.name}?`}
        description="This will also remove all warranties linked to this customer."
        onConfirm={onConfirmDelete}
      />
    </div>
  );
}
