"use client";

import { signIn } from "next-auth/react";

type GitHubSignInButtonProps = {
  redirectTo?: string;
};

export function GitHubSignInButton({ redirectTo = "/" }: GitHubSignInButtonProps) {
  return (
    <button
      type="button"
      onClick={() => signIn("github", { redirectTo })}
      className="rounded-lg bg-accent px-5 py-2.5 text-sm font-semibold text-white transition hover:opacity-90"
    >
      Continue with GitHub
    </button>
  );
}
