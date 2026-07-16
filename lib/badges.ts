export type Badge = { icon: string; label: string };

type BadgeStats = {
  streak: number;
  bestLocSession: number;
  totalActivities: number;
  mostTokens: number;
};

// One badge per family: highest applicable tier only.
export function computeBadges(stats: BadgeStats): Badge[] {
  const badges: Badge[] = [];

  if (stats.streak >= 7) badges.push({ icon: "🔥", label: "Week streak" });
  else if (stats.streak >= 1) badges.push({ icon: "🔥", label: "On a streak" });

  if (stats.bestLocSession >= 500)
    badges.push({ icon: "🚀", label: "500 LOC session" });

  if (stats.totalActivities >= 10)
    badges.push({ icon: "🎖", label: "10 sessions" });
  else if (stats.totalActivities >= 5)
    badges.push({ icon: "🎖", label: "5 sessions" });

  if (stats.mostTokens >= 40000)
    badges.push({ icon: "⚡", label: "Token burner" });

  return badges;
}
