"use client";

import { useState } from "react";
import { useData } from "@/hooks/useData";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, Pencil, Trash2, Tag } from "lucide-react";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ConfirmDialog } from "@/components/ConfirmDialog";
import { Label } from "@/components/ui/label";

type EntityType = "category" | "brand" | "model";

export default function AttributesPage() {
  const { categories, brands, models, addCategory, updateCategory, deleteCategory, addBrand, updateBrand, deleteBrand, addModel, updateModel, deleteModel } = useData();

  const [activeTab, setActiveTab] = useState<EntityType>("category");

  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<{ id: string; name: string } | null>(null);
  const [name, setName] = useState("");

  const [confirming, setConfirming] = useState<{ id: string; name: string } | null>(null);

  const lists = {
    category: { data: categories, add: addCategory, update: updateCategory, del: deleteCategory, label: "Category" },
    brand: { data: brands, add: addBrand, update: updateBrand, del: deleteBrand, label: "Brand" },
    model: { data: models, add: addModel, update: updateModel, del: deleteModel, label: "Model" },
  };

  const current = lists[activeTab];

  const handleEdit = (item: { id: string; name: string }) => {
    setEditing(item);
    setName(item.name);
    setOpen(true);
  };

  const handleAdd = () => {
    setEditing(null);
    setName("");
    setOpen(true);
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    if (editing) {
      await current.update(editing.id, name);
      toast.success(`${current.label} updated`);
    } else {
      await current.add(name);
      toast.success(`${current.label} added`);
    }
    setOpen(false);
  };

  const onConfirmDelete = async () => {
    if (!confirming) return;
    await current.del(confirming.id);
    toast.success(`${current.label} deleted`);
    setConfirming(null);
  };

  return (
    <div className="space-y-6 max-w-4xl">
      <div className="flex flex-col sm:flex-row gap-4 sm:items-center sm:justify-between">
        <div className="flex gap-2 p-1 bg-muted rounded-lg w-fit">
          <button
            onClick={() => setActiveTab("category")}
            className={`px-4 py-1.5 rounded-md text-sm font-medium transition-colors ${activeTab === "category" ? "bg-background shadow-sm text-foreground" : "text-muted-foreground hover:text-foreground"}`}
          >
            Categories
          </button>
          <button
            onClick={() => setActiveTab("brand")}
            className={`px-4 py-1.5 rounded-md text-sm font-medium transition-colors ${activeTab === "brand" ? "bg-background shadow-sm text-foreground" : "text-muted-foreground hover:text-foreground"}`}
          >
            Brands
          </button>
          <button
            onClick={() => setActiveTab("model")}
            className={`px-4 py-1.5 rounded-md text-sm font-medium transition-colors ${activeTab === "model" ? "bg-background shadow-sm text-foreground" : "text-muted-foreground hover:text-foreground"}`}
          >
            Models
          </button>
        </div>
        <Button onClick={handleAdd}>
          <Plus className="h-4 w-4 mr-1" /> Add {current.label.toLowerCase()}
        </Button>
      </div>

      <div className="card-elevated">
        {current.data.length === 0 ? (
          <div className="p-8 text-center text-muted-foreground flex flex-col items-center">
            <Tag className="h-8 w-8 mb-3 opacity-20" />
            <p>No {current.label.toLowerCase()}s found.</p>
            <Button variant="link" onClick={handleAdd}>Add your first {current.label.toLowerCase()}</Button>
          </div>
        ) : (
          <ul className="divide-y">
            {current.data.map((item) => (
              <li key={item.id} className="flex items-center justify-between p-4">
                <span className="font-medium">{item.name}</span>
                <div className="flex gap-1">
                  <Button variant="ghost" size="icon" onClick={() => handleEdit(item)}>
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="icon" onClick={() => setConfirming(item)}>
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editing ? `Edit ${current.label}` : `New ${current.label}`}</DialogTitle>
          </DialogHeader>
          <form onSubmit={submit} className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="name">Name</Label>
              <Input id="name" value={name} onChange={(e) => setName(e.target.value)} autoFocus />
            </div>
            <DialogFooter>
              <Button type="button" variant="ghost" onClick={() => setOpen(false)}>Cancel</Button>
              <Button type="submit">{editing ? "Save" : "Add"}</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <ConfirmDialog
        open={!!confirming}
        onOpenChange={(v) => !v && setConfirming(null)}
        title={`Delete ${confirming?.name}?`}
        description={`Are you sure you want to delete this ${current.label.toLowerCase()}?`}
        onConfirm={onConfirmDelete}
      />
    </div>
  );
}
