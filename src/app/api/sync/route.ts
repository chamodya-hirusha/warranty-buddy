import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

function sanitizePayload(data: any) {
  if (!data) return {};
  const payload: any = {};

  for (const [key, value] of Object.entries(data)) {
    if (value === "" || value === undefined || value === null) {
      payload[key] = null;
      continue;
    }

    // Convert numeric fields
    if (["costPrice", "sellPrice", "amount", "cost"].includes(key)) {
      const val = parseFloat(value as string);
      payload[key] = isNaN(val) ? null : val;
      continue;
    }
    if (["quantity", "warrantyPeriod", "duration"].includes(key)) {
      const val = parseInt(value as string, 10);
      payload[key] = isNaN(val) ? null : val;
      continue;
    }

    // Convert date fields
    if (["date", "receivedDate", "deliveryDate", "birthday", "expiryDate"].includes(key)) {
      const parsedDate = new Date(value as string);
      if (isNaN(parsedDate.getTime())) {
        payload[key] = null;
      } else {
        payload[key] = parsedDate;
      }
      continue;
    }

    payload[key] = value;
  }

  return payload;
}

export async function POST(req: Request) {
  try {
    const { action, entity, id, data } = await req.json();

    if (!entity || !id || !action) {
      return NextResponse.json({ error: "Missing required fields: action, entity, id" }, { status: 400 });
    }

    // Find or create a default demo tenant to scope the data
    let tenant = await prisma.tenant.findFirst();
    if (!tenant) {
      tenant = await prisma.tenant.create({
        data: {
          name: "Demo Business",
          slug: "demo"
        }
      });
    }
    const tenantId = tenant.id;

    // Entity mapping to prisma delegate
    const prismaKey = entity.charAt(0).toLowerCase() + entity.slice(1);
    const model = (prisma as any)[prismaKey];
    
    if (!model) {
      return NextResponse.json({ error: `Entity ${entity} not supported on backend prisma client` }, { status: 400 });
    }

    let result;

    if (action === "create") {
      const payload = sanitizePayload(data);

      // Set tenantId on scoped tables
      if (entity === "Customer" || entity === "Product" || entity === "Supplier" || entity === "Repair" || entity === "Expense" || entity === "Warranty" || entity === "Invoice" || entity === "Cheque") {
        payload.tenantId = tenantId;
      }

      // Map local status to statusId relation for Repair
      if (entity === "Repair") {
        const statusName = payload.status || "Pending";
        const capitalized = statusName.charAt(0).toUpperCase() + statusName.slice(1).toLowerCase();
        let statusObj = await prisma.repairStatus.findUnique({ where: { name: capitalized } });
        if (!statusObj) {
          statusObj = await prisma.repairStatus.findFirst();
        }
        if (statusObj) {
          payload.statusId = statusObj.id;
        }
        delete payload.status;
      }

      result = await model.create({
        data: {
          id,
          ...payload
        }
      });
    } else if (action === "update") {
      const payload = sanitizePayload(data);

      // Set tenantId on scoped tables if not set
      if (entity === "Customer" || entity === "Product" || entity === "Supplier" || entity === "Repair" || entity === "Expense" || entity === "Warranty" || entity === "Invoice" || entity === "Cheque") {
        payload.tenantId = tenantId;
      }

      // Map local status to statusId relation for Repair
      if (entity === "Repair") {
        const statusName = payload.status || "Pending";
        const capitalized = statusName.charAt(0).toUpperCase() + statusName.slice(1).toLowerCase();
        let statusObj = await prisma.repairStatus.findUnique({ where: { name: capitalized } });
        if (!statusObj) {
          statusObj = await prisma.repairStatus.findFirst();
        }
        if (statusObj) {
          payload.statusId = statusObj.id;
        }
        delete payload.status;
      }

      result = await model.update({
        where: { id },
        data: payload
      });
    } else if (action === "delete") {
      result = await model.delete({
        where: { id }
      });
    }

    return NextResponse.json({ success: true, result });
  } catch (error: any) {
    console.error("[SYNC_ERROR]", error);
    return NextResponse.json({ error: error.message || "Sync failed" }, { status: 500 });
  }
}
