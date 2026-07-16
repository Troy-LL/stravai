import { GitHubSignInButton } from "@/components/GitHubSignInButton";
import { DevLogin } from "@/components/DevLogin";
import { auth } from "@/auth";
import { redirect } from "next/navigation";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ callbackUrl?: string }>;
}) {
  const session = await auth();
  const { callbackUrl } = await searchParams;

  if (session?.user?.id) {
    redirect(callbackUrl ?? "/");
  }

  return (
    <div className="mx-auto flex min-h-[60vh] max-w-sm flex-col items-center justify-center gap-6 text-center">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Sign in to StravAI</h1>
        <p className="mt-2 text-sm text-muted">
          Track coding workouts and compare with friends.
        </p>
      </div>
      <GitHubSignInButton redirectTo={callbackUrl ?? "/"} />
      {process.env.NODE_ENV !== "production" && (
        <DevLogin redirectTo={callbackUrl ?? "/"} />
      )}
      <p className="text-xs text-muted">
        If GitHub shows a 404, sign out of GitHub first, try Chrome instead of
        Brave, or recreate the OAuth app under your personal account at{" "}
        <a
          href="https://github.com/settings/applications/new"
          className="text-accent underline"
          target="_blank"
          rel="noreferrer"
        >
          github.com/settings/applications/new
        </a>
        .
      </p>
    </div>
  );
}
