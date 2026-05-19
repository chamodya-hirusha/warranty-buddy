import prisma from "@/lib/prisma";

export async function createRepairTicket(
  data: { customerId: string; deviceName: string; problem: string; branchId?: string; productIdToCheck?: string },
  tenantId: string,
  userId: string
) {
  // Fetch 'Pending' status
  const status = await prisma.repairStatus.findUnique({ where: { name: "Pending" } });
  if (!status) throw new Error("System Error: Repair status 'Pending' not found in database.");

  // Pre-check for active warranty
  let activeWarranty = null;
  if (data.productIdToCheck) {
     activeWarranty = await prisma.warranty.findFirst({
       where: { 
         productId: data.productIdToCheck, 
         customerId: data.customerId, 
         tenantId, // Crucial: Prevent cross-tenant warranty lookup
         expiryDate: { gte: new Date() } // Must not be expired
       }
     });
  }

  const techNotes = activeWarranty 
    ? `System Note: Device covered under warranty until ${activeWarranty.expiryDate.toISOString().slice(0, 10)}` 
    : "";

  return prisma.$transaction(async (tx) => {
    const repair = await tx.repair.create({
      data: {
        customerId: data.customerId,
        deviceName: data.deviceName,
        problem: data.problem,
        statusId: status.id,
        tenantId,
        branchId: data.branchId,
        techNotes,
      },
      include: { status: true, customer: true }
    });

    await tx.auditLog.create({
      data: { action: "CREATE", entity: "Repair", entityId: repair.id, tenantId, userId }
    });

    return repair;
  });
}
