import { NextResponse } from "next/server";
import { prisma } from "@ecom/database";
import { auth } from "@clerk/nextjs/server";

export async function GET() {
  try {
    const { userId } = await auth();
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    const user = await prisma.user.findUnique({ 
      where: { id: userId }, 
      select: { id: true, name: true, phone: true, email: true, role: true } 
    });
    if (!user) return NextResponse.json({ error: "Not found" }, { status: 404 });
    return NextResponse.json({ user });
  } catch { 
    return NextResponse.json({ error: "Server error" }, { status: 500 }); 
  }
}
