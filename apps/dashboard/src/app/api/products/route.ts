import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@ecom/database";
import { revalidatePath } from "next/cache";

export async function GET(req: NextRequest) {
  try {
    const limit = parseInt(new URL(req.url).searchParams.get("limit") || "200");
    const products = await prisma.product.findMany({ where: { isActive: true }, take: limit, include: { category: { select: { name: true } } }, orderBy: { name: "asc" } });
    return NextResponse.json({ products });
  } catch (e) {
    console.error("GET error:", e);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const slug = body.name.toLowerCase().replace(/[^a-z0-9]+/g, "-");
    const product = await prisma.product.create({ data: { name: body.name, slug, sku: body.sku, barcode: body.barcode || null, categoryId: body.categoryId, mrp: body.mrp, sellingPrice: body.sellingPrice, costPrice: body.costPrice || 0, stock: body.stock || 0, unit: body.unit || "PCS", lowStockAlert: body.lowStockAlert || 10 } });
    return NextResponse.json({ product });
  } catch (e: any) {
    if (e.code === "P2002") return NextResponse.json({ error: "SKU/barcode exists" }, { status: 400 });
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const { id, image } = await req.json();
    if (!id || !image) return NextResponse.json({ error: "Missing fields" }, { status: 400 });
    const product = await prisma.product.update({ where: { id }, data: { image } });
    revalidatePath("/");
    revalidatePath("/dashboard/products");
    return NextResponse.json({ product });
  } catch (e) {
    console.error("PATCH error:", e);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}