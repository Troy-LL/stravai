import { LeaderboardView } from "@/components/LeaderboardView";

export default function LeaderboardPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Leaderboard</h1>
        <p className="mt-1 text-muted">
          See how you stack up against friends across different ranges and metrics.
        </p>
      </div>

      <LeaderboardView />
    </div>
  );
}
