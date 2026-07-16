import Link from "next/link";
import { getCurrentUser } from "@/lib/currentUser";
import { getSegmentLeaderboard } from "@/lib/queries";
import { formatDuration, formatLoc, formatNumber } from "@/lib/format";

const RANK_MEDALS = ["🥇", "🥈", "🥉"];

type SegmentPageProps = {
  params: Promise<{ repo: string }>;
};

export default async function SegmentPage({ params }: SegmentPageProps) {
  const { repo } = await params;
  const decoded = decodeURIComponent(repo);

  const currentUser = await getCurrentUser();
  const leaderboard = await getSegmentLeaderboard(currentUser.id, decoded);

  return (
    <div className="space-y-6">
      <div>
        <Link href="/segments" className="text-sm text-accent hover:underline">
          ← Segments
        </Link>
        <h1 className="mt-2 font-mono text-2xl font-bold">{decoded}</h1>
        <p className="mt-1 text-muted">Segment leaderboard</p>
      </div>

      {leaderboard.length === 0 ? (
        <div className="card border-dashed p-8 text-center">
          <p className="text-lg font-medium">No sessions yet</p>
          <p className="mt-2 text-muted">
            Be the first to log a session in this repo.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {leaderboard.map((entry, i) => {
            const isCurrentUser = entry.user.id === currentUser.id;
            return (
              <div
                key={entry.user.id}
                className={`card flex items-center gap-4 p-4 ${
                  isCurrentUser ? "border-accent bg-accent/5" : ""
                }`}
              >
                <div className="w-8 shrink-0 text-center text-lg font-semibold text-muted">
                  {RANK_MEDALS[i] ?? `#${i + 1}`}
                </div>

                {entry.user.avatarUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={entry.user.avatarUrl}
                    alt=""
                    className="h-10 w-10 rounded-full"
                  />
                ) : (
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-accent/15 text-sm font-bold text-accent">
                    {entry.user.name.charAt(0)}
                  </div>
                )}

                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <Link
                      href={`/profile/${entry.user.handle}`}
                      className="font-medium hover:underline"
                    >
                      {entry.user.name}
                    </Link>
                    {i === 0 && (
                      <span className="rounded-full bg-accent/15 px-2 py-0.5 text-xs font-semibold text-accent">
                        👑 KOM
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-muted">
                    {formatDuration(entry.durationSec)} ·{" "}
                    {formatNumber(entry.activityCount)} sessions
                  </p>
                </div>

                <div className="shrink-0 text-right">
                  <p className="text-lg font-semibold text-accent">
                    {formatLoc(entry.locNet)}
                  </p>
                  <p className="text-xs text-muted">LOC net</p>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
