import { cookies } from "next/headers";
import { prisma } from "@/lib/db";
import { CURRENT_USER_COOKIE, DEFAULT_USER_HANDLE } from "@/lib/constants";

export async function getCurrentUserHandle(): Promise<string> {
  const cookieStore = await cookies();
  return cookieStore.get(CURRENT_USER_COOKIE)?.value ?? DEFAULT_USER_HANDLE;
}

export async function getCurrentUser() {
  const handle = await getCurrentUserHandle();
  const user = await prisma.user.findUnique({ where: { handle } });
  if (!user) {
    throw new Error(`Demo user "${handle}" not found. Run db:seed.`);
  }
  return user;
}

export async function getAllUsers() {
  return prisma.user.findMany({
    orderBy: { name: "asc" },
    select: { id: true, name: true, handle: true, avatarUrl: true },
  });
}
