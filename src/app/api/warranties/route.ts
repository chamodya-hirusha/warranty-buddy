import { NextResponse } from "next/server";
import { dbQuery } from "@/lib/db";
import { WarrantyRow } from "@/types/database";

export const dynamic = "force-dynamic";

// GET: Fetch all warranties
export async function GET() {
  try {
    const queryStr = "SELECT * FROM Warranty ORDER BY createdAt DESC";
    const warranties = await dbQuery<WarrantyRow[]>(queryStr);

    return NextResponse.json(warranties, { status: 200 });
  } catch (error: any) {
    return NextResponse.json(
      { error: "Failed to retrieve warranties" },
      { status: 500 }
    );
  }
}

// POST: Add a new warranty
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { productName, customerName, expiryDateInMonths } = body;

    // Simple Request Body Validation
    if (!productName || !customerName || !expiryDateInMonths) {
      return NextResponse.json(
        { error: "Missing required fields: productName, customerName, expiryDateInMonths" },
        { status: 400 }
      );
    }

    const id = crypto.randomUUID(); // Secure unique identifier
    const purchaseDate = new Date();
    const expiryDate = new Date();
    expiryDate.setMonth(purchaseDate.getMonth() + parseInt(expiryDateInMonths, 10));

    // Parametric queries fully prevent SQL injections
    const insertQuery = `
      INSERT INTO Warranty (id, productName, customerName, purchaseDate, expiryDate, createdAt)
      VALUES (?, ?, ?, ?, ?, ?)
    `;
    const params = [id, productName, customerName, purchaseDate, expiryDate, new Date()];

    await dbQuery(insertQuery, params);

    return NextResponse.json(
      { message: "Warranty created successfully", id },
      { status: 201 }
    );
  } catch (error: any) {
    console.error("[POST_WARRANTY_ERROR]", error);
    return NextResponse.json(
      { error: "Failed to create warranty record" },
      { status: 500 }
    );
  }
}
