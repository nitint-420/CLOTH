import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@ecom/database";

export async function POST(req: NextRequest) {
  try {
    const { supplier, date, note, items } = await req.json();
    if (!items || !items.length) return NextResponse.json({ error: "No items" }, { status: 400 });

    // Stock update karo aur log banao
    for (const item of items) {
      const product = await prisma.product.findUnique({ where: { id: item.productId } });
      if (!product) continue;
      const newStock = product.stock + item.quantity;
      await prisma.product.update({
        where: { id: item.productId },
        data: { stock: newStock, costPrice: item.costPrice },
      });
      await prisma.stockLog.create({
        data: {
          productId: item.productId,
          type: "PURCHASE",
          quantity: item.quantity,
          previousStock: product.stock,
          newStock,
          reference: supplier || "Purchase",
          note: note || null,
        },
      });
    }

    return NextResponse.json({ success: true });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}