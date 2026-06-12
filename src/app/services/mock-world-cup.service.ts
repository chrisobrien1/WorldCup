import { Injectable, OnDestroy } from '@angular/core';
import { BehaviorSubject, Observable, Subject, Subscription, interval, of } from 'rxjs';
import { Match, MatchEvent, Team } from '../models';
import { IWorldCupDataService } from './world-cup.contract';
import { TEAMS, buildSchedule, hashId, mulberry32 } from './mock-data';
import { readFavorites, toggledFavorites, writeFavorites } from './favorites-store';

const TICK_MS = 2500;
/** Simulated match minutes advanced per tick (~accelerated for the demo). */
const MINUTES_PER_TICK = 2;
/** Chance per team per tick of scoring (≈1.4 goals per team per match). */
const GOAL_CHANCE = 0.03;
const FULL_TIME = 90;

@Injectable()
export class MockWorldCupService extends IWorldCupDataService implements OnDestroy {
  private readonly teamsById = new Map(TEAMS.map((t) => [t.id, t]));
  private readonly matches$: BehaviorSubject<Match[]>;
  private readonly favorites$: BehaviorSubject<string[]>;
  private readonly events$ = new Subject<MatchEvent>();
  private readonly ticker: Subscription;

  constructor() {
    super();
    this.matches$ = new BehaviorSubject(this.settleHistory(buildSchedule(Date.now())));
    this.favorites$ = new BehaviorSubject(readFavorites());
    this.ticker = interval(TICK_MS).subscribe(() => this.tick());
  }

  ngOnDestroy(): void {
    this.ticker.unsubscribe();
  }

  getTeams(): Observable<Team[]> {
    return of(TEAMS);
  }

  getMatches(): Observable<Match[]> {
    return this.matches$.asObservable();
  }

  getLiveUpdates(): Observable<MatchEvent> {
    return this.events$.asObservable();
  }

  getFavorites(): Observable<string[]> {
    return this.favorites$.asObservable();
  }

  toggleFavorite(teamId: string): void {
    const next = toggledFavorites(this.favorites$.value, teamId);
    this.favorites$.next(next);
    writeFavorites(next);
  }

  /**
   * At launch, matches whose kickoff already passed get deterministic
   * (seeded by match id, so stable across reloads) results; matches kicked
   * off within the last 90 minutes resume mid-game as live.
   */
  private settleHistory(matches: Match[]): Match[] {
    const now = Date.now();
    return matches.map((m) => {
      if (m.homeTeamId === null) {
        return m;
      }
      const elapsedMin = (now - Date.parse(m.kickoffUtc)) / 60_000;
      if (elapsedMin <= 0) {
        return m;
      }
      const rand = mulberry32(hashId(m.id));
      const goals = () => Math.floor(rand() * 3.4); // 0–3, skewed low
      if (elapsedMin >= FULL_TIME) {
        return { ...m, status: 'finished' as const, minute: FULL_TIME, homeScore: goals(), awayScore: goals() };
      }
      const minute = Math.max(1, Math.floor(elapsedMin));
      return {
        ...m,
        status: 'live' as const,
        minute,
        homeScore: Math.min(goals(), Math.floor(minute / 35)),
        awayScore: Math.min(goals(), Math.floor(minute / 45)),
      };
    });
  }

  /** The simulation heartbeat: kickoffs, goals, minutes, full-time whistles. */
  private tick(): void {
    const now = Date.now();
    let changed = false;

    const next = this.matches$.value.map((m) => {
      if (m.homeTeamId === null || m.awayTeamId === null || m.status === 'finished') {
        return m;
      }

      if (m.status === 'upcoming') {
        if (Date.parse(m.kickoffUtc) > now) {
          return m;
        }
        changed = true;
        this.emit(m, 0, 'kickoff', `Kick-off! ${this.name(m.homeTeamId)} vs ${this.name(m.awayTeamId)}`);
        return { ...m, status: 'live' as const, minute: 0 };
      }

      // Live: advance the clock and maybe score.
      changed = true;
      const live = { ...m, minute: Math.min(m.minute + MINUTES_PER_TICK, FULL_TIME) };
      if (Math.random() < GOAL_CHANCE) {
        live.homeScore++;
        this.emit(live, live.minute, 'goal', `GOAL! ${this.name(m.homeTeamId)} score — ${this.scoreline(live)}`, m.homeTeamId);
      }
      if (Math.random() < GOAL_CHANCE) {
        live.awayScore++;
        this.emit(live, live.minute, 'goal', `GOAL! ${this.name(m.awayTeamId)} score — ${this.scoreline(live)}`, m.awayTeamId);
      }
      if (live.minute >= FULL_TIME) {
        live.status = 'finished';
        this.emit(live, FULL_TIME, 'fulltime', `Full-time: ${this.scoreline(live)}`);
      }
      return live;
    });

    if (changed) {
      this.matches$.next(next);
    }
  }

  private emit(m: Match, minute: number, type: MatchEvent['type'], description: string, teamId?: string): void {
    this.events$.next({ matchId: m.id, minute, type, teamId, description });
  }

  private name(teamId: string): string {
    return this.teamsById.get(teamId)?.name ?? teamId;
  }

  private scoreline(m: Match): string {
    return `${this.name(m.homeTeamId!)} ${m.homeScore}–${m.awayScore} ${this.name(m.awayTeamId!)}`;
  }
}
