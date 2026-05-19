"use client";

import { useEffect } from "react";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { useForm } from "react-hook-form";
import { useData } from "@/hooks/useData";
import { toast } from "sonner";

interface Props {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  initial?: any | null;
}

interface FormValues {
  name: string;
  phone: string;
  whatsapp: string;
  useSameForWhatsApp: boolean;
  email: string;
  address: string;
  birthday: string;
}

export function CustomerDialog({ open, onOpenChange, initial }: Props) {
  const { addCustomer, updateCustomer } = useData();
  
  const { register, handleSubmit, watch, setValue, reset, formState: { errors } } = useForm<FormValues>({
    defaultValues: {
      name: "",
      phone: "",
      whatsapp: "",
      useSameForWhatsApp: false,
      email: "",
      address: "",
      birthday: "",
    }
  });

  const phoneValue = watch("phone");
  const useSame = watch("useSameForWhatsApp");

  useEffect(() => {
    if (open) {
      reset({
        name: initial?.name ?? "",
        phone: initial?.phone ?? "",
        whatsapp: initial?.whatsapp ?? initial?.phone ?? "",
        useSameForWhatsApp: initial?.whatsapp === initial?.phone && !!initial?.phone,
        email: initial?.email ?? "",
        address: initial?.address ?? "",
        birthday: initial?.birthday ?? "",
      });
    }
  }, [open, initial, reset]);

  useEffect(() => {
    if (useSame) {
      setValue("whatsapp", phoneValue);
    }
  }, [phoneValue, useSame, setValue]);

  const onSubmit = async (data: FormValues) => {
    const payload = {
      name: data.name.trim(),
      phone: data.phone.trim(),
      whatsapp: data.useSameForWhatsApp ? data.phone.trim() : data.whatsapp.trim(),
      email: data.email.trim(),
      address: data.address.trim(),
      birthday: data.birthday.trim(),
    };

    if (initial) {
      await updateCustomer(initial.id, payload);
      toast.success("Customer updated");
    } else {
      await addCustomer(payload);
      toast.success("Customer added");
    }
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{initial ? "Edit customer" : "New customer"}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 py-2">
          <div className="space-y-1.5">
            <Label htmlFor="name">Full Name</Label>
            <Input id="name" placeholder="Jane Doe" {...register("name", { required: "Name is required" })} />
            {errors.name && <p className="text-xs text-destructive">{errors.name.message}</p>}
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="phone">Mobile Number</Label>
              <Input id="phone" inputMode="tel" placeholder="+1 555 123 4567" {...register("phone", { required: "Phone is required" })} />
              {errors.phone && <p className="text-xs text-destructive">{errors.phone.message}</p>}
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="whatsapp">WhatsApp Number</Label>
              <Input
                id="whatsapp"
                inputMode="tel"
                placeholder="+1 555 123 4567"
                disabled={useSame}
                className={useSame ? "bg-muted text-muted-foreground cursor-not-allowed" : ""}
                {...register("whatsapp", { required: !useSame ? "WhatsApp is required" : false })}
              />
              {errors.whatsapp && <p className="text-xs text-destructive">{errors.whatsapp.message}</p>}
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              id="useSameForWhatsApp"
              className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
              {...register("useSameForWhatsApp")}
            />
            <Label htmlFor="useSameForWhatsApp" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
              Use same number for WhatsApp
            </Label>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="email">Email (Optional)</Label>
            <Input id="email" type="email" placeholder="jane@example.com" {...register("email")} />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="address">Address (Optional)</Label>
              <Input id="address" placeholder="123 Main St, City" {...register("address")} />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="birthday">Birthday (Optional)</Label>
              <Input id="birthday" type="date" {...register("birthday")} />
            </div>
          </div>

          <DialogFooter className="pt-2">
            <Button type="button" variant="ghost" onClick={() => onOpenChange(false)}>Cancel</Button>
            <Button type="submit">{initial ? "Save changes" : "Add customer"}</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
