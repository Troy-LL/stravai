import Link from "next/link";
import { getCurrentUser } from "@/lib/currentUser";
import { getSegments } from "@/lib/queries";
import { formatLoc, formatNumber } from "@/lib/format";

export default async function SegmentsPage() {
  const currentUser = await getCurrentUser();
  const segments = await getSegments(currentUser.id);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Segments</h1>
        <p className="mt-1 text-muted">King of the Mountain per repo.</p>
      </div>

      {segments.length === 0 ? (
        <div className="card border-dashed p-8 text-center">
          <p className="text-lg font-medium">No segments yet</p>
          <p className="mt-2 text-muted">
            Log coding sessions with a repo to start a leaderboard.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {segments.map((segment) => (
            <Link
              key={segment.repo}
              href={`/segments/${encodeURIComponent(segment.repo)}`}
              className="card block p-5"
            >
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="font-mono text-lg font-semibold">{segment.repo}</p>
                  <p className="mt-1 text-sm text-muted">
                    {formatLoc(segment.locNet)} LOC net · {formatNumber(segment.activityCount)}{" "}
                    sessions
                  </p>
                </div>

                {segment.king && (
                  <div className="flex items-center gap-3">
                    {segment.king.avatarUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={segment.king.avatarUrl}
                        alt=""
                        className="h-8 w-8 rounded-full"
                      />
                    ) : (
                      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-accent/15 text-sm font-bold text-accent">
                        {segment.king.name.charAt(0)}
                      </div>
                    )}
                    <div className="text-right">
                      <p className="text-sm font-medium">
                        👑 {segment.king.name}{" "}
                        <span className="text-muted">@{segment.king.handle}</span>
                      </p>
                      <p className="text-sm text-accent">
                        {formatLoc(segment.kingLoc)} LOC
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
