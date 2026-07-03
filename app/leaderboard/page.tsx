import { LeaderboardRow } from "@/components/LeaderboardRow";
import { getCurrentUser } from "@/lib/currentUser";
import { getWeekBounds } from "@/lib/format";
import { getWeeklyLeaderboard } from "@/lib/queries";

export default async function LeaderboardPage() {
  const currentUser = await getCurrentUser();
  const entries = await getWeeklyLeaderboard(currentUser.id);
  const { start, end } = getWeekBounds();

  const weekLabel = `${start.toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
  })} – ${new Date(end.getTime() - 1).toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
  })}`;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Weekly leaderboard</h1>
        <p className="mt-1 text-muted">
          Friends ranked by LOC net this week ({weekLabel}).
        </p>
      </div>

      {entries.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-border bg-card p-8 text-center">
          <p className="text-lg font-medium">No activity this week</p>
          <p className="mt-2 text-muted">
            Log a coding session to climb the board.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {entries.map((entry, index) => (
            <LeaderboardRow
              key={entry.user.id}
              rank={index + 1}
              name={entry.user.name}
              handle={entry.user.handle}
              avatarUrl={entry.user.avatarUrl}
              locNet={entry.locNet}
              durationSec={entry.durationSec}
              activityCount={entry.activityCount}
              isCurrentUser={entry.user.id === currentUser.id}
            />
          ))}
        </div>
      )}
    </div>
  );
}
