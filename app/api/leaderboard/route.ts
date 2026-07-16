import { NextRequest, NextResponse } from "next/server";
import { handleRouteError } from "@/lib/auth";
import { getCurrentUser } from "@/lib/currentUser";
import { getLeaderboard, getRangeBounds, type Metric, type Range } from "@/lib/queries";

const RANGES: Range[] = ["daily", "weekly", "monthly", "all"];
const METRICS: Metric[] = ["locNet", "tokens", "durationSec", "activityCount"];

export async function GET(request: NextRequest) {
  try {
    const currentUser = await getCurrentUser();
    const sp = request.nextUrl.searchParams;
    const range = (RANGES.includes(sp.get("range") as Range) ? sp.get("range") : "weekly") as Range;
    const metric = (METRICS.includes(sp.get("metric") as Metric) ? sp.get("metric") : "locNet") as Metric;
    const type = sp.get("type") || undefined;

    const leaderboard = await getLeaderboard(currentUser.id, { range, metric, type });
    const { start, end } = getRangeBounds(range);

    return NextResponse.json({
      range,
      metric,
      type: type ?? null,
      rangeStart: start.toISOString(),
      rangeEnd: end.toISOString(),
      currentUserHandle: currentUser.handle,
      entries: leaderboard.map((entry, index) => ({
        rank: index + 1,
        user: entry.user,
        value: entry.value,
        locNet: entry.locNet,
        tokens: entry.tokens,
        durationSec: entry.durationSec,
        activityCount: entry.activityCount,
        isCurrentUser: entry.user.id === currentUser.id,
      })),
    });
  } catch (error) {
    return handleRouteError(error, "Failed to load leaderboard");
  }
}
