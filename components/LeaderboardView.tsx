"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { formatDuration, formatLoc, formatNumber, formatTokens } from "@/lib/format";
import { ACTIVITY_TYPE_KEYS, ACTIVITY_TYPES, type ActivityTypeKey } from "@/lib/constants";

type Range = "daily" | "weekly" | "monthly" | "all";
type Metric = "locNet" | "tokens" | "durationSec" | "activityCount";

const RANGES: { value: Range; label: string }[] = [
  { value: "daily", label: "Today" },
  { value: "weekly", label: "This Week" },
  { value: "monthly", label: "This Month" },
  { value: "all", label: "All Time" },
];

const METRICS: { value: Metric; label: string }[] = [
  { value: "locNet", label: "LOC net" },
  { value: "tokens", label: "Tokens" },
  { value: "durationSec", label: "Time" },
  { value: "activityCount", label: "Sessions" },
];

type Entry = {
  rank: number;
  user: { id: string; name: string; handle: string; avatarUrl: string | null };
  value: number;
  locNet: number;
  tokens: number;
  durationSec: number;
  activityCount: number;
  isCurrentUser: boolean;
};

type LeaderboardResponse = {
  entries: Entry[];
};

function formatMetric(metric: Metric, entry: Entry): string {
  switch (metric) {
    case "locNet":
      return formatLoc(entry.locNet);
    case "tokens":
      return formatTokens(entry.tokens);
    case "durationSec":
      return formatDuration(entry.durationSec);
    case "activityCount":
      return formatNumber(entry.activityCount);
  }
}

function rankBadge(rank: number): string {
  if (rank === 1) return "🥇";
  if (rank === 2) return "🥈";
  if (rank === 3) return "🥉";
  return `#${rank}`;
}

export function LeaderboardView() {
  const [range, setRange] = useState<Range>("weekly");
  const [metric, setMetric] = useState<Metric>("locNet");
  const [type, setType] = useState<ActivityTypeKey | "all">("all");
  const [entries, setEntries] = useState<Entry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    const params = new URLSearchParams({ range, metric });
    if (type !== "all") params.set("type", type);

    fetch(`/api/leaderboard?${params.toString()}`)
      .then((res) => res.json())
      .then((data: LeaderboardResponse) => {
        if (!cancelled) setEntries(data.entries ?? []);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [range, metric, type]);

  return (
    <div className="space-y-6">
      <div className="space-y-3">
        <div className="flex flex-wrap gap-2">
          {RANGES.map((r) => (
            <button
              key={r.value}
              type="button"
              className="chip"
              data-active={range === r.value}
              onClick={() => setRange(r.value)}
            >
              {r.label}
            </button>
          ))}
        </div>
        <div className="flex flex-wrap gap-2">
          {METRICS.map((m) => (
            <button
              key={m.value}
              type="button"
              className="chip"
              data-active={metric === m.value}
              onClick={() => setMetric(m.value)}
            >
              {m.label}
            </button>
          ))}
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            className="chip"
            data-active={type === "all"}
            onClick={() => setType("all")}
          >
            All
          </button>
          {ACTIVITY_TYPE_KEYS.map((key) => (
            <button
              key={key}
              type="button"
              className="chip"
              data-active={type === key}
              onClick={() => setType(key)}
            >
              {ACTIVITY_TYPES[key].icon} {ACTIVITY_TYPES[key].label}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <p className="text-muted">Loading…</p>
      ) : entries.length === 0 ? (
        <div className="card border-dashed p-8 text-center">
          <p className="text-lg font-medium">No activity yet</p>
          <p className="mt-2 text-muted">
            Log a coding session to climb the board.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {entries.map((entry) => (
            <div
              key={entry.user.id}
              className={`card flex items-center gap-4 ${
                entry.isCurrentUser ? "border-accent bg-background" : ""
              }`}
            >
              <div className="w-8 text-center text-lg font-semibold">
                {rankBadge(entry.rank)}
              </div>
              {entry.user.avatarUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={entry.user.avatarUrl}
                  alt={entry.user.name}
                  className="h-9 w-9 rounded-full"
                />
              ) : (
                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-accent text-sm font-semibold text-white">
                  {entry.user.name.charAt(0).toUpperCase()}
                </div>
              )}
              <Link
                href={`/profile/${entry.user.handle}`}
                className="flex-1 font-medium hover:underline"
              >
                {entry.user.name}
              </Link>
              <div className="font-semibold">{formatMetric(metric, entry)}</div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
