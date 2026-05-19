import prisma from "@/lib/prisma";
import { Prisma } from "@prisma/client";

interface InvoiceItemDTO { productId: string; quantity: number; price: number; }
interface PaymentDTO { amount: number; type: "CASH" | "CHEQUE" | "CARD"; chequeNumber?: string; bankName?: string; chequeDate?: Date; }

export async function createInvoice(
  data: { customerId: string; branchId?: string; items: InvoiceItemDTO[]; payment: PaymentDTO; },
  tenantId: string,
  userId: string
) {
  // Safely calculate total amount in Node
  const totalAmount = data.items.reduce((sum, item) => sum + (item.quantity * item.price), 0);
  const invoiceNumber = `INV-${Date.now()}`; 

  return prisma.$transaction(async (tx) => {
    // 1. Create Invoice, InvoiceItems, and Payment in a single nested write
    const invoice = await tx.invoice.create({
      data: {
        number: invoiceNumber,
        customerId: data.customerId,
        tenantId,
        branchId: data.branchId,
        total: new Prisma.Decimal(totalAmount),
        items: {
          create: data.items.map((item) => ({
            productId: item.productId,
            quantity: item.quantity,
            price: new Prisma.Decimal(item.price),
          })),
        },
        payments: {
          create: [{
            amount: new Prisma.Decimal(data.payment.amount),
            type: data.payment.type,
            chequeNumber: data.payment.chequeNumber,
            bankName: data.payment.bankName,
            chequeDate: data.payment.chequeDate,
            status: data.payment.type === "CHEQUE" ? "PENDING" : "CLEARED"
          }],
        },
      },
      include: { items: true, payments: true, customer: true },
    });

    // 2. Deduct Stock & Log Movements
    for (const item of data.items) {
      await tx.product.update({
        where: { id: item.productId },
        data: { quantity: { decrement: item.quantity } },
      });

      await tx.stockMovement.create({
        data: {
          productId: item.productId,
          quantity: item.quantity,
          type: "OUT",
          reason: `Sale on Invoice ${invoiceNumber}`,
        },
      });
    }

    // 3. Audit Log
    await tx.auditLog.create({
      data: { action: "CREATE", entity: "Invoice", entityId: invoice.id, tenantId, userId }
    });

    return invoice;
  });
}
