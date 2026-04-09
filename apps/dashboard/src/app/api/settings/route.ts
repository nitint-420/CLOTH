import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@ecom/database";
import { revalidatePath } from "next/cache";

export async function GET() {
  try { return NextResponse.json({ settings: await prisma.setting.findMany() }); }
  catch { return NextResponse.json({ error: "Server error" }, { status: 500 }); }
}

export async function POST(req: NextRequest) {
  try {
    const { settings } = await req.json();
    for (const [key, value] of Object.entries(settings)) {
      if (value !== undefined) await prisma.setting.upsert({ 
        where: { key }, 
        update: { value: String(value) }, 
        create: { key, value: String(value) } 
      });
    }
    revalidatePath("/dashboard/settings");
    revalidatePath("/dashboard");
    return NextResponse.json({ success: true });
  } catch { return NextResponse.json({ error: "Server error" }, { status: 500 }); }
}