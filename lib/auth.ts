import { NextRequest } from "next/server";
import { getCurrentUser } from "@/lib/currentUser";
import { findUserByApiToken } from "@/lib/tokens";
import type { User } from "@prisma/client";

function extractBearerToken(request: NextRequest): string | null {
  const header = request.headers.get("authorization");
  if (!header?.startsWith("Bearer ")) return null;
  const token = header.slice(7).trim();
  return token || null;
}

export async function resolveUser(request: NextRequest): Promise<User> {
  const bearer = extractBearerToken(request);
  if (bearer) {
    const user = await findUserByApiToken(bearer);
    if (!user) {
      throw new AuthError("Invalid API token", 401);
    }
    return user;
  }

  return getCurrentUser();
}

export class AuthError extends Error {
  constructor(
    message: string,
    public status: number,
  ) {
    super(message);
    this.name = "AuthError";
  }
}
