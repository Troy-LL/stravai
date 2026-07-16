import Link from "next/link";
import { ActivityCard } from "@/components/ActivityCard";
import { getCurrentUser } from "@/lib/currentUser";
import { getFeedActivities } from "@/lib/queries";
import { ACTIVITY_TYPES, ACTIVITY_TYPE_KEYS } from "@/lib/constants";

export default async function FeedPage({
  searchParams,
}: {
  searchParams: Promise<{ type?: string }>;
}) {
  const { type } = await searchParams;
  const activeType = ACTIVITY_TYPE_KEYS.includes(type as never) ? type : undefined;
  const currentUser = await getCurrentUser();
  const activities = await getFeedActivities(currentUser.id, activeType);

  return (
    <div className="space-y-6">
      <div className="flex items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Friends feed</h1>
          <p className="mt-1 text-muted">Every commit is a workout.</p>
        </div>
        <Link href="/record" className="btn-accent shrink-0 px-4 py-2 text-sm">
          Record
        </Link>
      </div>

      <div className="flex flex-wrap gap-2">
        <Link href="/" className="chip" data-active={!activeType}>
          All
        </Link>
        {ACTIVITY_TYPE_KEYS.map((k) => (
          <Link
            key={k}
            href={`/?type=${k}`}
            className="chip"
            data-active={activeType === k}
          >
            {ACTIVITY_TYPES[k].icon} {ACTIVITY_TYPES[k].label}
          </Link>
        ))}
      </div>

      {activities.length === 0 ? (
        <div className="card border-dashed p-8 text-center">
          <p className="text-lg font-medium">No activities yet</p>
          <p className="mt-2 text-muted">
            Record your first session or seed demo data.
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
                tokens: activity.tokens,
                filesTouched: activity.filesTouched,
                commitCount: activity.commitCount,
                repo: activity.repo,
                user: activity.user,
                kudosCount: activity.kudos.length,
                hasKudoed: activity.kudos.some((k) => k.userId === currentUser.id),
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
    </div>
  );
}
