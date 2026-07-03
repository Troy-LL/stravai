import { NextRequest, NextResponse } from "next/server";
import { CURRENT_USER_COOKIE } from "@/lib/constants";

export async function POST(request: NextRequest) {
  const body = await request.json();
  const handle = body.handle?.trim();

  if (!handle) {
    return NextResponse.json({ error: "handle is required" }, { status: 400 });
  }

  const response = NextResponse.json({ ok: true, handle });
  response.cookies.set(CURRENT_USER_COOKIE, handle, {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 30,
  });

  return response;
}
