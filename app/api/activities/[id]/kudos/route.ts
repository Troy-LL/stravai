import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { handleRouteError } from "@/lib/auth";
import { getCurrentUser } from "@/lib/currentUser";

type RouteContext = { params: Promise<{ id: string }> };

export async function POST(_request: NextRequest, context: RouteContext) {
  try {
    const { id } = await context.params;
    const currentUser = await getCurrentUser();

    const activity = await prisma.activity.findUnique({ where: { id } });
    if (!activity) {
      return NextResponse.json({ error: "Activity not found" }, { status: 404 });
    }

    const existing = await prisma.kudos.findUnique({
      where: {
        activityId_userId: {
          activityId: id,
          userId: currentUser.id,
        },
      },
    });

    if (existing) {
      await prisma.kudos.delete({ where: { id: existing.id } });
      const count = await prisma.kudos.count({ where: { activityId: id } });
      return NextResponse.json({ hasKudoed: false, kudosCount: count });
    }

    await prisma.kudos.create({
      data: { activityId: id, userId: currentUser.id },
    });
    const count = await prisma.kudos.count({ where: { activityId: id } });
    return NextResponse.json({ hasKudoed: true, kudosCount: count });
  } catch (error) {
    return handleRouteError(error, "Failed to toggle kudos");
  }
}
