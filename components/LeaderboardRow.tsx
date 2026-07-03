import Link from "next/link";
import { formatDuration, formatLoc } from "@/lib/format";

type LeaderboardRowProps = {
  rank: number;
  name: string;
  handle: string;
  avatarUrl: string | null;
  locNet: number;
  durationSec: number;
  activityCount: number;
  isCurrentUser?: boolean;
};

export function LeaderboardRow({
  rank,
  name,
  handle,
  avatarUrl,
  locNet,
  durationSec,
  activityCount,
  isCurrentUser,
}: LeaderboardRowProps) {
  return (
    <div
      className={`flex items-center gap-3 rounded-xl border px-4 py-3 ${
        isCurrentUser
          ? "border-accent/40 bg-accent/5"
          : "border-border bg-card"
      }`}
    >
      <span className="w-8 text-center text-lg font-bold text-muted">
        {rank}
      </span>
      {avatarUrl ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={avatarUrl} alt="" className="h-10 w-10 rounded-full" />
      ) : (
        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-accent/15 text-sm font-bold">
          {name.charAt(0)}
        </div>
      )}
      <div className="min-w-0 flex-1">
        <Link
          href={`/profile/${handle}`}
          className="font-semibold hover:text-accent"
        >
          {name}
          {isCurrentUser && (
            <span className="ml-2 text-xs font-medium text-accent">(you)</span>
          )}
        </Link>
        <p className="text-sm text-muted">
          {activityCount} session{activityCount === 1 ? "" : "s"} ·{" "}
          {formatDuration(durationSec)}
        </p>
      </div>
      <div className="text-right">
        <p className="text-lg font-bold text-accent">{formatLoc(locNet)}</p>
        <p className="text-xs text-muted">LOC net</p>
      </div>
    </div>
  );
}
