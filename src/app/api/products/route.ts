import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  try {
    const data = await request.json();
    const { name, tenantId, ...rest } = data;

    if (!tenantId) {
      return NextResponse.json({ error: 'Tenant ID is required' }, { status: 400 });
    }

    const product = await prisma.product.create({
      data: {
        name,
        tenantId,
        ...rest,
        costPrice: data.costPrice || 0,
        sellPrice: data.sellPrice || 0,
      },
    });

    // Emit socket event
    const io = (global as any).io;
    if (io) {
      // Emit to the tenant's room
      io.to(tenantId).emit('product.created', product);
      console.log(`Emitted product.created for tenant ${tenantId}`);
    }

    return NextResponse.json(product);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Failed to create product' }, { status: 500 });
  }
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const tenantId = searchParams.get('tenantId');

  if (!tenantId) {
    return NextResponse.json({ error: 'Tenant ID is required' }, { status: 400 });
  }

  try {
    const products = await prisma.product.findMany({
      where: { tenantId },
    });
    return NextResponse.json(products);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Failed to fetch products' }, { status: 500 });
  }
}
