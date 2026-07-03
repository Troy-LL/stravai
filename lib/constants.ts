export const CURRENT_USER_COOKIE = "stravai_user_handle";

export const DEFAULT_USER_HANDLE =
  process.env.DEFAULT_USER_HANDLE ?? "alex";

export function getAvatarUrl(name: string, seed?: string) {
  const bg = seed ?? name;
  return `https://api.dicebear.com/9.x/initials/svg?seed=${encodeURIComponent(bg)}&backgroundColor=fc4c02,1a1a1a,16a34a,2563eb`;
}
