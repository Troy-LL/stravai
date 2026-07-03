import { prisma } from "@/lib/db";
import { getCurrentUser } from "@/lib/currentUser";
import { getWeekBounds } from "@/lib/format";

export async function getFriendIds(userId: string) {
  const friendships = await prisma.friendship.findMany({
    where: { userId },
    select: { friendId: true },
  });
  return friendships.map((f) => f.friendId);
}

export async function getFeedActivities(currentUserId: string) {
  const friendIds = await getFriendIds(currentUserId);
  const userIds = [currentUserId, ...friendIds];

  return prisma.activity.findMany({
    where: { userId: { in: userIds } },
    include: {
      user: { select: { id: true, name: true, handle: true, avatarUrl: true } },
      kudos: { select: { userId: true } },
    },
    orderBy: { startedAt: "desc" },
    take: 50,
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

  const bestLocSession = activities.reduce(
    (best, a) => (a.locNet > best ? a.locNet : best),
    0,
  );
  const longestDuration = activities.reduce(
    (best, a) => (a.durationSec > best ? a.durationSec : 0),
    0,
  );

  return {
    totalActivities: activities.length,
    weeklyLocNet: weekly.reduce((sum, a) => sum + a.locNet, 0),
    weeklyDurationSec: weekly.reduce((sum, a) => sum + a.durationSec, 0),
    bestLocSession,
    longestDuration,
  };
}

export async function getCurrentUserForPage() {
  return getCurrentUser();
}
