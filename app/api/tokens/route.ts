import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/currentUser";
import { createApiToken, listApiTokens } from "@/lib/tokens";

export async function GET() {
  try {
    const user = await getCurrentUser();
    const tokens = await listApiTokens(user.id);
    return NextResponse.json({ tokens });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Failed to list tokens" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    const body = await request.json();
    const name = (body.name as string) ?? "CLI token";

    const created = await createApiToken(user.id, name);
    return NextResponse.json(
      {
        token: {
          id: created.id,
          name: created.name,
          createdAt: created.createdAt.toISOString(),
          rawToken: created.rawToken,
        },
      },
      { status: 201 },
    );
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Failed to create token" }, { status: 500 });
  }
}
