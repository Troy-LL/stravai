import { NextResponse } from "next/server";
import { handleRouteError } from "@/lib/auth";
import { getCurrentUser } from "@/lib/currentUser";
import { getSegments } from "@/lib/queries";

export async function GET() {
  try {
    const currentUser = await getCurrentUser();
    const segments = await getSegments(currentUser.id);
    return NextResponse.json({ segments });
  } catch (error) {
    return handleRouteError(error, "Failed to load segments");
  }
}
