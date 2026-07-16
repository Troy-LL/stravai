import { PrismaClient } from "@prisma/client";
import { getAvatarUrl } from "../lib/constants";

const prisma = new PrismaClient();

function daysAgo(days: number, hour = 10, minute = 0) {
  const date = new Date();
  date.setDate(date.getDate() - days);
  date.setHours(hour, minute, 0, 0);
  return date;
}

function addMinutes(date: Date, minutes: number) {
  return new Date(date.getTime() + minutes * 60 * 1000);
}

async function main() {
  await prisma.comment.deleteMany();
  await prisma.kudos.deleteMany();
  await prisma.challengeMember.deleteMany();
  await prisma.challenge.deleteMany();
  await prisma.activity.deleteMany();
  await prisma.friendship.deleteMany();
  await prisma.user.deleteMany();

  const users = await Promise.all(
    [
      { name: "Alex Chen", handle: "alex" },
      { name: "Jordan Lee", handle: "jordan" },
      { name: "Sam Rivera", handle: "sam" },
      { name: "Taylor Kim", handle: "taylor" },
    ].map((user) =>
      prisma.user.create({
        data: {
          ...user,
          avatarUrl: getAvatarUrl(user.name, user.handle),
        },
      }),
    ),
  );

  const [alex, jordan, sam, taylor] = users;

  const friendships = [
  [alex.id, jordan.id],
  [alex.id, sam.id],
  [alex.id, taylor.id],
  [jordan.id, sam.id],
  [jordan.id, taylor.id],
  [sam.id, taylor.id],
  ];

  for (const [userId, friendId] of friendships) {
    await prisma.friendship.create({ data: { userId, friendId } });
    await prisma.friendship.create({ data: { userId: friendId, friendId: userId } });
  }

  const activityData = [
    {
      userId: jordan.id,
      title: "Morning auth-api Refactor Run",
      startedAt: daysAgo(0, 8, 30),
      durationMin: 95,
      locAdded: 420,
      locRemoved: 180,
      repo: "acme/auth-api",
      commitCount: 6,
    },
    {
      userId: sam.id,
      title: "Afternoon dashboard Feature Push",
      startedAt: daysAgo(0, 14, 0),
      durationMin: 72,
      locAdded: 310,
      locRemoved: 45,
      repo: "acme/dashboard",
      commitCount: 4,
    },
    {
      userId: taylor.id,
      title: "Evening mobile-app Ship Session",
      startedAt: daysAgo(1, 19, 15),
      durationMin: 110,
      locAdded: 540,
      locRemoved: 120,
      repo: "acme/mobile-app",
      commitCount: 8,
    },
    {
      userId: alex.id,
      title: "Morning stravai API Sprint",
      startedAt: daysAgo(1, 9, 0),
      durationMin: 85,
      locAdded: 380,
      locRemoved: 90,
      repo: "acme/stravai",
      commitCount: 5,
    },
    {
      userId: jordan.id,
      title: "Late Night payments Bug Fix Lap",
      startedAt: daysAgo(2, 22, 45),
      durationMin: 55,
      locAdded: 150,
      locRemoved: 220,
      repo: "acme/payments",
      commitCount: 3,
    },
    {
      userId: sam.id,
      title: "Afternoon infra Code Cruise",
      startedAt: daysAgo(3, 13, 20),
      durationMin: 68,
      locAdded: 260,
      locRemoved: 40,
      repo: "acme/infra",
      commitCount: 4,
    },
    {
      userId: taylor.id,
      title: "Morning design-system Refactor Run",
      startedAt: daysAgo(4, 10, 5),
      durationMin: 92,
      locAdded: 410,
      locRemoved: 75,
      repo: "acme/design-system",
      commitCount: 7,
    },
    {
      userId: alex.id,
      title: "Evening stravai Feature Push",
      startedAt: daysAgo(5, 18, 0),
      durationMin: 120,
      locAdded: 620,
      locRemoved: 110,
      repo: "acme/stravai",
      commitCount: 9,
    },
    {
      userId: jordan.id,
      title: "Morning notifications API Sprint",
      startedAt: daysAgo(6, 7, 45),
      durationMin: 78,
      locAdded: 290,
      locRemoved: 60,
      repo: "acme/notifications",
      commitCount: 5,
    },
  ];

  const types = ["coding", "planning", "debugging", "review"];
  const activities = [];
  for (const [i, item] of activityData.entries()) {
    const endedAt = addMinutes(item.startedAt, item.durationMin);
    const gross = item.locAdded + item.locRemoved;
    const activity = await prisma.activity.create({
      data: {
        userId: item.userId,
        type: types[i % types.length],
        title: item.title,
        startedAt: item.startedAt,
        endedAt,
        durationSec: item.durationMin * 60,
        locAdded: item.locAdded,
        locRemoved: item.locRemoved,
        locNet: item.locAdded - item.locRemoved,
        tokens: gross * 30 + item.durationMin * 200,
        filesTouched: Math.max(1, Math.round(gross / 80)),
        visibility: "friends",
        repo: item.repo,
        commitCount: item.commitCount,
      },
    });
    activities.push(activity);
  }

  await prisma.comment.createMany({
    data: [
      { activityId: activities[0].id, userId: sam.id, body: "Clean refactor 🔥" },
      { activityId: activities[0].id, userId: taylor.id, body: "Those numbers are wild" },
      { activityId: activities[2].id, userId: alex.id, body: "Late night grind respect" },
      { activityId: activities[3].id, userId: jordan.id, body: "Nice API sprint" },
    ],
  });

  const now = new Date();
  const monthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59);
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
  const challenges = await Promise.all([
    prisma.challenge.create({
      data: {
        title: "10,000 LOC This Month",
        description: "Ship 10k net lines as a team before month end.",
        metric: "locNet",
        goal: 10000,
        startsAt: monthStart,
        endsAt: monthEnd,
      },
    }),
    prisma.challenge.create({
      data: {
        title: "Marathon Coder",
        description: "Log 20 hours of coding sessions this month.",
        metric: "durationSec",
        goal: 20 * 3600,
        startsAt: monthStart,
        endsAt: monthEnd,
      },
    }),
  ]);

  for (const c of challenges) {
    await prisma.challengeMember.createMany({
      data: users.map((u) => ({ challengeId: c.id, userId: u.id })),
    });
  }

  await prisma.kudos.createMany({
    data: [
      { activityId: activities[0].id, userId: alex.id },
      { activityId: activities[0].id, userId: sam.id },
      { activityId: activities[2].id, userId: alex.id },
      { activityId: activities[2].id, userId: jordan.id },
      { activityId: activities[3].id, userId: jordan.id },
      { activityId: activities[3].id, userId: taylor.id },
      { activityId: activities[7].id, userId: sam.id },
      { activityId: activities[7].id, userId: jordan.id },
    ],
  });

  console.log(`Seeded ${users.length} users, ${activities.length} activities`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
