import { InjectionToken } from '@angular/core';
import { Observable } from 'rxjs';
import { Match, MatchEvent, Team } from '../models';

/**
 * The swappable data-layer contract.
 *
 * Components only ever depend on this abstraction via the WORLD_CUP_SERVICE
 * token. Swapping the mock engine for a live HTTP backend (API-Football,
 * Football-Data.org, …) near tournament time means writing one new class that
 * extends this contract and changing the single `useClass` line in
 * `app.config.ts` — no component changes.
 */
export abstract class IWorldCupDataService {
  /** All 48 qualified teams. */
  abstract getTeams(): Observable<Team[]>;

  /** All 104 tournament matches; re-emits whenever any match changes. */
  abstract getMatches(): Observable<Match[]>;

  /**
   * When the match data was last refreshed from its source, or null before
   * the first successful load. Re-emits on every refresh so the UI can show
   * a "last updated" indicator.
   */
  abstract getLastUpdated(): Observable<Date | null>;

  /** Real-time stream of match events (kickoffs, goals, full-time whistles). */
  abstract getLiveUpdates(): Observable<MatchEvent>;

  /** Ids of the user's favorite teams; re-emits on every change. */
  abstract getFavorites(): Observable<string[]>;

  /** Star / unstar a team. Persisted on-device, anonymously. */
  abstract toggleFavorite(teamId: string): void;
}

export const WORLD_CUP_SERVICE = new InjectionToken<IWorldCupDataService>(
  'WORLD_CUP_SERVICE'
);
