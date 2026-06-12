/**
 * Live API configuration (football-data.org).
 *
 * For local/Android development: paste your token below (don't commit it).
 * For the GitHub Pages deployment: leave this empty — the deploy workflow
 * injects the FOOTBALL_DATA_TOKEN repository secret at build time.
 * app.config.ts switches from the mock engine to the live
 * FootballDataService whenever a token is present.
 *
 * Free tier: FIFA World Cup included, 10 requests/min (we poll every 30s).
 * Note: the token ships in the client bundle — acceptable for a personal
 * free-tier key, not for a paid secret.
 */
export const FOOTBALL_DATA_TOKEN = '';

/**
 * Optional CORS proxy prefix for pure-browser deployments in case
 * football-data.org rejects cross-origin requests. The native Android app
 * does not need this — Capacitor performs the request natively.
 * Example: 'https://your-worker.workers.dev/?url='
 * (the target URL is appended, URL-encoded).
 */
export const FOOTBALL_DATA_PROXY = '';

/**
 * Browser deployments without a token read same-origin JSON snapshots
 * (data/matches.json, data/teams.json) that the refresh-data.yml GitHub
 * Actions workflow re-fetches from football-data.org every 5 minutes —
 * no CORS, no token in the bundle, no extra accounts. Set to false to
 * fall back to the offline mock engine when no token is set.
 */
export const USE_HOSTED_SNAPSHOT = true;
