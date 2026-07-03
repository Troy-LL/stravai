# Architecture

## Stack

| Layer | Choice |
|---|---|
| App | Next.js 15 (App Router, TypeScript) — full-stack monolith |
| ORM / DB | Prisma + Postgres |
| Styling | Tailwind CSS v4 |
| Auth (web) | Demo user cookie switcher; GitHub OAuth deferred |
| Auth (headless) | API bearer tokens (`Authorization: Bearer sai_...`) |
| Leaderboards | On-demand Prisma aggregation (weekly LOC net among friends) |
| Clients | Web app, CLI (`tools/cli`), VS Code extension (`extensions/vscode`) |

## Ingestion seam

All activity writes go through a single API endpoint:

```
POST /api/activities
Authorization: Bearer <token>   # CLI, git hook, VS Code
# or demo cookie for browser form
```

Fields: `startedAt`, `durationSec`, `locAdded`, `locRemoved`, `commitCount`, optional `title` and `repo`. Server computes `locNet` and auto-generates title when omitted.

Routes:
- `GET /api/activities` — feed (cookie auth)
- `POST /api/activities/:id/kudos` — toggle kudos
- `GET /api/leaderboard` — weekly friend rankings
- `POST /api/user` — set demo current-user cookie
- `GET/POST /api/tokens` — list/create API tokens (cookie auth)
- `DELETE /api/tokens/:id` — revoke token

## Data capture

| Source | Role | Status |
|---|---|---|
| Manual "Record Activity" | Browser form fallback | shipped (v0.1) |
| API tokens + Settings | Auth for headless clients | shipped (v0.2) |
| CLI `stravai record` | Git diff LOC + post-commit capture | shipped (v0.2) |
| VS Code extension | Start/stop session; duration + LOC | shipped (v0.2) |
| GitHub webhook / OAuth | Commit events + real identity | deferred |
| Claude Code / Cursor logs | Token stats, tool-call history | deferred |

## Data model

```
User
 - id, name, handle, avatarUrl

ApiToken
 - id, userId, name, tokenHash, lastUsedAt

Friendship
 - userId, friendId (bidirectional rows)

Activity
 - id, user_id, type (coding)
 - started_at, ended_at, duration_sec
 - loc_added, loc_removed, loc_net
 - repo, commit_count, title
 - kudos[]

Kudos
 - activity_id, user_id (unique pair)
```

Deferred: Segment, Team, Challenge, tokens/cost, complexity.

## Integration boundaries

- **API tokens** — generated in Settings; SHA-256 hash stored server-side
- **CLI** — `tools/cli/bin/stravai.js`; env `STRAVAI_URL`, `STRAVAI_TOKEN`
- **VS Code** — `extensions/vscode`; settings `stravai.apiUrl`, `stravai.token`
- **GitHub OAuth** — identity + webhook ingestion (Next bucket)

See [SPEC.md](SPEC.md) for product scope and [BACKLOG.md](BACKLOG.md) for prioritized work.
