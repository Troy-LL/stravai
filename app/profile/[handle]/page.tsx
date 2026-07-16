import { notFound } from "next/navigation";
import { ActivityCard } from "@/components/ActivityCard";
import { getCurrentUser } from "@/lib/currentUser";
import { formatDuration, formatLoc, formatTokens } from "@/lib/format";
import { activityType } from "@/lib/constants";
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
  const joined = user.createdAt.toLocaleDateString(undefined, {
    month: "long",
    year: "numeric",
  });

  return (
    <div className="space-y-6">
      <section className="card p-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
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
              <p className="text-sm text-muted">Joined {joined}</p>
              {isOwnProfile && (
                <p className="mt-1 text-sm text-accent">Your profile</p>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2 rounded-full border border-border bg-accent/10 px-4 py-2">
            <span className="text-xl">🔥</span>
            <span className="font-semibold text-accent">
              {profileStats.streak} day streak
            </span>
          </div>
        </div>

        <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
          <div className="card p-4 text-center">
            <p className="text-2xl font-bold">{profileStats.totalActivities}</p>
            <p className="text-sm text-muted">Total sessions</p>
          </div>
          <div className="card p-4 text-center">
            <p className="text-2xl font-bold">{formatLoc(profileStats.totalLocNet)}</p>
            <p className="text-sm text-muted">Total LOC net</p>
          </div>
          <div className="card p-4 text-center">
            <p className="text-2xl font-bold">{formatTokens(profileStats.totalTokens)}</p>
            <p className="text-sm text-muted">Total tokens</p>
          </div>
          <div className="card p-4 text-center">
            <p className="text-2xl font-bold">
              {formatDuration(profileStats.totalDurationSec)}
            </p>
            <p className="text-sm text-muted">Total time</p>
          </div>
        </div>
      </section>

      <section className="card p-6">
        <h2 className="mb-4 text-lg font-semibold">🏆 Personal Records</h2>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
          <div className="rounded-xl border border-border p-4 text-center">
            <p className="text-xl font-bold text-accent">
              {formatLoc(profileStats.bestLocSession)}
            </p>
            <p className="text-sm text-muted">Best LOC session</p>
          </div>
          <div className="rounded-xl border border-border p-4 text-center">
            <p className="text-xl font-bold text-accent">
              {formatDuration(profileStats.longestDuration)}
            </p>
            <p className="text-sm text-muted">Longest session</p>
          </div>
          <div className="rounded-xl border border-border p-4 text-center">
            <p className="text-xl font-bold text-accent">
              {formatTokens(profileStats.mostTokens)}
            </p>
            <p className="text-sm text-muted">Most tokens</p>
          </div>
        </div>
      </section>

      <section className="card p-6">
        <h2 className="mb-4 text-lg font-semibold">Activity mix</h2>
        {Object.keys(profileStats.byType).length === 0 ? (
          <p className="text-muted">No activity yet.</p>
        ) : (
          <div className="flex flex-wrap gap-2">
            {Object.entries(profileStats.byType).map(([type, count]) => {
              const t = activityType(type);
              return (
                <div
                  key={type}
                  className="flex items-center gap-2 rounded-full border border-border px-3 py-1.5"
                >
                  <span>{t.icon}</span>
                  <span className="text-sm font-medium" style={{ color: t.color }}>
                    {t.label}
                  </span>
                  <span className="text-sm text-muted">{count}</span>
                </div>
              );
            })}
          </div>
        )}
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
                showKudos={true}
                activity={{
                  id: activity.id,
                  type: activity.type,
                  title: activity.title,
                  startedAt: activity.startedAt.toISOString(),
                  durationSec: activity.durationSec,
                  locNet: activity.locNet,
                  tokens: activity.tokens,
                  filesTouched: activity.filesTouched,
                  commitCount: activity.commitCount,
                  repo: activity.repo,
                  user: activity.user,
                  kudosCount: activity.kudos.length,
                  hasKudoed: activity.kudos.some(
                    (k) => k.userId === currentUser.id,
                  ),
                  comments: activity.comments.map((c) => ({
                    id: c.id,
                    body: c.body,
                    createdAt: c.createdAt.toISOString(),
                    user: c.user,
                  })),
                }}
              />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
