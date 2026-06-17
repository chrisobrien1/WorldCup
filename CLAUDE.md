# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project

World Cup 26 Tracker — a zero-backend, anonymous companion app for the 2026
World Cup (all 104 matches, live scores, on-device favorites). Built with
**Ionic 8 + Angular 19** (standalone components, signals, OnPush) and
**Capacitor 6** for Android. No login, no server, no tracking.

## Commands

```bash
npm install              # install deps
npm start                # dev server → http://localhost:4200
npm run build            # production build → dist/worldcup26/browser
npm test                 # Karma + Jasmine (headless Chrome)
npx ng test --include='**/foo.spec.ts'   # run a single spec file
npx cap sync android     # copy web build into the Android project
npx cap open android     # open in Android Studio to run on a device
```

Note: there are currently **no `.spec.ts` files** in the repo (scaffolded with
`--skip-tests`); `npm test` has nothing to run until specs are added.

## Architecture: the swappable data layer

This is the core abstraction — understand it before touching anything in
`src/app/services/`. Components **never** reference a concrete service; they
inject the `WORLD_CUP_SERVICE` token, typed by the abstract contract
`IWorldCupDataService` (`services/world-cup.contract.ts`). Adding a data method
means: add it to the contract, then implement it in **both** services below, or
the build breaks.

Two implementations satisfy the contract:

- **`MockWorldCupService`** — offline simulation engine. An RxJS `interval`
  heartbeat flips matches live at kickoff, advances the clock, randomly scores
  goals, and blows full-time at 90′. Past results are seeded per-match id
  (`mulberry32(hashId(...))`) so they stay stable across reloads. Schedule is
  generated in `mock-data.ts` (48 teams, 12 groups, round-robin group stage +
  TBD knockout slots), anchored around "now" so launch always shows past/live/
  upcoming matches.
- **`FootballDataService`** — live data from football-data.org v4. The free
  tier exposes match *snapshots*, not an event feed, so `getLiveUpdates()`
  derives kickoff/goal/full-time `MatchEvent`s by **diffing consecutive polls**
  against the previous snapshot.

`app.config.ts` picks the implementation at startup based on flags in
`services/api-config.ts`:

- `FOOTBALL_DATA_TOKEN` set → `FootballDataService` calling the API directly
  (polls every 30 s; used for local/Android — Capacitor makes the request
  natively, so no CORS).
- `USE_HOSTED_SNAPSHOT = true` (default, no token) → `FootballDataService` in
  snapshot mode, reading same-origin `data/matches.json` / `data/teams.json`.
- otherwise → `MockWorldCupService`.

Routing uses **hash URLs** (`withHashLocation()`) so it works on any static
host and inside the Capacitor webview without server rewrites.

## Deployment & hosting (GitHub Pages) — important

The repo has no `main` with app code. **`claude/world-cup-2026-app-l0ha4b` is
the production source branch.** Feature branches do *not* deploy on their own —
changes only go live once they land on that branch.

- **`.github/workflows/deploy-pages.yml`** — triggers on push to
  `claude/world-cup-2026-app-l0ha4b` (or `main`). Runs
  `ng build --base-href=./` and publishes `dist/worldcup26/browser` to the
  **`gh-pages`** branch via `peaceiris/actions-gh-pages` with `keep_files: true`
  (so it never wipes the data snapshots).
- **`.github/workflows/refresh-data.yml`** — cron `*/5 * * * *`. Fetches
  football-data.org server-side (using the `FOOTBALL_DATA_TOKEN` repo secret —
  no CORS, token never reaches the client) and commits
  `data/matches.json` / `data/teams.json` directly to `gh-pages`. This snapshot
  is what the deployed app reads same-origin.
- **`gh-pages`** is the served branch and is machine-managed (build output +
  data snapshots) — never edit it by hand.

To ship a change: get it onto `claude/world-cup-2026-app-l0ha4b`; the push
triggers the deploy automatically.

## Conventions

- Components are standalone, use `ChangeDetectionStrategy.OnPush`, and consume
  the data layer via `toSignal(...)`. Prefer signals/`computed` over manual
  subscriptions.
- All match times are stored as **UTC** ISO strings (`kickoffUtc`); the
  Angular `date` pipe renders them in the device timezone (shown in the
  schedule header). Do not pre-convert to local time in the data layer.
- Theme tokens (lime / gold / magenta on obsidian) live in `src/styles.scss`.
