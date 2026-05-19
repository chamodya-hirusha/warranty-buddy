"use client";

import { useEffect } from "react";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { useForm } from "react-hook-form";
import { useData } from "@/hooks/useData";
import { toast } from "sonner";
import type { Repair } from "@/db/types";

interface Props {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  initial?: Repair | null;
}

interface FormValues {
  customerId: string;
  deviceId: string;
  deviceName: string;
  problem: string;
  status: string;
  cost: string;
  techNotes: string;
  receivedDate: string;
  deliveryDate: string;
}

export function RepairDialog({ open, onOpenChange, initial }: Props) {
  const { addRepair, updateRepair, customers } = useData();

  const { register, handleSubmit, reset, formState: { errors } } = useForm<FormValues>({
    defaultValues: {
      customerId: "",
      deviceId: "",
      deviceName: "",
      problem: "",
      status: "pending",
      cost: "",
      techNotes: "",
      receivedDate: new Date().toISOString().slice(0, 10),
      deliveryDate: "",
    }
  });

  useEffect(() => {
    if (open) {
      reset({
        customerId: initial?.customerId ?? (customers.length > 0 ? customers[0].id : ""),
        deviceId: initial?.deviceId ?? "",
        deviceName: initial?.deviceName ?? "",
        problem: initial?.problem ?? "",
        status: initial?.status ?? "pending",
        cost: initial?.cost ?? "",
        techNotes: initial?.techNotes ?? "",
        receivedDate: initial?.receivedDate ?? new Date().toISOString().slice(0, 10),
        deliveryDate: initial?.deliveryDate ?? "",
      });
    }
  }, [open, initial, reset, customers]);

  const onSubmit = async (data: FormValues) => {
    if (!data.customerId) {
      toast.error("Please select a customer");
      return;
    }

    const payload = {
      customerId: data.customerId,
      deviceId: data.deviceId.trim() || undefined,
      deviceName: data.deviceName.trim(),
      problem: data.problem.trim(),
      status: data.status,
      cost: data.cost.trim() || undefined,
      techNotes: data.techNotes.trim() || undefined,
      receivedDate: data.receivedDate || undefined,
      deliveryDate: data.deliveryDate || undefined,
    };

    if (initial) {
      await updateRepair(initial.id, payload);
      toast.success("Repair updated");
    } else {
      await addRepair(payload);
      toast.success("Repair added");
    }
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{initial ? "Edit repair" : "New repair"}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 py-2">
          <div className="space-y-1.5">
            <Label htmlFor="customerId">Customer</Label>
            <select
              id="customerId"
              className="flex h-9 w-full items-center justify-between whitespace-nowrap rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
              {...register("customerId", { required: "Customer is required" })}
            >
              <option value="">Select a customer...</option>
              {customers.map(c => (
                <option key={c.id} value={c.id}>{c.name} ({c.phone})</option>
              ))}
            </select>
            {errors.customerId && <p className="text-xs text-destructive">{errors.customerId.message}</p>}
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="deviceName">Device Name</Label>
              <Input id="deviceName" placeholder="iPhone 13 Pro" {...register("deviceName", { required: "Device name is required" })} />
              {errors.deviceName && <p className="text-xs text-destructive">{errors.deviceName.message}</p>}
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="deviceId">Device ID / Serial (Optional)</Label>
              <Input id="deviceId" placeholder="IMEI or Serial" {...register("deviceId")} />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="problem">Problem Description</Label>
            <Input id="problem" placeholder="Screen cracked" {...register("problem", { required: "Problem is required" })} />
            {errors.problem && <p className="text-xs text-destructive">{errors.problem.message}</p>}
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="status">Status</Label>
              <select
                id="status"
                className="flex h-9 w-full items-center justify-between whitespace-nowrap rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                {...register("status")}
              >
                <option value="pending">Pending</option>
                <option value="diagnosing">Diagnosing</option>
                <option value="repairing">Repairing</option>
                <option value="completed">Completed</option>
                <option value="delivered">Delivered</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="cost">Estimated Cost</Label>
              <Input id="cost" placeholder="$150" {...register("cost")} />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="receivedDate">Received Date</Label>
              <Input id="receivedDate" type="date" {...register("receivedDate")} />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="deliveryDate">Delivery Date</Label>
              <Input id="deliveryDate" type="date" {...register("deliveryDate")} />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="techNotes">Technician Notes (Optional)</Label>
            <Input id="techNotes" placeholder="Needs replacement part" {...register("techNotes")} />
          </div>

          <DialogFooter className="pt-2">
            <Button type="button" variant="ghost" onClick={() => onOpenChange(false)}>Cancel</Button>
            <Button type="submit">{initial ? "Save changes" : "Add repair"}</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
