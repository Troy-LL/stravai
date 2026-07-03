import Link from "next/link";
import {
  formatDuration,
  formatLoc,
  formatPace,
  formatRelativeTime,
} from "@/lib/format";
import { KudosButton } from "@/components/KudosButton";
import { StatPill } from "@/components/StatPill";

export type ActivityCardData = {
  id: string;
  type: string;
  title: string;
  startedAt: string;
  durationSec: number;
  locNet: number;
  commitCount: number;
  repo: string | null;
  user: {
    id: string;
    name: string;
    handle: string;
    avatarUrl: string | null;
  };
  kudosCount: number;
  hasKudoed: boolean;
};

type ActivityCardProps = {
  activity: ActivityCardData;
  showKudos?: boolean;
};

export function ActivityCard({ activity, showKudos = true }: ActivityCardProps) {
  const startedAt = new Date(activity.startedAt);

  return (
    <article className="rounded-2xl border border-border bg-card p-4 shadow-sm">
      <div className="flex items-start gap-3">
        {activity.user.avatarUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={activity.user.avatarUrl}
            alt=""
            className="h-10 w-10 rounded-full"
          />
        ) : (
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-accent/15 text-sm font-bold text-accent">
            {activity.user.name.charAt(0)}
          </div>
        )}
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
            <Link
              href={`/profile/${activity.user.handle}`}
              className="font-semibold hover:text-accent"
            >
              {activity.user.name}
            </Link>
            <span className="text-muted">·</span>
            <span className="text-sm text-muted">
              {formatRelativeTime(startedAt)}
            </span>
          </div>
          <div className="mt-1 flex items-center gap-2">
            <span className="text-lg" aria-label="Coding activity">
              🏃
            </span>
            <h2 className="font-semibold leading-snug">{activity.title}</h2>
          </div>
          {activity.repo && (
            <p className="mt-1 text-sm text-muted">{activity.repo}</p>
          )}
        </div>
      </div>

      <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-4">
        <StatPill label="Duration" value={formatDuration(activity.durationSec)} />
        <StatPill label="LOC net" value={formatLoc(activity.locNet)} />
        <StatPill
          label="Pace"
          value={formatPace(activity.locNet, activity.durationSec)}
        />
        <StatPill label="Commits" value={String(activity.commitCount)} />
      </div>

      {showKudos && (
        <div className="mt-4 border-t border-border pt-3">
          <KudosButton
            activityId={activity.id}
            initialCount={activity.kudosCount}
            initialHasKudoed={activity.hasKudoed}
          />
        </div>
      )}
    </article>
  );
}
