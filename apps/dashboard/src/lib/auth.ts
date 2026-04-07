import { auth } from "@clerk/nextjs/server";

export async function getSession() {
  const { userId } = await auth();
  return userId ? { userId } : null;
}
