import { NextRequest } from "next/server";
import { beforeEach, describe, expect, it, vi } from "vitest";
import type { User } from "@prisma/client";

vi.mock("@/lib/tokens", () => ({
  findUserByApiToken: vi.fn(),
}));

vi.mock("@/lib/currentUser", () => ({
  getCurrentUser: vi.fn(),
}));

import { findUserByApiToken } from "@/lib/tokens";
import { getCurrentUser } from "@/lib/currentUser";
import { AuthError, handleRouteError, resolveUser } from "@/lib/auth";

const sessionUser: User = {
  id: "user_1",
  githubId: "gh_1",
  name: "Ada",
  handle: "ada",
  avatarUrl: null,
  createdAt: new Date(),
};

function requestWithAuth(token: string) {
  return new NextRequest("http://localhost/api/example", {
    headers: { authorization: `Bearer ${token}` },
  });
}

function requestWithoutAuth() {
  return new NextRequest("http://localhost/api/example");
}

describe("resolveUser", () => {
  beforeEach(() => {
    vi.mocked(findUserByApiToken).mockReset();
    vi.mocked(getCurrentUser).mockReset();
  });

  it("returns the user from findUserByApiToken for a valid bearer token", async () => {
    vi.mocked(findUserByApiToken).mockResolvedValue(sessionUser);

    const user = await resolveUser(requestWithAuth("sai_valid"));

    expect(findUserByApiToken).toHaveBeenCalledWith("sai_valid");
    expect(getCurrentUser).not.toHaveBeenCalled();
    expect(user).toBe(sessionUser);
  });

  it("throws AuthError with status 401 for an invalid bearer token", async () => {
    vi.mocked(findUserByApiToken).mockResolvedValue(null);

    await expect(resolveUser(requestWithAuth("sai_invalid"))).rejects.toMatchObject({
      message: "Invalid API token",
      status: 401,
      name: "AuthError",
    });
  });

  it("falls through to getCurrentUser when no bearer header is present", async () => {
    vi.mocked(getCurrentUser).mockResolvedValue(sessionUser);

    const user = await resolveUser(requestWithoutAuth());

    expect(findUserByApiToken).not.toHaveBeenCalled();
    expect(getCurrentUser).toHaveBeenCalledOnce();
    expect(user).toBe(sessionUser);
  });
});

describe("handleRouteError", () => {
  it("maps AuthError to its status", async () => {
    const response = handleRouteError(new AuthError("Sign in required", 401), "fallback");

    expect(response.status).toBe(401);
    await expect(response.json()).resolves.toEqual({ error: "Sign in required" });
  });

  it("maps other errors to 500", async () => {
    const response = handleRouteError(new Error("boom"), "Something went wrong");

    expect(response.status).toBe(500);
    await expect(response.json()).resolves.toEqual({ error: "Something went wrong" });
  });
});
