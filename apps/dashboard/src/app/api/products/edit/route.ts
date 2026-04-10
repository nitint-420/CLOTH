import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@ecom/database";
import { revalidatePath } from "next/cache";

export async function POST(req: NextRequest) {
  try {
    const { id, sellingPrice, mrp, costPrice, stock, previousPrice, previousStock, previousCost } = await req.json();
    
    const product = await prisma.product.findUnique({ where: { id } });
    if (!product) return NextResponse.json({ error: "Product not found" }, { status: 404 });

    await prisma.product.update({
      where: { id },
      data: { sellingPrice, mrp, costPrice, stock },
    });

    // Stock change log
    if (stock !== previousStock) {
      await prisma.stockLog.create({
        data: {
          productId: id,
          type: "ADJUSTMENT",
          quantity: stock - previousStock,
          previousStock,
          newStock: stock,
          note: "Manual stock adjustment",
        },
      });
    }

    // Price change log — DayBook mein entry
    if (sellingPrice !== previousPrice) {
      await prisma.dayBook.create({
        data: {
          type: "NOTE",
          category: "Price Change",
          description: `${product.name}: ₹${previousPrice} → ₹${sellingPrice}`,
          amount: 0,
          paymentMode: "N/A",
        },
      });
    }

    revalidatePath("/dashboard/products");
    revalidatePath("/");
    return NextResponse.json({ success: true });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}