import { beforeEach, describe, expect, it, vi } from "vitest";
import { NextRequest } from "next/server";
import type { User } from "@prisma/client";

vi.mock("@/lib/currentUser", () => ({
  getCurrentUser: vi.fn(),
}));

vi.mock("@/lib/tokens", () => ({
  listApiTokens: vi.fn(),
  createApiToken: vi.fn(),
}));

import { getCurrentUser } from "@/lib/currentUser";
import { createApiToken, listApiTokens } from "@/lib/tokens";
import { AuthError } from "@/lib/auth";
import { GET, POST } from "@/app/api/tokens/route";

const sessionUser: User = {
  id: "user_1",
  githubId: "gh_1",
  name: "Ada",
  handle: "ada",
  avatarUrl: null,
  createdAt: new Date(),
};

describe("GET /api/tokens", () => {
  beforeEach(() => {
    vi.mocked(getCurrentUser).mockReset();
    vi.mocked(listApiTokens).mockReset();
  });

  it("returns the user's tokens", async () => {
    const tokens = [
      {
        id: "tok_1",
        name: "CLI",
        lastUsedAt: null,
        createdAt: new Date("2026-01-01T00:00:00.000Z"),
      },
    ];
    vi.mocked(getCurrentUser).mockResolvedValue(sessionUser);
    vi.mocked(listApiTokens).mockResolvedValue(tokens);

    const response = await GET();

    expect(getCurrentUser).toHaveBeenCalledOnce();
    expect(listApiTokens).toHaveBeenCalledWith("user_1");
    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toEqual({
      tokens: [
        {
          id: "tok_1",
          name: "CLI",
          lastUsedAt: null,
          createdAt: "2026-01-01T00:00:00.000Z",
        },
      ],
    });
  });

  it("returns 401 when the user is not signed in", async () => {
    vi.mocked(getCurrentUser).mockRejectedValue(new AuthError("Sign in required", 401));

    const response = await GET();

    expect(response.status).toBe(401);
    await expect(response.json()).resolves.toEqual({ error: "Sign in required" });
  });
});

describe("POST /api/tokens", () => {
  beforeEach(() => {
    vi.mocked(getCurrentUser).mockReset();
    vi.mocked(createApiToken).mockReset();
  });

  it("creates a token for the signed-in user", async () => {
    const createdAt = new Date("2026-01-02T00:00:00.000Z");
    vi.mocked(getCurrentUser).mockResolvedValue(sessionUser);
    vi.mocked(createApiToken).mockResolvedValue({
      id: "tok_1",
      name: "CLI token",
      createdAt,
      rawToken: "sai_deadbeef",
    });

    const request = new NextRequest("http://localhost/api/tokens", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ name: "CLI token" }),
    });

    const response = await POST(request);

    expect(createApiToken).toHaveBeenCalledWith("user_1", "CLI token");
    expect(response.status).toBe(201);
    await expect(response.json()).resolves.toEqual({
      token: {
        id: "tok_1",
        name: "CLI token",
        createdAt: createdAt.toISOString(),
        rawToken: "sai_deadbeef",
      },
    });
  });
});
