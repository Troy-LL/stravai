import { beforeEach, describe, expect, it, vi } from "vitest";

const prismaMock = vi.hoisted(() => ({
  user: {
    findUnique: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
  },
}));

vi.mock("@/lib/db", () => ({
  prisma: prismaMock,
}));

import { upsertGitHubUser } from "@/lib/githubUser";

const existingUser = {
  id: "user_1",
  githubId: "gh_1",
  name: "Old Name",
  handle: "octocat",
  avatarUrl: "https://example.com/old.png",
  createdAt: new Date(),
};

describe("upsertGitHubUser", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("creates a new user with a normalized handle from login", async () => {
    prismaMock.user.findUnique
      .mockResolvedValueOnce(null)
      .mockResolvedValueOnce(null);
    prismaMock.user.create.mockResolvedValue({
      ...existingUser,
      githubId: "gh_new",
      handle: "octocat",
      name: "Octo Cat",
    });

    const profile = {
      id: "gh_new",
      login: "Octo@Cat!",
      name: "Octo Cat",
      avatar_url: "https://example.com/new.png",
    };

    const result = await upsertGitHubUser(profile);

    expect(prismaMock.user.findUnique).toHaveBeenNthCalledWith(1, {
      where: { githubId: "gh_new" },
    });
    expect(prismaMock.user.findUnique).toHaveBeenNthCalledWith(2, {
      where: { handle: "octocat" },
    });
    expect(prismaMock.user.create).toHaveBeenCalledWith({
      data: {
        githubId: "gh_new",
        name: "Octo Cat",
        handle: "octocat",
        avatarUrl: "https://example.com/new.png",
      },
    });
    expect(prismaMock.user.update).not.toHaveBeenCalled();
    expect(result.handle).toBe("octocat");
  });

  it("appends numeric suffixes when the base handle collides", async () => {
    prismaMock.user.findUnique
      .mockResolvedValueOnce(null)
      .mockResolvedValueOnce({ ...existingUser, handle: "octocat" })
      .mockResolvedValueOnce({ ...existingUser, handle: "octocat-2" })
      .mockResolvedValueOnce(null);
    prismaMock.user.create.mockResolvedValue({
      ...existingUser,
      githubId: "gh_new",
      handle: "octocat-3",
      name: "octocat",
    });

    await upsertGitHubUser({
      id: "gh_new",
      login: "OctoCat",
    });

    expect(prismaMock.user.findUnique).toHaveBeenNthCalledWith(2, {
      where: { handle: "octocat" },
    });
    expect(prismaMock.user.findUnique).toHaveBeenNthCalledWith(3, {
      where: { handle: "octocat-2" },
    });
    expect(prismaMock.user.findUnique).toHaveBeenNthCalledWith(4, {
      where: { handle: "octocat-3" },
    });
    expect(prismaMock.user.create.mock.calls[0][0].data.handle).toBe("octocat-3");
  });

  it("updates an existing user found by githubId without creating", async () => {
    prismaMock.user.findUnique.mockResolvedValueOnce(existingUser);
    prismaMock.user.update.mockResolvedValue({
      ...existingUser,
      name: "New Name",
      avatarUrl: "https://example.com/new.png",
    });

    const result = await upsertGitHubUser({
      id: "gh_1",
      login: "octocat",
      name: "New Name",
      avatar_url: "https://example.com/new.png",
    });

    expect(prismaMock.user.findUnique).toHaveBeenCalledOnce();
    expect(prismaMock.user.update).toHaveBeenCalledWith({
      where: { id: "user_1" },
      data: {
        name: "New Name",
        avatarUrl: "https://example.com/new.png",
      },
    });
    expect(prismaMock.user.create).not.toHaveBeenCalled();
    expect(result.name).toBe("New Name");
  });

  it("falls back to login when profile name is empty", async () => {
    prismaMock.user.findUnique.mockResolvedValueOnce(existingUser);
    prismaMock.user.update.mockResolvedValue({
      ...existingUser,
      name: "octocat",
    });

    await upsertGitHubUser({
      id: "gh_1",
      login: "octocat",
      name: "   ",
    });

    expect(prismaMock.user.update.mock.calls[0][0].data.name).toBe("octocat");
  });

  it("uses login for new users when name is missing", async () => {
    prismaMock.user.findUnique
      .mockResolvedValueOnce(null)
      .mockResolvedValueOnce(null);
    prismaMock.user.create.mockResolvedValue({
      ...existingUser,
      githubId: "gh_new",
      name: "octocat",
      handle: "octocat",
    });

    await upsertGitHubUser({
      id: "gh_new",
      login: "octocat",
    });

    expect(prismaMock.user.create.mock.calls[0][0].data.name).toBe("octocat");
  });
});
