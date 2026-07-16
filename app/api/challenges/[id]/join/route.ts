import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { handleRouteError } from "@/lib/auth";
import { getCurrentUser } from "@/lib/currentUser";

type RouteContext = { params: Promise<{ id: string }> };

export async function POST(_request: NextRequest, context: RouteContext) {
  try {
    const { id } = await context.params;
    const currentUser = await getCurrentUser();

    const existing = await prisma.challengeMember.findUnique({
      where: { challengeId_userId: { challengeId: id, userId: currentUser.id } },
    });

    if (existing) {
      await prisma.challengeMember.delete({ where: { id: existing.id } });
      return NextResponse.json({ joined: false });
    }

    await prisma.challengeMember.create({
      data: { challengeId: id, userId: currentUser.id },
    });
    return NextResponse.json({ joined: true });
  } catch (error) {
    return handleRouteError(error, "Failed to toggle challenge");
  }
}
