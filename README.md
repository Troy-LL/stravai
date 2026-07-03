# StravAI

**Strava for AI-assisted coding** — track coding workouts, compare with friends, climb the weekly leaderboard.

## Prerequisites

- Node.js 20+
- Postgres (local install, Docker, or [Prisma Dev](https://www.prisma.io/docs/postgres/database/local-development) local server)

## Quick start

```bash
cd stravai
npm install
cp .env.example .env
```

### Database setup

**Option A — Prisma Dev (no Docker required)**

```bash
npx prisma dev -d          # start local Postgres
npx prisma dev ls          # copy the TCP DATABASE_URL into .env (add &pgbouncer=true)
npx prisma db push
npm run db:seed
```

**Option B — existing Postgres**

Set `DATABASE_URL` in `.env` (append `&pgbouncer=true` when using Prisma Dev), then:

```bash
npx prisma migrate dev
npm run db:seed
```

### Run the app

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Demo users

After seeding, four demo users are available. Use the **Viewing as** switcher in the nav to impersonate:

| Handle   | Name        |
|----------|-------------|
| `alex`   | Alex Chen   |
| `jordan` | Jordan Lee  |
| `sam`    | Sam Rivera  |
| `taylor` | Taylor Kim  |

Default user: `alex` (set via `DEFAULT_USER_HANDLE`).

## Screens

- **Feed** (`/`) — friends' recent coding sessions with kudos
- **Profile** (`/profile/[handle]`) — activity history and weekly stats
- **Leaderboard** (`/leaderboard`) — weekly LOC net among friends
- **Record** (`/record`) — manual session logging
- **Settings** (`/settings`) — generate API tokens for CLI/extension

## API tokens (auto-capture auth)

1. Open **Settings** in the nav (while viewing as your demo user).
2. Generate a token and copy it immediately (`sai_...`).
3. Export for CLI/hook:

```bash
export STRAVAI_URL=http://localhost:3000
export STRAVAI_TOKEN=sai_...
```

## CLI

From any git repo:

```bash
node tools/cli/bin/stravai.js record
node tools/cli/bin/stravai.js install-hook   # auto-log on every commit
```

Or link globally:

```bash
cd tools/cli && npm link
stravai record
```

The CLI reads `git diff --shortstat` for LOC and estimates duration from commit timing.

## VS Code extension

```bash
cd extensions/vscode
npm install && npm run compile
```

Open `extensions/vscode` in VS Code, press **F5** to launch Extension Development Host.

Configure in settings:
- `stravai.apiUrl` — default `http://localhost:3000`
- `stravai.token` — your `sai_...` token

Commands: **StravAI: Start Session** / **StravAI: Stop Session** (status bar timer on stop posts activity).

## API (ingestion seam)

All activity writes go through one endpoint:

```
POST /api/activities
Authorization: Bearer sai_...
Content-Type: application/json

{
  "title": "optional",
  "startedAt": "2026-07-04T08:00:00.000Z",
  "durationSec": 3600,
  "locAdded": 200,
  "locRemoved": 50,
  "commitCount": 3,
  "repo": "acme/my-project"
}
```

Browser form uses the demo cookie instead of Bearer token.

Other routes:

- `GET /api/activities` — feed for current user
- `POST /api/activities/:id/kudos` — toggle kudos
- `GET /api/leaderboard` — weekly friend rankings
- `GET/POST /api/tokens` — manage API tokens
- `DELETE /api/tokens/:id` — revoke token
- `POST /api/user` — set demo current-user cookie

## Scripts

| Command           | Description              |
|-------------------|--------------------------|
| `npm run dev`     | Start dev server         |
| `npm run build`   | Production build         |
| `npm run db:seed` | Seed demo data           |
| `npm run db:studio` | Open Prisma Studio   |

## Docs

Product and architecture docs live in [`docs/`](docs/). Prioritized backlog: [`docs/BACKLOG.md`](docs/BACKLOG.md).
