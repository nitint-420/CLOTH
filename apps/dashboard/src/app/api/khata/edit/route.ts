import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@ecom/database";
import { revalidatePath } from "next/cache";

export async function POST(req: NextRequest) {
  try {
    const { id, name, phone, address, creditLimit, currentBalance, previousBalance, paymentNote } = await req.json();

    await prisma.khataAccount.update({
      where: { id },
      data: { name, phone, address, creditLimit, currentBalance },
    });

    if (currentBalance !== previousBalance) {
      const diff = previousBalance - currentBalance;
      await prisma.khataTransaction.create({
        data: {
          khataAccountId: id,
          type: diff > 0 ? "PAYMENT" : "CREDIT",
          amount: Math.abs(diff),
          balanceAfter: currentBalance,
          description: paymentNote || (diff > 0 ? "Payment received" : "Credit added"),
        },
      });
    }

    revalidatePath("/dashboard/khata");
    return NextResponse.json({ success: true });
  } catch (e: any) {
    if (e.code === "P2002") return NextResponse.json({ error: "Phone already exists!" }, { status: 400 });
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}