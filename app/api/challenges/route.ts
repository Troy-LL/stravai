import { NextResponse } from "next/server";
import { handleRouteError } from "@/lib/auth";
import { getCurrentUser } from "@/lib/currentUser";
import { getChallenges } from "@/lib/queries";

export async function GET() {
  try {
    const currentUser = await getCurrentUser();
    const challenges = await getChallenges(currentUser.id);
    return NextResponse.json({ challenges });
  } catch (error) {
    return handleRouteError(error, "Failed to load challenges");
  }
}
