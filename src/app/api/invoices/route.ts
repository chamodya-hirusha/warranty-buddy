import { NextResponse } from "next/server";
import { getAuthContext } from "@/lib/auth";
import { createInvoice } from "@/services/invoice.service";

export async function POST(req: Request) {
  try {
    const { tenantId, userId } = getAuthContext();
    const body = await req.json();

    const invoice = await createInvoice(body, tenantId, userId);
    
    return NextResponse.json(invoice, { status: 201 });
  } catch (error: any) {
    console.error("[INVOICE_CREATE]", error);
    return NextResponse.json({ error: error.message || "Internal Server Error" }, { status: 500 });
  }
}
