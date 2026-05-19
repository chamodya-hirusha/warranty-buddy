"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useForm, useFieldArray } from "react-hook-form";
import { useData } from "@/hooks/useData";
import { toast } from "sonner";
import { Plus, Trash2, ArrowLeft, DollarSign, CreditCard } from "lucide-react";
import Link from "next/link";

interface LineItem {
  productId: string;
  quantity: number;
  price: number;
}

interface FormValues {
  customerId: string;
  paymentMethod: "cash" | "cheque";
  chequeNumber?: string;
  bankName?: string;
  chequeDate?: string;
  items: LineItem[];
}

export default function NewInvoicePage() {
  const { customers, products, addInvoice, addCheque } = useData();
  const router = useRouter();

  const { register, control, handleSubmit, watch, setValue, formState: { errors } } = useForm<FormValues>({
    defaultValues: {
      paymentMethod: "cash",
      items: [{ productId: "", quantity: 1, price: 0 }]
    }
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: "items"
  });

  const paymentMethod = watch("paymentMethod");
  const items = watch("items") || [];

  // Calculate dynamic running total
  const calculatedTotal = items.reduce((acc, curr) => {
    const qty = parseInt(String(curr.quantity), 10) || 0;
    const prc = parseFloat(String(curr.price)) || 0;
    return acc + (qty * prc);
  }, 0);

  const handleProductSelect = (index: number, productId: string) => {
    const prod = products.find((p) => p.id === productId);
    if (prod) {
      setValue(`items.${index}.price`, parseFloat(String(prod.sellPrice)) || 0);
    }
  };

  const onSubmit = async (data: FormValues) => {
    if (!data.customerId) {
      toast.error("Please select a customer");
      return;
    }

    if (!data.items || data.items.length === 0 || data.items.some(i => !i.productId)) {
      toast.error("Please add at least one valid product line item");
      return;
    }

    try {
      const invoiceNumber = `INV-${Date.now().toString().slice(-6)}`;
      
      const payloadItems = data.items.map((item) => ({
        productId: item.productId,
        quantity: parseInt(String(item.quantity), 10) || 1,
        price: parseFloat(String(item.price)) || 0,
      }));

      // 1. Create Invoice
      const invoice = await addInvoice({
        number: invoiceNumber,
        customerId: data.customerId,
        total: calculatedTotal,
        date: new Date().toISOString().slice(0, 10),
      }, payloadItems);

      // 2. If cheque, automatically register in Cheques store too
      if (data.paymentMethod === "cheque" && data.chequeNumber && data.bankName && data.chequeDate) {
        await addCheque({
          number: data.chequeNumber,
          bank: data.bankName,
          amount: calculatedTotal,
          date: data.chequeDate,
          status: "pending",
        });
        toast.success("Cheque payment logged automatically");
      }

      toast.success(`Invoice ${invoiceNumber} created successfully!`);
      router.push("/invoices");
    } catch (err) {
      toast.error("Failed to save invoice");
      console.error(err);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="flex items-center gap-3">
        <Link href="/invoices">
          <Button variant="outline" size="icon" className="rounded-full">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">Create Invoice</h1>
          <p className="text-xs text-muted-foreground">Draft a new invoice for client billing</p>
        </div>
      </div>
      
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Customer & Info Card */}
        <div className="card-elevated p-6 space-y-4">
          <h3 className="font-semibold text-base border-b pb-2 text-foreground">Client Details</h3>
          <div className="grid sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="customerId">Select Customer</Label>
              <select
                id="customerId"
                className="flex h-10 w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-zinc-950"
                {...register("customerId", { required: "Customer is required" })}
              >
                <option value="" className="dark:text-black">-- Choose Customer --</option>
                {customers.map((c) => (
                  <option key={c.id} value={c.id} className="dark:text-black">
                    {c.name} ({c.phone || "No phone"})
                  </option>
                ))}
              </select>
              {errors.customerId && <p className="text-xs text-red-500">{errors.customerId.message}</p>}
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="paymentMethod">Payment Method</Label>
              <select
                id="paymentMethod"
                className="flex h-10 w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-zinc-950"
                {...register("paymentMethod")}
              >
                <option value="cash" className="dark:text-black">Cash</option>
                <option value="cheque" className="dark:text-black">Cheque</option>
              </select>
            </div>
          </div>
        </div>

        {/* Dynamic Line Items Card */}
        <div className="card-elevated p-6 space-y-4">
          <div className="flex items-center justify-between border-b pb-2">
            <h3 className="font-semibold text-base text-foreground">Product Line Items</h3>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => append({ productId: "", quantity: 1, price: 0 })}
            >
              <Plus className="h-4 w-4 mr-1" /> Add Item
            </Button>
          </div>

          <div className="space-y-3">
            {fields.map((field, index) => (
              <div key={field.id} className="flex flex-col sm:flex-row items-end gap-3 border-b sm:border-0 pb-3 sm:pb-0">
                <div className="flex-1 w-full space-y-1">
                  <Label className="sm:hidden">Product</Label>
                  <select
                    className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring dark:bg-zinc-950"
                    {...register(`items.${index}.productId` as const, { required: "Product is required" })}
                    onChange={(e) => handleProductSelect(index, e.target.value)}
                  >
                    <option value="" className="dark:text-black">-- Choose Product --</option>
                    {products.map((p) => (
                      <option key={p.id} value={p.id} className="dark:text-black">
                        {p.name} (${parseFloat(String(p.sellPrice)).toFixed(2)} · Stock: {p.quantity})
                      </option>
                    ))}
                  </select>
                </div>

                <div className="w-full sm:w-28 space-y-1">
                  <Label className="sm:hidden">Price ($)</Label>
                  <Input
                    type="number"
                    step="0.01"
                    placeholder="Price"
                    {...register(`items.${index}.price` as const, { required: true, valueAsNumber: true })}
                  />
                </div>

                <div className="w-full sm:w-24 space-y-1">
                  <Label className="sm:hidden">Qty</Label>
                  <Input
                    type="number"
                    placeholder="Qty"
                    {...register(`items.${index}.quantity` as const, { required: true, valueAsNumber: true })}
                  />
                </div>

                {fields.length > 1 && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => remove(index)}
                    className="text-destructive shrink-0"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Cheque details (conditionally rendered) */}
        {paymentMethod === "cheque" && (
          <div className="card-elevated p-6 space-y-4 bg-muted/10 border-yellow-500/20">
            <h3 className="font-semibold text-base border-b pb-2 text-foreground flex items-center gap-1.5">
              <CreditCard className="h-5 w-5 text-yellow-500" /> Cheque Payment Details
            </h3>
            
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="chequeNumber">Cheque Number</Label>
                <Input id="chequeNumber" placeholder="CHQ-123456" {...register("chequeNumber", { required: "Required" })} />
                {errors.chequeNumber && <p className="text-xs text-red-500">{errors.chequeNumber.message}</p>}
              </div>
              
              <div className="space-y-1.5">
                <Label htmlFor="bankName">Bank Name</Label>
                <Input id="bankName" placeholder="Bank of Ceylon" {...register("bankName", { required: "Required" })} />
                {errors.bankName && <p className="text-xs text-red-500">{errors.bankName.message}</p>}
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="chequeDate">Due Date</Label>
                <Input id="chequeDate" type="date" {...register("chequeDate", { required: "Required" })} />
                {errors.chequeDate && <p className="text-xs text-red-500">{errors.chequeDate.message}</p>}
              </div>
            </div>
          </div>
        )}

        {/* Form Actions Footer */}
        <div className="flex items-center justify-between border-t pt-4">
          <div className="space-y-1">
            <p className="text-xs text-muted-foreground font-semibold flex items-center gap-0.5 uppercase">
              <DollarSign className="h-3.5 w-3.5" /> Total Invoice Amount
            </p>
            <p className="text-2xl font-extrabold text-emerald-600 dark:text-emerald-400">
              ${calculatedTotal.toFixed(2)}
            </p>
          </div>
          
          <div className="flex justify-end gap-3">
            <Link href="/invoices">
              <Button type="button" variant="ghost">Cancel</Button>
            </Link>
            <Button type="submit" size="lg">Create Invoice</Button>
          </div>
        </div>
      </form>
    </div>
  );
}
