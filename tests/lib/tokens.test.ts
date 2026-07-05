import { createHash } from "crypto";
import { beforeEach, describe, expect, it, vi } from "vitest";

const prismaMock = vi.hoisted(() => ({
  apiToken: {
    create: vi.fn(),
    findMany: vi.fn(),
    deleteMany: vi.fn(),
    findUnique: vi.fn(),
    update: vi.fn(),
  },
}));

vi.mock("@/lib/db", () => ({
  prisma: prismaMock,
}));

import {
  createApiToken,
  findUserByApiToken,
  generateApiToken,
  hashApiToken,
  listApiTokens,
  revokeApiToken,
} from "@/lib/tokens";

describe("generateApiToken", () => {
  it("returns a sai_-prefixed token of the expected shape", () => {
    const token = generateApiToken();
    expect(token).toMatch(/^sai_[0-9a-f]{64}$/);
  });

  it("returns unique tokens across calls", () => {
    const tokens = new Set(Array.from({ length: 20 }, () => generateApiToken()));
    expect(tokens.size).toBe(20);
  });
});

describe("hashApiToken", () => {
  it("is deterministic for the same input", () => {
    const token = "sai_deadbeef";
    const expected = createHash("sha256").update(token).digest("hex");
    expect(hashApiToken(token)).toBe(expected);
    expect(hashApiToken(token)).toBe(expected);
  });

  it("differs for different inputs", () => {
    expect(hashApiToken("sai_one")).not.toBe(hashApiToken("sai_two"));
  });
});

describe("createApiToken", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("creates a token record with hashed value and returns the raw token", async () => {
    const createdAt = new Date("2026-01-01T00:00:00.000Z");
    prismaMock.apiToken.create.mockResolvedValue({
      id: "tok_1",
      name: "CLI",
      createdAt,
    });

    const result = await createApiToken("user_1", "  CLI  ");

    expect(prismaMock.apiToken.create).toHaveBeenCalledOnce();
    const createArg = prismaMock.apiToken.create.mock.calls[0][0];
    expect(createArg.data).toMatchObject({
      userId: "user_1",
      name: "CLI",
    });
    expect(createArg.data.tokenHash).toMatch(/^[0-9a-f]{64}$/);
    expect(createArg.select).toEqual({
      id: true,
      name: true,
      createdAt: true,
    });
    expect(result.rawToken).toMatch(/^sai_[0-9a-f]{64}$/);
    expect(result.id).toBe("tok_1");
    expect(result.name).toBe("CLI");
    expect(createArg.data.tokenHash).toBe(hashApiToken(result.rawToken));
  });

  it("uses Unnamed token when name is blank", async () => {
    prismaMock.apiToken.create.mockResolvedValue({
      id: "tok_2",
      name: "Unnamed token",
      createdAt: new Date(),
    });

    await createApiToken("user_1", "   ");

    expect(prismaMock.apiToken.create.mock.calls[0][0].data.name).toBe(
      "Unnamed token",
    );
  });
});

describe("listApiTokens", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("lists tokens for the user ordered by newest first", async () => {
    const tokens = [{ id: "tok_1", name: "A", lastUsedAt: null, createdAt: new Date() }];
    prismaMock.apiToken.findMany.mockResolvedValue(tokens);

    const result = await listApiTokens("user_1");

    expect(prismaMock.apiToken.findMany).toHaveBeenCalledWith({
      where: { userId: "user_1" },
      select: {
        id: true,
        name: true,
        lastUsedAt: true,
        createdAt: true,
      },
      orderBy: { createdAt: "desc" },
    });
    expect(result).toBe(tokens);
  });
});

describe("revokeApiToken", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("scopes deleteMany by both token id and user id", async () => {
    prismaMock.apiToken.deleteMany.mockResolvedValue({ count: 1 });

    const revoked = await revokeApiToken("user_1", "tok_1");

    expect(prismaMock.apiToken.deleteMany).toHaveBeenCalledWith({
      where: { id: "tok_1", userId: "user_1" },
    });
    expect(revoked).toBe(true);
  });

  it("returns false when no rows were deleted", async () => {
    prismaMock.apiToken.deleteMany.mockResolvedValue({ count: 0 });

    const revoked = await revokeApiToken("user_1", "missing");

    expect(revoked).toBe(false);
  });
});

describe("findUserByApiToken", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns the user and updates lastUsedAt when the token exists", async () => {
    const user = {
      id: "user_1",
      githubId: "gh_1",
      name: "Ada",
      handle: "ada",
      avatarUrl: null,
      createdAt: new Date(),
    };
    prismaMock.apiToken.findUnique.mockResolvedValue({
      id: "tok_1",
      userId: "user_1",
      name: "CLI",
      tokenHash: "hash",
      lastUsedAt: null,
      createdAt: new Date(),
      user,
    });
    prismaMock.apiToken.update.mockResolvedValue({
      id: "tok_1",
      userId: "user_1",
      name: "CLI",
      tokenHash: "hash",
      lastUsedAt: new Date(),
      createdAt: new Date(),
    });

    const rawToken = "sai_abc123";
    const result = await findUserByApiToken(rawToken);

    expect(prismaMock.apiToken.findUnique).toHaveBeenCalledWith({
      where: { tokenHash: hashApiToken(rawToken) },
      include: { user: true },
    });
    expect(prismaMock.apiToken.update).toHaveBeenCalledWith({
      where: { id: "tok_1" },
      data: { lastUsedAt: expect.any(Date) },
    });
    expect(result).toBe(user);
  });

  it("returns null when the token is not found", async () => {
    prismaMock.apiToken.findUnique.mockResolvedValue(null);

    const result = await findUserByApiToken("sai_missing");

    expect(result).toBeNull();
    expect(prismaMock.apiToken.update).not.toHaveBeenCalled();
  });
});
