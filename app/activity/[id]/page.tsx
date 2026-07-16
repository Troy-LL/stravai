import Link from "next/link";
import { notFound } from "next/navigation";
import { ActivityCard } from "@/components/ActivityCard";
import { getCurrentUser } from "@/lib/currentUser";
import { getActivity } from "@/lib/queries";

export default async function ActivityPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const [activity, currentUser] = await Promise.all([
    getActivity(id),
    getCurrentUser(),
  ]);
  if (!activity) notFound();

  return (
    <div className="space-y-4">
      <Link href="/" className="text-sm text-accent hover:underline">
        ← Feed
      </Link>
      <ActivityCard
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
    </div>
  );
}
