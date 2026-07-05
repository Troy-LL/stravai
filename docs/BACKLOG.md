# Backlog

Prioritized work after v0.1. See [SPEC.md](SPEC.md) for product scope and [ARCHITECTURE.md](ARCHITECTURE.md) for stack.

## Now — Phase 2: Auto-capture (done)

| ID | Item | Status |
|---|---|---|
| P2-1 | API-token auth for headless clients (`Authorization: Bearer`) | done |
| P2-2 | Settings page to generate/list/revoke tokens | done |
| P2-3 | CLI `stravai record` — git diff LOC + post to API | done |
| P2-4 | Git `post-commit` hook installer (`stravai install-hook`) | done |
| P2-5 | VS Code extension — start/stop session, duration + LOC capture | done |

## Next — Harden + social depth

| ID | Item | Notes |
|---|---|---|
| N-1 | GitHub OAuth | Replace demo user switcher | done |
| N-2 | Activity detail page | `/activity/[id]` with full stats |
| N-3 | Comments on activities | Extend social layer |
| N-4 | Streaks | Consecutive days with logged activity |
| N-5 | Leaderboard filters | daily / monthly / all-time |
| N-6 | Deploy to Vercel | Production Postgres (Neon) | done (see DEPLOY.md) |
| N-7 | Tests | API routes + key UI flows |

## Later — Product expansion

| ID | Item | Notes |
|---|---|---|
| L-1 | Activity types | Planning, Debugging, Code Review |
| L-2 | Segments | Repo/path-scoped leaderboards |
| L-3 | Challenges | Team goals (e.g. 10k LOC/month) |
| L-4 | Token / cost tracking | Calories metaphor |
| L-5 | Anti-cheat | Vendored-code / paste detection |
| L-6 | Privacy controls | Opt-in pace visibility for managers |
| L-7 | Complexity / elevation | Files touched, complexity delta |

## Open questions (from SPEC)

1. **LOC:** v0.1 uses net; revisit if gaming appears.
2. **Calories:** tokens vs $ cost — decide when building L-4.
3. **Solo vs AI-assisted:** scope filter for activity types.
