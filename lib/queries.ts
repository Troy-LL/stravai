import { prisma } from "@/lib/db";
import { getCurrentUser } from "@/lib/currentUser";
import { getWeekBounds } from "@/lib/format";

export type Range = "daily" | "weekly" | "monthly" | "all";
export type Metric = "locNet" | "tokens" | "durationSec" | "activityCount";

export function getRangeBounds(range: Range) {
  const now = new Date();
  // ponytail: "all" = fixed wide window; JS max Date overflows Postgres timestamp.
  if (range === "all") return { start: new Date("1970-01-01"), end: new Date("2999-12-31") };
  if (range === "daily") {
    const start = new Date(now);
    start.setHours(0, 0, 0, 0);
    const end = new Date(start);
    end.setDate(end.getDate() + 1);
    return { start, end };
  }
  if (range === "monthly") {
    const start = new Date(now.getFullYear(), now.getMonth(), 1);
    const end = new Date(now.getFullYear(), now.getMonth() + 1, 1);
    return { start, end };
  }
  return getWeekBounds();
}

export async function getFriendIds(userId: string) {
  const friendships = await prisma.friendship.findMany({
    where: { userId },
    select: { friendId: true },
  });
  return friendships.map((f) => f.friendId);
}

export async function getFeedActivities(currentUserId: string, type?: string) {
  const friendIds = await getFriendIds(currentUserId);
  const userIds = [currentUserId, ...friendIds];

  return prisma.activity.findMany({
    where: {
      type: type || undefined,
      OR: [
        { userId: currentUserId },
        { userId: { in: friendIds }, visibility: { not: "private" } },
      ],
      userId: { in: userIds },
    },
    include: {
      user: { select: { id: true, name: true, handle: true, avatarUrl: true } },
      kudos: { select: { userId: true } },
      comments: {
        include: { user: { select: { name: true, handle: true, avatarUrl: true } } },
        orderBy: { createdAt: "asc" },
      },
    },
    orderBy: { startedAt: "desc" },
    take: 50,
  });
}

export async function getLeaderboard(
  currentUserId: string,
  opts: { range: Range; metric: Metric; type?: string },
) {
  const friendIds = await getFriendIds(currentUserId);
  const userIds = [currentUserId, ...friendIds];
  const { start, end } = getRangeBounds(opts.range);

  const grouped = await prisma.activity.groupBy({
    by: ["userId"],
    where: {
      userId: { in: userIds },
      type: opts.type || undefined,
      startedAt: { gte: start, lt: end },
    },
    _sum: { locNet: true, tokens: true, durationSec: true },
    _count: { id: true },
  });

  const users = await prisma.user.findMany({
    where: { id: { in: userIds } },
    select: { id: true, name: true, handle: true, avatarUrl: true },
  });
  const userMap = new Map(users.map((u) => [u.id, u]));

  const value = (row: (typeof grouped)[number]) =>
    opts.metric === "activityCount"
      ? row._count.id
      : row._sum[opts.metric] ?? 0;

  return grouped
    .map((row) => ({
      user: userMap.get(row.userId)!,
      value: value(row),
      locNet: row._sum.locNet ?? 0,
      tokens: row._sum.tokens ?? 0,
      durationSec: row._sum.durationSec ?? 0,
      activityCount: row._count.id,
    }))
    .filter((r) => r.user && r.value > 0)
    .sort((a, b) => b.value - a.value);
}

// Segments = recurring leaderboards per repo (King of the Mountain per module).
export async function getSegments(currentUserId: string) {
  const friendIds = await getFriendIds(currentUserId);
  const userIds = [currentUserId, ...friendIds];

  const grouped = await prisma.activity.groupBy({
    by: ["repo"],
    where: { userId: { in: userIds }, repo: { not: null } },
    _sum: { locNet: true },
    _count: { id: true },
  });

  const segments = await Promise.all(
    grouped
      .filter((g) => g.repo)
      .map(async (g) => {
        const top = await prisma.activity.groupBy({
          by: ["userId"],
          where: { repo: g.repo, userId: { in: userIds } },
          _sum: { locNet: true },
          orderBy: { _sum: { locNet: "desc" } },
          take: 1,
        });
        const king = top[0]
          ? await prisma.user.findUnique({
              where: { id: top[0].userId },
              select: { name: true, handle: true, avatarUrl: true },
            })
          : null;
        return {
          repo: g.repo!,
          locNet: g._sum.locNet ?? 0,
          activityCount: g._count.id,
          king,
          kingLoc: top[0]?._sum.locNet ?? 0,
        };
      }),
  );

  return segments.sort((a, b) => b.locNet - a.locNet);
}

export async function getSegmentLeaderboard(currentUserId: string, repo: string) {
  const friendIds = await getFriendIds(currentUserId);
  const userIds = [currentUserId, ...friendIds];

  const grouped = await prisma.activity.groupBy({
    by: ["userId"],
    where: { repo, userId: { in: userIds } },
    _sum: { locNet: true, durationSec: true },
    _count: { id: true },
    orderBy: { _sum: { locNet: "desc" } },
  });
  const users = await prisma.user.findMany({
    where: { id: { in: grouped.map((g) => g.userId) } },
    select: { id: true, name: true, handle: true, avatarUrl: true },
  });
  const userMap = new Map(users.map((u) => [u.id, u]));
  return grouped.map((g) => ({
    user: userMap.get(g.userId)!,
    locNet: g._sum.locNet ?? 0,
    durationSec: g._sum.durationSec ?? 0,
    activityCount: g._count.id,
  }));
}

// Consecutive-day streak (calendar days with any activity).
export function computeStreak(dates: Date[]): number {
  if (dates.length === 0) return 0;
  const days = new Set(
    dates.map((d) => {
      const x = new Date(d);
      x.setHours(0, 0, 0, 0);
      return x.getTime();
    }),
  );
  let streak = 0;
  const cursor = new Date();
  cursor.setHours(0, 0, 0, 0);
  // Allow streak to count from today or yesterday.
  if (!days.has(cursor.getTime())) cursor.setDate(cursor.getDate() - 1);
  while (days.has(cursor.getTime())) {
    streak++;
    cursor.setDate(cursor.getDate() - 1);
  }
  return streak;
}

export async function getChallenges(currentUserId: string) {
  const challenges = await prisma.challenge.findMany({
    include: { members: { select: { userId: true } } },
    orderBy: { endsAt: "asc" },
  });

  return Promise.all(
    challenges.map(async (c) => {
      const memberIds = c.members.map((m) => m.userId);
      const agg = await prisma.activity.aggregate({
        where: {
          userId: { in: memberIds },
          startedAt: { gte: c.startsAt, lt: c.endsAt },
        },
        _sum: { locNet: true, tokens: true, durationSec: true },
        _count: { id: true },
      });
      const progress =
        c.metric === "activityCount"
          ? agg._count.id
          : (agg._sum[c.metric as "locNet" | "tokens" | "durationSec"] ?? 0);
      return {
        ...c,
        memberCount: memberIds.length,
        joined: memberIds.includes(currentUserId),
        progress,
        pct: Math.min(100, Math.round((progress / c.goal) * 100)),
      };
    }),
  );
}

export async function getActivity(id: string) {
  return prisma.activity.findUnique({
    where: { id },
    include: {
      user: { select: { id: true, name: true, handle: true, avatarUrl: true } },
      kudos: { select: { userId: true } },
      comments: {
        include: { user: { select: { name: true, handle: true, avatarUrl: true } } },
        orderBy: { createdAt: "asc" },
      },
    },
  });
}

export async function getUserActivities(handle: string) {
  return prisma.activity.findMany({
    where: { user: { handle } },
    include: {
      user: { select: { id: true, name: true, handle: true, avatarUrl: true } },
      kudos: { select: { userId: true } },
    },
    orderBy: { startedAt: "desc" },
  });
}

export async function getUserByHandle(handle: string) {
  return prisma.user.findUnique({
    where: { handle },
    select: { id: true, name: true, handle: true, avatarUrl: true, createdAt: true },
  });
}

export async function getWeeklyLeaderboard(currentUserId: string) {
  const friendIds = await getFriendIds(currentUserId);
  const userIds = [currentUserId, ...friendIds];
  const { start, end } = getWeekBounds();

  const grouped = await prisma.activity.groupBy({
    by: ["userId"],
    where: {
      userId: { in: userIds },
      type: "coding",
      startedAt: { gte: start, lt: end },
    },
    _sum: { locNet: true, durationSec: true },
    _count: { id: true },
  });

  const users = await prisma.user.findMany({
    where: { id: { in: userIds } },
    select: { id: true, name: true, handle: true, avatarUrl: true },
  });

  const userMap = new Map(users.map((u) => [u.id, u]));

  return grouped
    .map((row) => ({
      user: userMap.get(row.userId)!,
      locNet: row._sum.locNet ?? 0,
      durationSec: row._sum.durationSec ?? 0,
      activityCount: row._count.id,
    }))
    .filter((row) => row.user)
    .sort((a, b) => b.locNet - a.locNet);
}

export async function getProfileStats(userId: string) {
  const activities = await prisma.activity.findMany({
    where: { userId },
    orderBy: { startedAt: "desc" },
  });

  const { start, end } = getWeekBounds();
  const weekly = activities.filter(
    (a) => a.startedAt >= start && a.startedAt < end,
  );

  const max = (fn: (a: (typeof activities)[number]) => number) =>
    activities.reduce((best, a) => Math.max(best, fn(a)), 0);

  const byType: Record<string, number> = {};
  for (const a of activities) byType[a.type] = (byType[a.type] ?? 0) + 1;

  return {
    totalActivities: activities.length,
    totalLocNet: activities.reduce((s, a) => s + a.locNet, 0),
    totalTokens: activities.reduce((s, a) => s + a.tokens, 0),
    totalDurationSec: activities.reduce((s, a) => s + a.durationSec, 0),
    weeklyLocNet: weekly.reduce((sum, a) => sum + a.locNet, 0),
    weeklyDurationSec: weekly.reduce((sum, a) => sum + a.durationSec, 0),
    bestLocSession: max((a) => a.locNet),
    longestDuration: max((a) => a.durationSec),
    mostTokens: max((a) => a.tokens),
    streak: computeStreak(activities.map((a) => a.startedAt)),
    byType,
  };
}

export async function getCurrentUserForPage() {
  return getCurrentUser();
}
