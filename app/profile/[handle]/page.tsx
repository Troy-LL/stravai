import { notFound } from "next/navigation";
import { ActivityCard } from "@/components/ActivityCard";
import { StatPill } from "@/components/StatPill";
import { getCurrentUser } from "@/lib/currentUser";
import { formatDuration, formatLoc } from "@/lib/format";
import {
  getProfileStats,
  getUserActivities,
  getUserByHandle,
} from "@/lib/queries";

type ProfilePageProps = {
  params: Promise<{ handle: string }>;
};

export default async function ProfilePage({ params }: ProfilePageProps) {
  const { handle } = await params;
  const user = await getUserByHandle(handle);
  if (!user) notFound();

  const [activities, profileStats, currentUser] = await Promise.all([
    getUserActivities(handle),
    getProfileStats(user.id),
    getCurrentUser(),
  ]);

  const isOwnProfile = currentUser.id === user.id;

  return (
    <div className="space-y-6">
      <section className="rounded-2xl border border-border bg-card p-6">
        <div className="flex items-center gap-4">
          {user.avatarUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={user.avatarUrl}
              alt=""
              className="h-16 w-16 rounded-full"
            />
          ) : (
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-accent/15 text-2xl font-bold text-accent">
              {user.name.charAt(0)}
            </div>
          )}
          <div>
            <h1 className="text-2xl font-bold">{user.name}</h1>
            <p className="text-muted">@{user.handle}</p>
            {isOwnProfile && (
              <p className="mt-1 text-sm text-accent">Your profile</p>
            )}
          </div>
        </div>

        <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
          <StatPill
            label="This week"
            value={`${formatLoc(profileStats.weeklyLocNet)} LOC`}
          />
          <StatPill
            label="Weekly time"
            value={formatDuration(profileStats.weeklyDurationSec)}
          />
          <StatPill
            label="Best session"
            value={`${formatLoc(profileStats.bestLocSession)} LOC`}
          />
          <StatPill
            label="Total runs"
            value={String(profileStats.totalActivities)}
          />
        </div>
      </section>

      <section>
        <h2 className="mb-4 text-lg font-semibold">Activity history</h2>
        {activities.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-border bg-card p-8 text-center text-muted">
            No coding sessions logged yet.
          </div>
        ) : (
          <div className="space-y-4">
            {activities.map((activity) => (
              <ActivityCard
                key={activity.id}
                activity={{
                  id: activity.id,
                  type: activity.type,
                  title: activity.title,
                  startedAt: activity.startedAt.toISOString(),
                  durationSec: activity.durationSec,
                  locNet: activity.locNet,
                  commitCount: activity.commitCount,
                  repo: activity.repo,
                  user: activity.user,
                  kudosCount: activity.kudos.length,
                  hasKudoed: activity.kudos.some(
                    (k) => k.userId === currentUser.id,
                  ),
                }}
              />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
