export function formatDuration(seconds: number): string {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;

  if (hours > 0) {
    return `${hours}h ${minutes}m`;
  }
  if (minutes > 0) {
    return `${minutes}m ${secs}s`;
  }
  return `${secs}s`;
}

export function formatPace(locNet: number, durationSec: number): string {
  if (durationSec <= 0) return "0 LOC/min";
  const minutes = durationSec / 60;
  const pace = Math.round(locNet / minutes);
  return `${pace.toLocaleString()} LOC/min`;
}

export function formatLoc(loc: number): string {
  return loc.toLocaleString();
}

export function formatTokens(tokens: number): string {
  if (tokens >= 1000) return `${(tokens / 1000).toFixed(1)}k`;
  return String(tokens);
}

export function formatNumber(n: number): string {
  return n.toLocaleString();
}

export function formatRelativeTime(date: Date): string {
  const now = Date.now();
  const diffMs = now - date.getTime();
  const diffMin = Math.floor(diffMs / 60000);
  const diffHr = Math.floor(diffMin / 60);
  const diffDay = Math.floor(diffHr / 24);

  if (diffMin < 1) return "just now";
  if (diffMin < 60) return `${diffMin}m ago`;
  if (diffHr < 24) return `${diffHr}h ago`;
  if (diffDay < 7) return `${diffDay}d ago`;
  return date.toLocaleDateString(undefined, { month: "short", day: "numeric" });
}

const TITLE_PREFIXES = [
  "Morning",
  "Afternoon",
  "Evening",
  "Late Night",
  "Sprint",
  "Deep Work",
];

const TITLE_ACTIONS = [
  "Refactor Run",
  "Feature Push",
  "Bug Fix Lap",
  "API Sprint",
  "Ship Session",
  "Code Cruise",
];

export function generateActivityTitle(startedAt: Date, repo?: string | null): string {
  const hour = startedAt.getHours();
  let timePrefix = "Morning";
  if (hour >= 12 && hour < 17) timePrefix = "Afternoon";
  else if (hour >= 17 && hour < 22) timePrefix = "Evening";
  else if (hour >= 22 || hour < 5) timePrefix = "Late Night";

  const action =
    TITLE_ACTIONS[startedAt.getMinutes() % TITLE_ACTIONS.length] ?? "Code Cruise";
  const prefix =
    TITLE_PREFIXES[hour % TITLE_PREFIXES.length] ?? timePrefix;

  if (repo) {
    const repoName = repo.split("/").pop() ?? repo;
    return `${prefix} ${repoName} ${action}`;
  }

  return `${timePrefix} ${action}`;
}

export function getWeekBounds(reference = new Date()) {
  const start = new Date(reference);
  const day = start.getDay();
  const diffToMonday = day === 0 ? -6 : 1 - day;
  start.setHours(0, 0, 0, 0);
  start.setDate(start.getDate() + diffToMonday);

  const end = new Date(start);
  end.setDate(end.getDate() + 7);

  return { start, end };
}
