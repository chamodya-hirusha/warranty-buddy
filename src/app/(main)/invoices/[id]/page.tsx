"use client";

import { use, useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useData } from "@/hooks/useData";
import { useShop } from "@/hooks/useShop";
import { ArrowLeft, Printer, ShieldHalf, Save, Upload, Edit, Landmark, Phone, MapPin, DollarSign, Calendar } from "lucide-react";
import { toast } from "sonner";

interface Props {
  params: { id: string };
}

export default function InvoiceDetailPage({ params }: Props) {
  const { id } = params;
  const router = useRouter();
  const { invoices, invoiceItems, customers, products } = useData();
  const { shop, saveShop } = useShop();

  const [editMode, setEditMode] = useState(false);
  const [shopName, setShopName] = useState(shop.name);
  const [shopPhone, setShopPhone] = useState(shop.phone);
  const [shopAddress, setShopAddress] = useState(shop.address);
  const [shopLogo, setShopLogo] = useState(shop.logo || "");

  useEffect(() => {
    setShopName(shop.name);
    setShopPhone(shop.phone);
    setShopAddress(shop.address);
    setShopLogo(shop.logo || "");
  }, [shop]);

  const invoice = invoices.find((i) => i.id === id);
  if (!invoice) {
    return (
      <div className="text-center py-12 space-y-4">
        <p className="text-muted-foreground">Invoice not found.</p>
        <Link href="/invoices">
          <Button>Back to Invoices</Button>
        </Link>
      </div>
    );
  }

  const customer = customers.find((c) => c.id === invoice.customerId);
  const itemsWithProduct = invoiceItems
    .filter((ii) => ii.invoiceId === invoice.id)
    .map((item) => ({
      ...item,
      product: products.find((p) => p.id === item.productId),
    }));

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 2 * 1024 * 1024) {
      toast.error("Logo file size must be less than 2MB");
      return;
    }
    const reader = new FileReader();
    reader.onload = (event) => {
      setShopLogo(event.target?.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleSaveShop = () => {
    saveShop({
      name: shopName,
      phone: shopPhone,
      address: shopAddress,
      logo: shopLogo,
    });
    setEditMode(false);
    toast.success("Invoice header details updated successfully!");
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Top Nav actions - Hidden when printing */}
      <div className="flex items-center justify-between print:hidden">
        <div className="flex items-center gap-3">
          <Link href="/invoices">
            <Button variant="outline" size="icon" className="rounded-full">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Invoice Details</h1>
            <p className="text-xs text-muted-foreground">{invoice.number}</p>
          </div>
        </div>

        <div className="flex gap-2">
          <Button variant="outline" onClick={() => setEditMode(!editMode)}>
            <Edit className="h-4 w-4 mr-1.5" /> 
            {editMode ? "Cancel Editing" : "Edit Invoice Sheet Header"}
          </Button>
          <Button onClick={handlePrint}>
            <Printer className="h-4 w-4 mr-1.5" /> Print Invoice
          </Button>
        </div>
      </div>

      {/* Interactive Sheet Header Editor - Hidden when printing */}
      {editMode && (
        <div className="card-elevated p-6 space-y-4 border-yellow-500/20 bg-yellow-500/5 print:hidden">
          <h3 className="font-semibold text-base border-b pb-2 text-foreground">Edit Invoice Sheet Header</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-3">
              <div className="space-y-1.5">
                <Label htmlFor="edit-shop-name">Shop/Business Name</Label>
                <Input 
                  id="edit-shop-name" 
                  value={shopName} 
                  onChange={(e) => setShopName(e.target.value)} 
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="edit-shop-phone">Phone Number</Label>
                <Input 
                  id="edit-shop-phone" 
                  value={shopPhone} 
                  onChange={(e) => setShopPhone(e.target.value)} 
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="edit-shop-address">Business Address</Label>
                <Input 
                  id="edit-shop-address" 
                  value={shopAddress} 
                  onChange={(e) => setShopAddress(e.target.value)} 
                />
              </div>
            </div>

            <div className="space-y-3">
              <Label>Shop/Business Logo</Label>
              <div className="flex items-center gap-4">
                <div className="h-20 w-20 rounded-xl border border-dashed border-muted-foreground/30 flex items-center justify-center overflow-hidden bg-secondary/20 shrink-0">
                  {shopLogo ? (
                    <img src={shopLogo} alt="Preview logo" className="h-full w-full object-contain" />
                  ) : (
                    <ShieldHalf className="h-8 w-8 text-muted-foreground/40" />
                  )}
                </div>
                <div className="flex flex-col gap-2">
                  <input
                    type="file"
                    accept="image/*"
                    id="sheet-logo-picker"
                    className="hidden"
                    onChange={handleLogoUpload}
                  />
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      type="button"
                      onClick={() => document.getElementById("sheet-logo-picker")?.click()}
                    >
                      <Upload className="h-3.5 w-3.5 mr-1" /> Upload Image
                    </Button>
                    {shopLogo && (
                      <Button
                        variant="ghost"
                        size="sm"
                        type="button"
                        onClick={() => setShopLogo("")}
                        className="text-destructive hover:text-destructive"
                      >
                        Remove
                      </Button>
                    )}
                  </div>
                  <p className="text-[10px] text-muted-foreground">Supported format: PNG, JPG (Max. 2MB)</p>
                </div>
              </div>
            </div>
          </div>

          <div className="flex justify-end pt-2">
            <Button onClick={handleSaveShop}>
              <Save className="h-4 w-4 mr-1.5" /> Save Branding Settings
            </Button>
          </div>
        </div>
      )}

      {/* The Printable Invoice Sheet Card */}
      <div className="card-elevated p-8 md:p-12 space-y-8 bg-white text-zinc-900 border border-zinc-200 shadow-sm print:shadow-none print:border-none print:p-0 print:m-0 print:text-black">
        {/* Style Sheet for Printing */}
        <style dangerouslySetInnerHTML={{ __html: `
          @media print {
            body {
              background-color: white !important;
              color: black !important;
            }
            .card-elevated {
              border: none !important;
              box-shadow: none !important;
              background: transparent !important;
              padding: 0 !important;
            }
          }
        `}} />

        {/* Invoice Header */}
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-6 border-b border-zinc-100 pb-8">
          <div className="flex items-center gap-4">
            <div className="h-16 w-16 rounded-xl flex items-center justify-center overflow-hidden shrink-0 border border-zinc-100 p-1">
              {shopLogo ? (
                <img src={shopLogo} alt="Shop logo" className="h-full w-full object-contain" />
              ) : (
                <div className="h-full w-full bg-zinc-100 flex items-center justify-center text-zinc-400">
                  <ShieldHalf className="h-8 w-8" />
                </div>
              )}
            </div>
            <div>
              <h2 className="text-xl font-bold tracking-tight text-zinc-900 print:text-black">{shopName}</h2>
              {shopPhone && <p className="text-xs text-zinc-500 flex items-center gap-1"><Phone className="h-3 w-3" /> {shopPhone}</p>}
              {shopAddress && <p className="text-xs text-zinc-500 flex items-center gap-1"><MapPin className="h-3 w-3" /> {shopAddress}</p>}
            </div>
          </div>

          <div className="sm:text-right space-y-1">
            <h1 className="text-3xl font-extrabold tracking-tight text-zinc-900 print:text-black">INVOICE</h1>
            <p className="text-sm text-zinc-500 font-semibold">{invoice.number}</p>
            <p className="text-xs text-zinc-400 flex items-center sm:justify-end gap-1"><Calendar className="h-3 w-3" /> {new Date(invoice.date || invoice.createdAt).toLocaleDateString()}</p>
          </div>
        </div>

        {/* Customer / Billed To Section */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 border-b border-zinc-100 pb-8">
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-400 mb-2">BILLED TO:</h3>
            {customer ? (
              <div className="space-y-1">
                <p className="font-bold text-zinc-900 print:text-black">{customer.name}</p>
                {customer.phone && <p className="text-xs text-zinc-500 flex items-center gap-1.5"><Phone className="h-3.5 w-3.5 text-zinc-400" /> {customer.phone}</p>}
                {customer.email && <p className="text-xs text-zinc-500 flex items-center gap-1.5">{customer.email}</p>}
                {customer.address && <p className="text-xs text-zinc-500 flex items-center gap-1.5"><MapPin className="h-3.5 w-3.5 text-zinc-400" /> {customer.address}</p>}
              </div>
            ) : (
              <p className="text-sm text-zinc-500 font-medium">Walk-in Customer</p>
            )}
          </div>
        </div>

        {/* Invoice Table Items */}
        <div className="space-y-4">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-zinc-200 text-xs font-bold uppercase tracking-wider text-zinc-400">
                <th className="py-3 font-semibold">Product / Item Description</th>
                <th className="py-3 text-right font-semibold w-24">Unit Price</th>
                <th className="py-3 text-center font-semibold w-20">Quantity</th>
                <th className="py-3 text-right font-semibold w-28">Amount</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100 text-sm text-zinc-700">
              {itemsWithProduct.map((item) => (
                <tr key={item.id}>
                  <td className="py-4">
                    <p className="font-semibold text-zinc-900 print:text-black">{item.product?.name || "Unknown Product"}</p>
                    {item.product?.sku && <p className="text-xs text-zinc-400 font-medium">SKU: {item.product.sku}</p>}
                  </td>
                  <td className="py-4 text-right">${parseFloat(String(item.price)).toFixed(2)}</td>
                  <td className="py-4 text-center font-medium">{item.quantity}</td>
                  <td className="py-4 text-right font-bold text-zinc-900 print:text-black">
                    ${(item.quantity * parseFloat(String(item.price))).toFixed(2)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Invoice Summary and Footer */}
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-6 border-t border-zinc-100 pt-8">
          <div className="max-w-xs space-y-1">
            <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-400">PAYMENT INFO:</h4>
            <p className="text-xs text-zinc-500">Thank you for your business. For any warranty inquiries, please refer to this invoice or your warranty certificate.</p>
          </div>

          <div className="w-full sm:w-64 space-y-2 text-right">
            <div className="flex justify-between text-sm text-zinc-500">
              <span>Subtotal:</span>
              <span>${parseFloat(String(invoice.total)).toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-sm text-zinc-500 border-b border-zinc-100 pb-2">
              <span>Tax (0%):</span>
              <span>$0.00</span>
            </div>
            <div className="flex justify-between text-base font-bold text-zinc-900 print:text-black pt-1">
              <span>Total Due:</span>
              <span className="text-lg text-emerald-600 print:text-black">${parseFloat(String(invoice.total)).toFixed(2)}</span>
            </div>
          </div>
        </div>

        {/* Printed Footer Message */}
        <div className="hidden print:block text-center text-[10px] text-zinc-400 pt-12 border-t border-dashed border-zinc-100">
          Generated automatically by WarrantyBuddy. All rights reserved.
        </div>
      </div>
    </div>
  );
}
