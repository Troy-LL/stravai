export function getAvatarUrl(name: string, seed?: string) {
  const bg = seed ?? name;
  return `https://api.dicebear.com/9.x/initials/svg?seed=${encodeURIComponent(bg)}&backgroundColor=fc4c02,1a1a1a,16a34a,2563eb`;
}

export type ActivityTypeKey = "coding" | "planning" | "debugging" | "review";

export const ACTIVITY_TYPES: Record<
  ActivityTypeKey,
  { label: string; analogy: string; icon: string; color: string }
> = {
  coding: { label: "Coding", analogy: "Running", icon: "🏃", color: "#fc4c02" },
  planning: { label: "Planning", analogy: "Walking", icon: "🚶", color: "#2563eb" },
  debugging: { label: "Debugging", analogy: "Cycling", icon: "🚴", color: "#16a34a" },
  review: { label: "Code Review", analogy: "Swimming", icon: "🏊", color: "#9333ea" },
};

export const ACTIVITY_TYPE_KEYS = Object.keys(ACTIVITY_TYPES) as ActivityTypeKey[];

export function activityType(type: string) {
  return ACTIVITY_TYPES[(type as ActivityTypeKey)] ?? ACTIVITY_TYPES.coding;
}
