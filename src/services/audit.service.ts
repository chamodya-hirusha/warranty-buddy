import prisma from "@/lib/prisma";

export async function createAuditLog(
  action: "CREATE" | "UPDATE" | "DELETE",
  entity: "User" | "Product" | "Invoice" | "Repair",
  tenantId: string,
  entityId?: string,
  userId?: string
) {
  return prisma.auditLog.create({
    data: {
      action,
      entity,
      entityId,
      userId,
      tenantId,
    },
  });
}
