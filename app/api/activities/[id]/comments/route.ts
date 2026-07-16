import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { handleRouteError } from "@/lib/auth";
import { getCurrentUser } from "@/lib/currentUser";

type RouteContext = { params: Promise<{ id: string }> };

export async function POST(request: NextRequest, context: RouteContext) {
  try {
    const { id } = await context.params;
    const currentUser = await getCurrentUser();
    const { body } = await request.json();
    const text = String(body ?? "").trim();
    if (!text) {
      return NextResponse.json({ error: "Comment is required" }, { status: 400 });
    }

    const activity = await prisma.activity.findUnique({ where: { id } });
    if (!activity) {
      return NextResponse.json({ error: "Activity not found" }, { status: 404 });
    }

    const comment = await prisma.comment.create({
      data: { activityId: id, userId: currentUser.id, body: text },
      include: { user: { select: { name: true, handle: true, avatarUrl: true } } },
    });

    return NextResponse.json({ comment }, { status: 201 });
  } catch (error) {
    return handleRouteError(error, "Failed to add comment");
  }
}
