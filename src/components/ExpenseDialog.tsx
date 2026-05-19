"use client";

import { useEffect } from "react";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { useForm } from "react-hook-form";
import { useData } from "@/hooks/useData";
import { toast } from "sonner";
import type { Expense } from "@/db/types";

interface Props {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  initial?: Expense | null;
}

interface FormValues {
  title: string;
  category: string;
  amount: string;
  date: string;
}

const CATEGORIES = [
  "Rent",
  "Electricity",
  "Internet & Phone",
  "Water",
  "Salaries",
  "Inventory & Supplies",
  "Marketing",
  "Repairs & Maintenance",
  "Other"
];

export function ExpenseDialog({ open, onOpenChange, initial }: Props) {
  const { addExpense, updateExpense } = useData();

  const { register, handleSubmit, reset, formState: { errors } } = useForm<FormValues>({
    defaultValues: {
      title: "",
      category: "Other",
      amount: "",
      date: new Date().toISOString().slice(0, 10),
    }
  });

  useEffect(() => {
    if (open) {
      reset({
        title: initial?.title ?? "",
        category: initial?.category ?? "Other",
        amount: initial?.amount?.toString() ?? "",
        date: initial?.date ?? new Date().toISOString().slice(0, 10),
      });
    }
  }, [open, initial, reset]);

  const onSubmit = async (data: FormValues) => {
    const parsedAmount = parseFloat(data.amount);
    if (isNaN(parsedAmount) || parsedAmount <= 0) {
      toast.error("Please enter a valid amount greater than 0");
      return;
    }

    const payload = {
      title: data.title.trim(),
      category: data.category,
      amount: parsedAmount,
      date: data.date,
    };

    if (initial) {
      await updateExpense(initial.id, payload);
      toast.success("Expense updated successfully");
    } else {
      await addExpense(payload);
      toast.success("Expense added successfully");
    }
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{initial ? "Edit Expense" : "New Expense"}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 py-2">
          
          <div className="space-y-1.5">
            <Label htmlFor="title">Title / Description</Label>
            <Input 
              id="title" 
              placeholder="e.g. Electric bill - May" 
              {...register("title", { required: "Title is required" })} 
            />
            {errors.title && <p className="text-xs text-destructive">{errors.title.message}</p>}
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="category">Category</Label>
            <select
              id="category"
              className="flex h-9 w-full items-center justify-between whitespace-nowrap rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-1 focus:ring-ring"
              {...register("category", { required: "Category is required" })}
            >
              {CATEGORIES.map((cat) => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
            {errors.category && <p className="text-xs text-destructive">{errors.category.message}</p>}
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="amount">Amount ($)</Label>
              <Input 
                id="amount" 
                type="number" 
                step="0.01" 
                placeholder="0.00" 
                {...register("amount", { required: "Amount is required" })} 
              />
              {errors.amount && <p className="text-xs text-destructive">{errors.amount.message}</p>}
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="date">Date</Label>
              <Input 
                id="date" 
                type="date" 
                {...register("date", { required: "Date is required" })} 
              />
              {errors.date && <p className="text-xs text-destructive">{errors.date.message}</p>}
            </div>
          </div>

          <DialogFooter className="pt-2">
            <Button type="button" variant="ghost" onClick={() => onOpenChange(false)}>Cancel</Button>
            <Button type="submit">{initial ? "Save changes" : "Add Expense"}</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
