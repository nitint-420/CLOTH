import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@ecom/database";
import { revalidatePath } from "next/cache";

export async function POST(req: NextRequest) {
  try {
    const { id } = await req.json();
    if (!id) return NextResponse.json({ error: "ID missing" }, { status: 400 });

    // Soft delete — isActive false karo
    await prisma.product.update({
      where: { id },
      data: { isActive: false },
    });

    revalidatePath("/dashboard/products");
    revalidatePath("/");
    return NextResponse.json({ success: true });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}