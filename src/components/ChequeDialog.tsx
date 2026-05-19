"use client";

import { useEffect } from "react";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { useForm } from "react-hook-form";
import { useData } from "@/hooks/useData";
import { toast } from "sonner";
import { Trash2 } from "lucide-react";
import type { Cheque } from "@/db/types";

interface Props {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  initial?: Cheque | null;
}

interface FormValues {
  number: string;
  bank: string;
  amount: string;
  date: string;
  status: "pending" | "cleared" | "returned";
}

export function ChequeDialog({ open, onOpenChange, initial }: Props) {
  const { addCheque, updateCheque, deleteCheque } = useData();

  const { register, handleSubmit, reset, formState: { errors } } = useForm<FormValues>({
    defaultValues: {
      number: "",
      bank: "",
      amount: "",
      date: new Date().toISOString().slice(0, 10),
      status: "pending",
    }
  });

  useEffect(() => {
    if (open) {
      reset({
        number: initial?.number ?? "",
        bank: initial?.bank ?? "",
        amount: initial?.amount ? String(initial.amount) : "",
        date: initial?.date ?? new Date().toISOString().slice(0, 10),
        status: initial?.status ?? "pending",
      });
    }
  }, [open, initial, reset]);

  const onSubmit = async (data: FormValues) => {
    const parsedAmount = parseFloat(data.amount);
    if (isNaN(parsedAmount) || parsedAmount <= 0) {
      toast.error("Please enter a valid cheque amount");
      return;
    }

    const payload = {
      number: data.number.trim(),
      bank: data.bank.trim(),
      amount: parsedAmount,
      date: data.date,
      status: data.status,
    };

    try {
      if (initial) {
        await updateCheque(initial.id, payload);
        toast.success("Cheque ticket updated successfully");
      } else {
        await addCheque(payload);
        toast.success("Cheque registered successfully");
      }
      onOpenChange(false);
    } catch (err) {
      toast.error("An error occurred while saving the cheque");
      console.error(err);
    }
  };

  const handleDelete = async () => {
    if (!initial) return;
    if (confirm("Are you sure you want to delete this cheque?")) {
      try {
        await deleteCheque(initial.id);
        toast.success("Cheque deleted successfully");
        onOpenChange(false);
      } catch (err) {
        toast.error("Failed to delete cheque");
        console.error(err);
      }
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[450px]">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <DialogHeader>
            <DialogTitle>{initial ? "Edit Cheque details" : "Register New Cheque"}</DialogTitle>
          </DialogHeader>

          <div className="space-y-3 py-2">
            <div className="space-y-1">
              <Label htmlFor="number">Cheque Number</Label>
              <Input 
                id="number" 
                placeholder="e.g. CHQ-802741"
                {...register("number", { required: "Cheque number is required" })} 
              />
              {errors.number && <p className="text-xs text-red-500">{errors.number.message}</p>}
            </div>

            <div className="space-y-1">
              <Label htmlFor="bank">Bank Name</Label>
              <Input 
                id="bank" 
                placeholder="e.g. Bank of Ceylon / Commercial Bank"
                {...register("bank", { required: "Bank name is required" })} 
              />
              {errors.bank && <p className="text-xs text-red-500">{errors.bank.message}</p>}
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label htmlFor="amount">Amount ($)</Label>
                <Input 
                  id="amount" 
                  type="number"
                  step="0.01"
                  placeholder="0.00"
                  {...register("amount", { required: "Amount is required" })} 
                />
                {errors.amount && <p className="text-xs text-red-500">{errors.amount.message}</p>}
              </div>

              <div className="space-y-1">
                <Label htmlFor="date">Due Date</Label>
                <Input 
                  id="date" 
                  type="date"
                  {...register("date", { required: "Date is required" })} 
                />
                {errors.date && <p className="text-xs text-red-500">{errors.date.message}</p>}
              </div>
            </div>

            <div className="space-y-1">
              <Label htmlFor="status">Cheque Status</Label>
              <select
                id="status"
                className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 dark:bg-zinc-950"
                {...register("status")}
              >
                <option value="pending" className="dark:text-black">Pending</option>
                <option value="cleared" className="dark:text-black">Cleared</option>
                <option value="returned" className="dark:text-black">Returned</option>
              </select>
            </div>
          </div>

          <DialogFooter className="flex items-center justify-between sm:justify-between gap-2 pt-2">
            {initial ? (
              <Button type="button" variant="destructive" size="icon" onClick={handleDelete} title="Delete Cheque">
                <Trash2 className="h-4 w-4" />
              </Button>
            ) : <div />}
            <div className="flex gap-2">
              <Button type="button" variant="ghost" onClick={() => onOpenChange(false)}>
                Cancel
              </Button>
              <Button type="submit">
                {initial ? "Save changes" : "Register Cheque"}
              </Button>
            </div>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
