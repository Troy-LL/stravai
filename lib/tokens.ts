import { createHash, randomBytes } from "crypto";
import { prisma } from "@/lib/db";

const TOKEN_PREFIX = "sai_";

export function generateApiToken(): string {
  return `${TOKEN_PREFIX}${randomBytes(32).toString("hex")}`;
}

export function hashApiToken(token: string): string {
  return createHash("sha256").update(token).digest("hex");
}

export async function createApiToken(userId: string, name: string) {
  const rawToken = generateApiToken();
  const tokenHash = hashApiToken(rawToken);

  const record = await prisma.apiToken.create({
    data: {
      userId,
      name: name.trim() || "Unnamed token",
      tokenHash,
    },
    select: {
      id: true,
      name: true,
      createdAt: true,
    },
  });

  return { ...record, rawToken };
}

export async function listApiTokens(userId: string) {
  return prisma.apiToken.findMany({
    where: { userId },
    select: {
      id: true,
      name: true,
      lastUsedAt: true,
      createdAt: true,
    },
    orderBy: { createdAt: "desc" },
  });
}

export async function revokeApiToken(userId: string, tokenId: string) {
  const result = await prisma.apiToken.deleteMany({
    where: { id: tokenId, userId },
  });
  return result.count > 0;
}

export async function findUserByApiToken(token: string) {
  const tokenHash = hashApiToken(token);
  const apiToken = await prisma.apiToken.findUnique({
    where: { tokenHash },
    include: {
      user: true,
    },
  });

  if (!apiToken) return null;

  await prisma.apiToken.update({
    where: { id: apiToken.id },
    data: { lastUsedAt: new Date() },
  });

  return apiToken.user;
}
