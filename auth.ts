import NextAuth from "next-auth";
import authConfig from "@/auth.config";
import { upsertGitHubUser } from "@/lib/githubUser";

export const { handlers, auth, signIn, signOut } = NextAuth({
  ...authConfig,
  callbacks: {
    async jwt({ token, account, profile }) {
      if (account?.provider === "github" && profile) {
        // `profile` here is the raw GitHub API response: it has `login` and
        // `avatar_url` (not the normalized `image`). Fall back gracefully in
        // case a future Auth.js version passes a normalized shape instead.
        const gh = profile as {
          id?: string | number;
          login?: string | null;
          name?: string | null;
          email?: string | null;
          avatar_url?: string | null;
          image?: string | null;
        };
        const githubId = String(gh.id ?? account.providerAccountId);
        const login =
          gh.login ??
          gh.name ??
          gh.email?.split("@")[0] ??
          `user-${githubId}`;

        const user = await upsertGitHubUser({
          id: githubId,
          login,
          name: gh.name,
          avatar_url: gh.avatar_url ?? gh.image ?? null,
        });
        token.sub = user.id;
      }
      return token;
    },
    async session({ session, token }) {
      if (token.sub) {
        session.user.id = token.sub;
      }
      return session;
    },
  },
});
