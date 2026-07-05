import { auth } from "@/auth";
import { prisma } from "@/lib/db";
import { AuthError } from "@/lib/auth";

export async function getCurrentUser() {
  const session = await auth();
  if (!session?.user?.id) {
    throw new AuthError("Sign in required", 401);
  }

  const user = await prisma.user.findUnique({ where: { id: session.user.id } });
  if (!user) {
    throw new AuthError("User not found", 401);
  }
  return user;
}

export async function getCurrentUserHandle(): Promise<string> {
  const user = await getCurrentUser();
  return user.handle;
}
