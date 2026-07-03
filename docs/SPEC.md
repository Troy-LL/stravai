# StravAI

**Strava for AI-assisted work** — track coding "workouts," compare with friends, climb the leaderboard.

Tagline candidates: *"Every commit is a workout."* / *"Track your reps. Ship your sets."*

## Core idea

Strava turns runs and rides into data, segments, and social bragging rights. StravAI does the same for AI-assisted work sessions (coding, planning, research): trackable activities with metrics, leaderboards, and friend feeds.

**Key insight:** map dev/work activity types onto exercise metaphors people already understand.

## Activity types

| StravAI Activity | Analogy | What it tracks |
|---|---|---|
| **Execution / Coding** | Running | Active coding — writing/editing code, shipping commits |
| **Planning** | Walking | Architecture, specs, design docs, AI brainstorming |
| **Debugging** | Cycling *(future)* | Bug hunts, error-chasing sessions |
| **Code Review** | Swimming *(future)* | PR reviews, reading existing code |

Each type has its own pace, leaderboard segment, and personal records (PRs).

## Metrics

| Fitness metric | StravAI equivalent | Notes |
|---|---|---|
| Distance | Lines of code (LOC) changed | **v0.1 uses net** (added − removed) |
| Calories burned | Tokens consumed / compute cost | API $ or token count |
| Pace / speed | LOC/min or tokens/min | Sprint vs cruise |
| Elevation gain | Complexity added or files touched | The "hills" of a session |
| Duration | Session length (AI chat / IDE time) | Start/stop like Strava recording |
| Heart rate zones *(future)* | AI-generated vs human-edited ratio | Optional gamification |
| PRs | Best LOC/session, longest streak, fastest feature | |
| Segments | Specific repos, files, or ticket types | King of the Mountain per module |

## Social layer

- **Friends feed** — teammates' recent sessions
- **Kudos** — react to a refactor or shipping streak
- **Leaderboards** — filter by activity type, time range (daily/weekly/monthly/all-time), metric (LOC, tokens, pace, streak), group (org, team, friends)
- **Segments** — recurring leaderboards tied to a repo or label (e.g. "fastest auth features")
- **Challenges** — team goals like "10,000 LOC this month"
- **Streaks** — consecutive days with logged activity

## MVP (v0.1)

- [x] Single activity type: **Coding (Running)**
- [x] Manual session logging (git-hook / extension deferred to Phase 2)
- [x] Metrics: duration, LOC net, commit count
- [x] Basic profile page with activity history
- [x] Friend leaderboard (weekly LOC total)
- [x] Kudos button

**Out of scope for v0.1:** planning/debugging types, segments, challenges, token/calorie tracking, complexity scoring.

See [ARCHITECTURE.md](ARCHITECTURE.md) for data model, ingestion, and stack.

## Open questions

1. **LOC counting:** v0.1 uses **net** (added − removed). Gross or "meaningful diff" may follow if gaming becomes an issue.
2. **Calories = tokens or $ cost?** Tokens are universal; $ cost is more visceral.
3. **Anti-cheat:** prevent vendored-code paste attacks on leaderboards (analogous to Strava GPS spoofing).
4. **Privacy:** team/manager visibility of pace data — opt-in/opt-out design needed early.
5. **Solo vs AI-assisted:** track human-only coding too, or strictly AI-assisted sessions?
6. **Auth:** GitHub OAuth deferred to Phase 2; v0.1 uses a demo user switcher cookie.

## Roadmap

| Phase | Goal |
|---|---|
| **1 — Prove the loop** | Manual logging + friend leaderboard for coding; validate social comparison |
| **2 — Auto-capture** | Git hook + Claude Code session parsing; remove manual friction |
| **3 — Activity types** | Planning (walking), Debugging (cycling), Code Review (swimming) |
| **4 — Social depth** | Segments, challenges, kudos, comments, team pages |
| **5 — Fun layer** | Calorie/token art, badges, complexity "elevation" visualizations |
