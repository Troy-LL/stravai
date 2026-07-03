import Link from "next/link";
import { ActivityCard } from "@/components/ActivityCard";
import { getCurrentUser } from "@/lib/currentUser";
import { getFeedActivities } from "@/lib/queries";

export default async function FeedPage() {
  const currentUser = await getCurrentUser();
  const activities = await getFeedActivities(currentUser.id);

  return (
    <div className="space-y-6">
      <div className="flex items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Friends feed</h1>
          <p className="mt-1 text-muted">
            Recent coding sessions from you and your friends.
          </p>
        </div>
        <Link
          href="/record"
          className="shrink-0 rounded-xl bg-accent px-4 py-2 text-sm font-semibold text-white hover:bg-accent-hover"
        >
          Record
        </Link>
      </div>

      {activities.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-border bg-card p-8 text-center">
          <p className="text-lg font-medium">No activities yet</p>
          <p className="mt-2 text-muted">
            Record your first coding session or seed demo data.
          </p>
          <Link
            href="/record"
            className="mt-4 inline-block text-accent hover:underline"
          >
            Record an activity →
          </Link>
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
    </div>
  );
}
