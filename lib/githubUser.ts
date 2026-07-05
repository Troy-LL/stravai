import { prisma } from "@/lib/db";

export type GitHubProfile = {
  id: string;
  login: string;
  name?: string | null;
  avatar_url?: string | null;
};

async function uniqueHandle(base: string): Promise<string> {
  const normalized = base.toLowerCase().replace(/[^a-z0-9_-]/g, "");
  const root = normalized || "user";

  let handle = root;
  let suffix = 2;
  while (await prisma.user.findUnique({ where: { handle } })) {
    handle = `${root}-${suffix}`;
    suffix += 1;
  }
  return handle;
}

export async function upsertGitHubUser(profile: GitHubProfile) {
  const githubId = profile.id;
  const existing = await prisma.user.findUnique({ where: { githubId } });
  if (existing) {
    return prisma.user.update({
      where: { id: existing.id },
      data: {
        name: profile.name?.trim() || profile.login,
        avatarUrl: profile.avatar_url ?? existing.avatarUrl,
      },
    });
  }

  const handle = await uniqueHandle(profile.login);
  return prisma.user.create({
    data: {
      githubId,
      name: profile.name?.trim() || profile.login,
      handle,
      avatarUrl: profile.avatar_url ?? null,
    },
  });
}
