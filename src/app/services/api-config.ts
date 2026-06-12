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
 * Optional CORS proxy prefix for pure-browser deployments (e.g. GitHub
 * Pages) in case football-data.org rejects cross-origin requests. The
 * native Android app does not need this — Capacitor performs the request
 * natively. Example: 'https://your-worker.workers.dev/?url='
 * (the target URL is appended, URL-encoded).
 */
export const FOOTBALL_DATA_PROXY = '';
