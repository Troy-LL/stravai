# Deploy to Vercel

Production stack: **Vercel** (Next.js) + **Neon** (Postgres).

## 1. Neon Postgres

1. Create a project at [neon.tech](https://neon.tech).
2. Copy the **pooled** connection string (PgBouncer).
3. Append `&pgbouncer=true` if not already present.

## 2. GitHub OAuth app

1. [GitHub Developer Settings](https://github.com/settings/developers) → **New OAuth App**.
2. **Homepage URL:** `https://your-app.vercel.app`
3. **Callback URL:** `https://your-app.vercel.app/api/auth/callback/github`
4. Copy Client ID and generate a Client Secret.

For local dev, add a second callback: `http://localhost:3000/api/auth/callback/github`.

## 3. Vercel project

In **Vercel → Project → Settings → Environment Variables**, add these for **Production** (and Preview if you use preview deploys):

| Variable | Value |
|---|---|
| `DATABASE_URL` | Neon **pooled** URL + `&pgbouncer=true` (drop `channel_binding=require` for serverless) |
| `DIRECT_URL` | Neon **direct** URL (host without `-pooler`) — used by `prisma migrate deploy` at build time |
| `AUTH_SECRET` | `openssl rand -base64 32` |
| `AUTH_GITHUB_ID` | GitHub OAuth app client ID |
| `AUTH_GITHUB_SECRET` | GitHub OAuth app client secret |
| `AUTH_URL` | `https://runairun.vercel.app` (your production URL) |

CLI alternative:

```bash
vercel link
vercel env add DATABASE_URL        # Neon pooled URL
vercel env add AUTH_SECRET         # openssl rand -base64 32
vercel env add AUTH_GITHUB_ID
vercel env add AUTH_GITHUB_SECRET
vercel env add AUTH_URL            # https://your-app.vercel.app
```

**Important:** `DATABASE_URL` must be set before deploy so `prisma migrate deploy` runs during build.

Deploy:

```bash
vercel --prod
```

## Troubleshooting

### "Application error: a server-side exception has occurred"

Common causes:

1. **`DATABASE_URL` missing on Vercel** — Prisma cannot connect. Add the Neon pooled URL in Vercel env vars, then **Redeploy**.
2. **Empty database (v0.2 demo auth)** — deployed code defaults to user `alex`. Run `npm run db:seed` against the same `DATABASE_URL` Vercel uses, or deploy the OAuth version (`/login` flow).
3. **`AUTH_SECRET` missing (OAuth deploy)** — Auth.js crashes middleware on every request. Generate and set `AUTH_SECRET`, then redeploy.
4. **GitHub OAuth callback mismatch** — callback must be `https://<your-domain>/api/auth/callback/github`.

After changing env vars, always trigger a new deployment (env changes do not apply to past builds).

## 4. Post-deploy

1. Open the production URL — you should land on `/login`.
2. Sign in with GitHub; a `User` row is created on first login.
3. Generate an API token under **Settings** for CLI / VS Code.
4. Set `STRAVAI_URL` to your production URL in local shell or extension settings.

## Optional: seed demo data locally

`npm run db:seed` creates demo users and friendships for local testing. OAuth users are separate accounts; seed data does not carry over to production.
