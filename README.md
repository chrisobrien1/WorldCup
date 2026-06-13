# ⚽ World Cup 26 — Tracker

A zero-backend, fully anonymous World Cup 2026 companion app built with
**Ionic 8 + Angular 19 (standalone, signals)** and **Capacitor 6** for Android.
All 104 matches, live scores, and on-device favorites - no login,
no server, no tracking.

## Scaffold commands used

```bash
npx @angular/cli@19 new worldcup26 --style=scss --ssr=false --routing --skip-tests
cd worldcup26
npm i @ionic/angular@8 ionicons @capacitor/core@6 @capacitor/android@6
npm i -D @capacitor/cli@6
npx cap add android
```

## Run it

```bash
npm install
npm start                 # dev server → http://localhost:4200
npm run build             # production build
npx cap sync android      # copy web build into the Android project
npx cap open android      # open in Android Studio, then Run ▶
```

## Architecture: the swappable data layer

Components never name a concrete service. They inject the
`WORLD_CUP_SERVICE` token, typed by the `IWorldCupDataService` abstract
contract (`src/app/services/world-cup.contract.ts`):

| Member | Returns |
| --- | --- |
| `getTeams()` | `Observable<Team[]>` — the 48 qualified teams |
| `getMatches()` | `Observable<Match[]>` — all 104 matches, re-emits on change |
| `getLiveUpdates()` | `Observable<MatchEvent>` — kickoffs, goals, full-time |
| `getFavorites()` | `Observable<string[]>` — starred team ids |
| `toggleFavorite(teamId)` | persists to `localStorage`, anonymous |

Two implementations ship with the app:

- **`MockWorldCupService`** — the offline simulation engine (default).
- **`FootballDataService`** — live data from the
  [football-data.org](https://www.football-data.org) v4 API (free tier:
  World Cup included, 10 req/min; we poll every 30 s and diff snapshots
  into goal/kickoff/full-time events).

### Going live

1. Register free at https://www.football-data.org/client/register
2. **GitHub Pages deployment**: add the emailed token as a repository
   secret named `FOOTBALL_DATA_TOKEN` (Settings → Secrets and variables →
   Actions). The `refresh-data.yml` workflow fetches the API server-side
   every 5 minutes and publishes `data/*.json` snapshots to the Pages
   site, which the browser app reads same-origin — football-data.org's
   unreliable CORS support never comes into play and the token never
   reaches the client bundle.
   **Local/Android builds**: paste the token into `FOOTBALL_DATA_TOKEN`
   in `src/app/services/api-config.ts` (avoid committing it) — the app
   then calls the API directly (natively on Android, so no CORS) and
   polls every 30 s.
3. `app.config.ts` picks the live service automatically (token present or
   `USE_HOSTED_SNAPSHOT` enabled); set `USE_HOSTED_SNAPSHOT = false` for
   offline mock development.

## The mock engine

- **Schedule** (`mock-data.ts`): 48 teams in 12 groups; the 72 group fixtures
  are generated round-robin; 32 knockout slots (R32 → Final) carry TBD
  placeholders. Kickoffs are fixed ISO 8601 UTC strings anchored around "now",
  so the app always launches with past results, live matches, and an upcoming
  slate.
- **Simulation** (`mock-world-cup.service.ts`): one RxJS `interval` heartbeat
  flips matches live at kickoff, advances the clock, randomly scores goals
  (emitting `MatchEvent`s that surface as neon goal toasts), and blows the
  full-time whistle at 90′. Past results are seeded per-match so they stay
  stable across restarts.
- **Times**: source data is UTC; Angular's `date` pipe renders everything in
  the device timezone, which is displayed in the schedule header.

## UI

- **Matches tab** — Upcoming / Live Tracker / Past Results segments, a
  "★ Favorites only" toggle, sticky day headers, and match cards with emoji
  flags, pulsing crimson LIVE badges, and live minute counters.
- **Teams tab** — all 48 teams by group; starring pops with a gold glow and
  favorited teams' match cards glow gold on the schedule.
- Deep obsidian dark theme with electric lime / stadium gold / magenta accents
  (`src/styles.scss`).
