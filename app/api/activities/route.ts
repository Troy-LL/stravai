import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { handleRouteError, resolveUser } from "@/lib/auth";
import { getCurrentUser } from "@/lib/currentUser";
import { generateActivityTitle } from "@/lib/format";
import { getFeedActivities } from "@/lib/queries";

export async function GET() {
  try {
    const currentUser = await getCurrentUser();
    const activities = await getFeedActivities(currentUser.id);

    const payload = activities.map((activity) => ({
      id: activity.id,
      type: activity.type,
      title: activity.title,
      startedAt: activity.startedAt.toISOString(),
      endedAt: activity.endedAt.toISOString(),
      durationSec: activity.durationSec,
      locAdded: activity.locAdded,
      locRemoved: activity.locRemoved,
      locNet: activity.locNet,
      repo: activity.repo,
      commitCount: activity.commitCount,
      user: activity.user,
      kudosCount: activity.kudos.length,
      hasKudoed: activity.kudos.some((k) => k.userId === currentUser.id),
    }));

    return NextResponse.json({ activities: payload });
  } catch (error) {
    return handleRouteError(error, "Failed to load activities");
  }
}

export async function POST(request: NextRequest) {
  try {
    const currentUser = await resolveUser(request);
    const body = await request.json();

    const {
      title,
      startedAt,
      durationSec,
      locAdded = 0,
      locRemoved = 0,
      repo,
      commitCount = 0,
    } = body;

    if (!startedAt || !durationSec || durationSec <= 0) {
      return NextResponse.json(
        { error: "startedAt and durationSec are required" },
        { status: 400 },
      );
    }

    const start = new Date(startedAt);
    const end = new Date(start.getTime() + durationSec * 1000);
    const added = Number(locAdded) || 0;
    const removed = Number(locRemoved) || 0;
    const locNet = added - removed;

    const activity = await prisma.activity.create({
      data: {
        userId: currentUser.id,
        type: "coding",
        title:
          title?.trim() ||
          generateActivityTitle(start, repo?.trim() || null),
        startedAt: start,
        endedAt: end,
        durationSec: Number(durationSec),
        locAdded: added,
        locRemoved: removed,
        locNet,
        repo: repo?.trim() || null,
        commitCount: Number(commitCount) || 0,
      },
      include: {
        user: { select: { id: true, name: true, handle: true, avatarUrl: true } },
        kudos: { select: { userId: true } },
      },
    });

    return NextResponse.json(
      {
        activity: {
          id: activity.id,
          type: activity.type,
          title: activity.title,
          startedAt: activity.startedAt.toISOString(),
          endedAt: activity.endedAt.toISOString(),
          durationSec: activity.durationSec,
          locAdded: activity.locAdded,
          locRemoved: activity.locRemoved,
          locNet: activity.locNet,
          repo: activity.repo,
          commitCount: activity.commitCount,
          user: activity.user,
          kudosCount: 0,
          hasKudoed: false,
        },
      },
      { status: 201 },
    );
  } catch (error) {
    return handleRouteError(error, "Failed to create activity");
  }
}
