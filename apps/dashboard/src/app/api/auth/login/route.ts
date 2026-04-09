import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@ecom/database";
import * as bcrypt from "bcryptjs";
import { SignJWT } from "jose";
import { cookies } from "next/headers";

const SECRET = new TextEncoder().encode(process.env.JWT_SECRET || "secret123");

export async function POST(req: NextRequest) {
  try {
    const { phone, password } = await req.json();
    const user = await prisma.user.findUnique({ where: { phone } });
    if (!user) return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
    const valid = await bcrypt.compare(password, user.password);
    if (!valid) return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
    const token = await new SignJWT({ userId: user.id, role: user.role })
      .setProtectedHeader({ alg: "HS256" })
      .setExpirationTime("7d")
      .sign(SECRET);
    const cookieStore = await cookies();
    cookieStore.set("auth_token", token, { httpOnly: true, maxAge: 60 * 60 * 24 * 7, path: "/" });
    return NextResponse.json({ success: true, user: { name: user.name, role: user.role } });
  } catch {
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}