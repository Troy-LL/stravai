# StravAI — SPEC-gap plan

Executes remaining SPEC/backlog gaps after the initial build. Stack: Next.js 15 app router,
Prisma (Postgres), Tailwind v4, TypeScript, Vitest. Dev server runs on :3000 (dev-login: /login → @alex).

## Global Constraints

- Ponytail: smallest change that works; reuse existing helpers (`lib/queries.ts`, `lib/format.ts`, `lib/constants.ts`).
- Auth: routes use `getCurrentUser()` (session) or `resolveUser(request)` (Bearer). Errors via `handleRouteError`.
- Activity types: coding|planning|debugging|review. Visibility: public|friends|private.
- Non-trivial logic leaves ONE runnable check (vitest under `tests/`). No new deps.
- Do not touch the dev server. Run `npx tsc --noEmit` and relevant `npx vitest run <file>` before reporting.
- Existing tests must stay green (`npm test` = 24 passing baseline).

## Task 1 — Anti-cheat input validation on activity POST (L-5)

File: `app/api/activities/route.ts` (POST), and a new pure helper in `lib/validateActivity.ts`.

Add a pure function `validateActivity(input)` that clamps/rejects implausible values. Reject (400) when:
- durationSec <= 0 or > 86400 (24h)
- locAdded or locRemoved < 0, or (locAdded + locRemoved) > 100000
- tokens < 0 or > 100_000_000
- filesTouched < 0 or > 10000
- commitCount < 0 or > 1000

Return `{ ok: true }` or `{ ok: false, error: string }`. Wire into POST BEFORE the prisma create; return
`NextResponse.json({ error }, { status: 400 })` on failure. Keep existing behavior for valid input.

Test: `tests/lib/validateActivity.test.ts` — asserts valid passes, each bound rejects, and boundary values.

## Task 2 — Regression tests for streak + range bounds (N-7)

File: `tests/lib/queries-pure.test.ts` (new). Import `computeStreak` and `getRangeBounds` from `@/lib/queries`.

- `computeStreak`: empty → 0; today+yesterday+2-days-ago → 3; today only → 1; gap breaks streak; unordered dates ok.
- `getRangeBounds("all")`: start <= 1970 and end year < 9999 AND end is a valid Date (`!isNaN`) — this guards the
  Postgres-overflow bug (JS max Date). daily/weekly/monthly return start < end.

Use fake/explicit dates; do not hit the DB. Pure-function tests only.

## Task 3 — Activity detail page /activity/[id] (N-2)

File: `app/activity/[id]/page.tsx` (new, Server Component). `params` is `Promise<{id:string}>`.

Use `getActivity(id)` from `@/lib/queries` (returns activity incl. user, kudos[{userId}], comments[...] or null).
Viewer via `getCurrentUser()`. If null → `notFound()`. Render a single `ActivityCard` (showKudos) mapped to
`ActivityCardData` (same mapping shape as `app/page.tsx`: startedAt/comments→ISO strings, kudosCount, hasKudoed),
plus a back link to feed. Make the activity title in `components/ActivityCard.tsx` link to `/activity/{id}`
(wrap the `<h2>` text in a Link) — keep everything else identical.

## Task 4 — Badges on profile (Phase 5)

File: `lib/badges.ts` (new pure helper) + section in `app/profile/[handle]/page.tsx`.

`computeBadges(stats)` where stats is the `getProfileStats` return. Return `{icon,label}[]`:
- streak>=7 → 🔥 "Week streak"; streak>=1 → 🔥 "On a streak"
- bestLocSession>=500 → 🚀 "500 LOC session"
- totalActivities>=10 → 🎖 "10 sessions"; >=5 → 🎖 "5 sessions"
- mostTokens>=40000 → ⚡ "Token burner"
(Include the highest applicable tier per family only.) Render as a chip row (`.chip`) in a `.card` titled "Badges"
on the profile, above Activity mix. If none, hide the section.

Test: `tests/lib/badges.test.ts` — a high-stats object yields expected badges; empty/zero stats yields [].

## Out of scope

Route heatmaps, VS Code/CLI changes, next/image migration. (config warning + profile-comments wiring handled by controller inline.)
