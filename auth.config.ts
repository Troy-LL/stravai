import type { NextAuthConfig } from "next-auth";
import GitHub from "next-auth/providers/github";

const githubId = process.env.AUTH_GITHUB_ID?.trim();
const githubSecret = process.env.AUTH_GITHUB_SECRET?.trim();

if (!githubId || !githubSecret) {
  console.warn("[auth] AUTH_GITHUB_ID or AUTH_GITHUB_SECRET is missing");
}

export default {
  secret: process.env.AUTH_SECRET?.trim(),
  providers: [
    GitHub({
      clientId: githubId,
      clientSecret: githubSecret,
      // Confidential client (has secret) — skip PKCE for broader GitHub OAuth app compatibility
      checks: ["state"],
    }),
  ],
  session: { strategy: "jwt" },
  pages: {
    signIn: "/login",
    error: "/login",
  },
  trustHost: true,
} satisfies NextAuthConfig;
