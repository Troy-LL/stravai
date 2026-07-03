import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/currentUser";
import { getWeeklyLeaderboard } from "@/lib/queries";
import { getWeekBounds } from "@/lib/format";

export async function GET() {
  try {
    const currentUser = await getCurrentUser();
    const leaderboard = await getWeeklyLeaderboard(currentUser.id);
    const { start, end } = getWeekBounds();

    return NextResponse.json({
      weekStart: start.toISOString(),
      weekEnd: end.toISOString(),
      currentUserHandle: currentUser.handle,
      entries: leaderboard.map((entry, index) => ({
        rank: index + 1,
        user: entry.user,
        locNet: entry.locNet,
        durationSec: entry.durationSec,
        activityCount: entry.activityCount,
        isCurrentUser: entry.user.id === currentUser.id,
      })),
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Failed to load leaderboard" },
      { status: 500 },
    );
  }
}
