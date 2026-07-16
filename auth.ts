import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import authConfig from "@/auth.config";
import { upsertGitHubUser } from "@/lib/githubUser";
import { prisma } from "@/lib/db";

// Dev-only login: sign in as any seeded user by handle. Never enabled in prod.
const devProviders =
  process.env.NODE_ENV !== "production"
    ? [
        Credentials({
          id: "dev",
          name: "Dev login",
          credentials: { handle: {} },
          async authorize(creds) {
            const handle = String(creds?.handle ?? "").trim();
            if (!handle) return null;
            const user = await prisma.user.findUnique({ where: { handle } });
            if (!user) return null;
            return { id: user.id, name: user.name, image: user.avatarUrl ?? undefined };
          },
        }),
      ]
    : [];

export const { handlers, auth, signIn, signOut } = NextAuth({
  ...authConfig,
  providers: [...authConfig.providers, ...devProviders],
  callbacks: {
    async jwt({ token, account, profile, user }) {
      if (user?.id) {
        token.sub = user.id; // dev credentials login
      }
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
