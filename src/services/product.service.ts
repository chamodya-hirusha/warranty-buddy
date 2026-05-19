import prisma from "@/lib/prisma";
import { Prisma } from "@prisma/client";
import { createAuditLog } from "./audit.service";

interface CreateProductDTO {
  name: string;
  costPrice: number;
  sellPrice: number;
  quantity: number;
  categoryId?: string;
  brandId?: string;
  modelId?: string;
  branchId?: string;
  supplierId?: string;
}

export async function createProduct(data: CreateProductDTO, tenantId: string, userId: string) {
  // Use Prisma's interactive transaction to ensure data integrity
  return prisma.$transaction(async (tx) => {
    
    // 1. Create the Product
    const product = await tx.product.create({
      data: {
        ...data,
        tenantId, // STRICT: Scope to tenant
        costPrice: new Prisma.Decimal(data.costPrice),
        sellPrice: new Prisma.Decimal(data.sellPrice),
      },
    });

    // 2. Log initial stock movement if quantity > 0
    if (data.quantity > 0) {
      await tx.stockMovement.create({
        data: {
          productId: product.id,
          quantity: data.quantity,
          type: "IN",
          reason: "Initial Stock Setup",
        },
      });
    }

    // 3. Track Audit Log inside the transaction
    await tx.auditLog.create({
      data: { action: "CREATE", entity: "Product", entityId: product.id, tenantId, userId }
    });

    return product;
  });
}
