import { NextRequest, NextResponse } from "next/server";
import { handleRouteError } from "@/lib/auth";
import { getCurrentUser } from "@/lib/currentUser";
import { revokeApiToken } from "@/lib/tokens";

type RouteContext = { params: Promise<{ id: string }> };

export async function DELETE(_request: NextRequest, context: RouteContext) {
  try {
    const { id } = await context.params;
    const user = await getCurrentUser();
    const revoked = await revokeApiToken(user.id, id);

    if (!revoked) {
      return NextResponse.json({ error: "Token not found" }, { status: 404 });
    }

    return NextResponse.json({ ok: true });
  } catch (error) {
    return handleRouteError(error, "Failed to revoke token");
  }
}
