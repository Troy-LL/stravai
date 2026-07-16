import { getCurrentUser } from "@/lib/currentUser";
import { getChallenges } from "@/lib/queries";
import { formatDuration, formatLoc, formatNumber, formatTokens } from "@/lib/format";
import { JoinButton } from "@/components/JoinButton";

function formatMetric(metric: string, value: number): string {
  switch (metric) {
    case "durationSec":
      return formatDuration(value);
    case "tokens":
      return formatTokens(value);
    case "locNet":
      return formatLoc(value);
    case "activityCount":
      return `${formatNumber(value)} sessions`;
    default:
      return formatNumber(value);
  }
}

export default async function ChallengesPage() {
  const u = await getCurrentUser();
  const challenges = await getChallenges(u.id);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Challenges</h1>
        <p className="mt-1 text-muted">Team goals. Ship together.</p>
      </div>

      {challenges.length === 0 ? (
        <div className="card text-muted">No challenges yet. Check back soon.</div>
      ) : (
        <div className="space-y-4">
          {challenges.map((c) => (
            <div key={c.id} className="card space-y-3">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="font-bold">{c.title}</p>
                  <p className="text-muted">{c.description}</p>
                </div>
                <JoinButton challengeId={c.id} initialJoined={c.joined} />
              </div>

              <div className="space-y-1">
                <div className="h-3 w-full rounded-full bg-background">
                  <div
                    className="h-3 rounded-full bg-accent"
                    style={{ width: `${c.pct}%` }}
                  />
                </div>
                <p className="text-sm text-muted">
                  {formatMetric(c.metric, c.progress)} / {formatMetric(c.metric, c.goal)} ·{" "}
                  {c.pct}%
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-muted">
                <span className="text-accent">{c.metric}</span>
                <span>{c.memberCount} members</span>
                <span>
                  {c.startsAt.toLocaleDateString(undefined, { month: "short", day: "numeric" })}
                  {"–"}
                  {c.endsAt.toLocaleDateString(undefined, { month: "short", day: "numeric" })}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
