"use client";

import { useEffect } from "react";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { useForm } from "react-hook-form";
import { useData } from "@/hooks/useData";
import { toast } from "sonner";
import type { Supplier } from "@/db/types";

interface Props {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  initial?: Supplier | null;
}

interface FormValues {
  name: string;
  company: string;
  phone: string;
  email: string;
}

export function SupplierDialog({ open, onOpenChange, initial }: Props) {
  const { addSupplier, updateSupplier } = useData();

  const { register, handleSubmit, reset, formState: { errors } } = useForm<FormValues>({
    defaultValues: {
      name: "",
      company: "",
      phone: "",
      email: "",
    }
  });

  useEffect(() => {
    if (open) {
      reset({
        name: initial?.name ?? "",
        company: initial?.company ?? "",
        phone: initial?.phone ?? "",
        email: initial?.email ?? "",
      });
    }
  }, [open, initial, reset]);

  const onSubmit = async (data: FormValues) => {
    const payload = {
      name: data.name.trim(),
      company: data.company.trim(),
      phone: data.phone.trim(),
      email: data.email.trim(),
    };

    if (initial) {
      await updateSupplier(initial.id, payload);
      toast.success("Supplier updated");
    } else {
      await addSupplier(payload);
      toast.success("Supplier added");
    }
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{initial ? "Edit supplier" : "New supplier"}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 py-2">
          <div className="space-y-1.5">
            <Label htmlFor="name">Contact Name</Label>
            <Input id="name" placeholder="John Doe" {...register("name", { required: "Name is required" })} />
            {errors.name && <p className="text-xs text-destructive">{errors.name.message}</p>}
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="company">Company Name</Label>
            <Input id="company" placeholder="Acme Corp" {...register("company", { required: "Company is required" })} />
            {errors.company && <p className="text-xs text-destructive">{errors.company.message}</p>}
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="phone">Phone Number</Label>
              <Input id="phone" inputMode="tel" placeholder="+1 555 123 4567" {...register("phone", { required: "Phone is required" })} />
              {errors.phone && <p className="text-xs text-destructive">{errors.phone.message}</p>}
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="email">Email (Optional)</Label>
              <Input id="email" type="email" placeholder="contact@acme.com" {...register("email")} />
            </div>
          </div>

          <DialogFooter className="pt-2">
            <Button type="button" variant="ghost" onClick={() => onOpenChange(false)}>Cancel</Button>
            <Button type="submit">{initial ? "Save changes" : "Add supplier"}</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
