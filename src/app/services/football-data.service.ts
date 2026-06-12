import { Injectable, OnDestroy } from '@angular/core';
import { CapacitorHttp } from '@capacitor/core';
import { BehaviorSubject, Observable, Subject, Subscription, timer } from 'rxjs';
import { Match, MatchEvent, Stage, Team } from '../models';
import { IWorldCupDataService } from './world-cup.contract';
import { FOOTBALL_DATA_PROXY, FOOTBALL_DATA_TOKEN } from './api-config';
import { readFavorites, toggledFavorites, writeFavorites } from './favorites-store';

const API_BASE = 'https://api.football-data.org/v4/competitions/WC';
/** 2 calls/min — well inside the free tier's 10 requests/min. */
const POLL_MS = 30_000;

/** football-data.org v4 payload shapes (only the fields we read). */
interface ApiTeam {
  id: number;
  name: string | null;
  tla: string | null;
}
interface ApiMatch {
  id: number;
  utcDate: string;
  status: string;
  stage: string;
  group: string | null;
  minute?: number | null;
  venue?: string | null;
  homeTeam: ApiTeam;
  awayTeam: ApiTeam;
  score: { fullTime: { home: number | null; away: number | null } };
}

const STAGE_MAP: Record<string, Stage> = {
  GROUP_STAGE: 'group',
  LAST_32: 'r32',
  LAST_16: 'r16',
  QUARTER_FINALS: 'qf',
  SEMI_FINALS: 'sf',
  THIRD_PLACE: 'third',
  FINAL: 'final',
};

/** FIFA trigram → ISO 3166-1 alpha-2, for emoji flags. */
const TLA_TO_ISO2: Record<string, string> = {
  ALG: 'DZ', ARG: 'AR', AUS: 'AU', AUT: 'AT', BEL: 'BE', BOL: 'BO', BRA: 'BR',
  CAN: 'CA', CHI: 'CL', CIV: 'CI', COL: 'CO', CPV: 'CV', CRC: 'CR', CRO: 'HR',
  CUW: 'CW', DEN: 'DK', ECU: 'EC', EGY: 'EG', ESP: 'ES', FRA: 'FR', GER: 'DE',
  GHA: 'GH', HAI: 'HT', HON: 'HN', IRN: 'IR', IRQ: 'IQ', ITA: 'IT', JAM: 'JM',
  JOR: 'JO', JPN: 'JP', KOR: 'KR', KSA: 'SA', MAR: 'MA', MEX: 'MX', NED: 'NL',
  NGA: 'NG', NOR: 'NO', NZL: 'NZ', PAN: 'PA', PAR: 'PY', PER: 'PE', POL: 'PL',
  POR: 'PT', QAT: 'QA', RSA: 'ZA', SEN: 'SN', SRB: 'RS', SUI: 'CH', SWE: 'SE',
  TUN: 'TN', TUR: 'TR', UKR: 'UA', URU: 'UY', USA: 'US', UZB: 'UZ',
};

function flagFor(tla: string | null): string {
  if (tla === 'ENG') return '🏴󠁧󠁢󠁥󠁮󠁧󠁿';
  if (tla === 'SCO') return '🏴󠁧󠁢󠁳󠁣󠁴󠁿';
  if (tla === 'WAL') return '🏴󠁧󠁢󠁷󠁬󠁳󠁿';
  const iso2 = tla ? TLA_TO_ISO2[tla] : undefined;
  if (!iso2) return '⚽';
  return String.fromCodePoint(
    0x1f1e6 + iso2.charCodeAt(0) - 65,
    0x1f1e6 + iso2.charCodeAt(1) - 65
  );
}

/**
 * Live production implementation of the data contract, backed by the
 * football-data.org v4 API (free tier). Selected automatically in
 * app.config.ts once FOOTBALL_DATA_TOKEN is set.
 *
 * The free tier exposes match snapshots, not an event feed, so
 * getLiveUpdates() derives kickoff/goal/full-time events by diffing
 * consecutive polls — the same shape the mock engine emits.
 */
@Injectable()
export class FootballDataService extends IWorldCupDataService implements OnDestroy {
  private readonly matches$ = new BehaviorSubject<Match[]>([]);
  private readonly teams$ = new BehaviorSubject<Team[]>([]);
  private readonly favorites$ = new BehaviorSubject<string[]>(readFavorites());
  private readonly events$ = new Subject<MatchEvent>();
  private readonly poller: Subscription;
  private previous = new Map<string, Match>();

  constructor() {
    super();
    this.loadTeams();
    this.poller = timer(0, POLL_MS).subscribe(() => this.refreshMatches());
  }

  ngOnDestroy(): void {
    this.poller.unsubscribe();
  }

  getTeams(): Observable<Team[]> {
    return this.teams$.asObservable();
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

  private async get(path: string): Promise<any | null> {
    const target = `${API_BASE}${path}`;
    const url = FOOTBALL_DATA_PROXY
      ? `${FOOTBALL_DATA_PROXY}${encodeURIComponent(target)}`
      : target;
    try {
      const res = await CapacitorHttp.get({
        url,
        headers: { 'X-Auth-Token': FOOTBALL_DATA_TOKEN },
      });
      return res.status >= 200 && res.status < 300 ? res.data : null;
    } catch {
      return null; // transient network failure: keep showing last snapshot
    }
  }

  private async loadTeams(): Promise<void> {
    const data = await this.get('/teams');
    if (!data?.teams) {
      return;
    }
    const teams: Team[] = data.teams.map((t: ApiTeam & { group?: string }) => ({
      id: String(t.id),
      name: t.name ?? 'TBD',
      code: t.tla ?? '???',
      flag: flagFor(t.tla),
      group: (t.group ?? '').replace('GROUP_', '') || '?',
    }));
    this.teams$.next(teams);
  }

  private async refreshMatches(): Promise<void> {
    const data = await this.get('/matches');
    if (!data?.matches) {
      return;
    }
    const mapped: Match[] = data.matches.map((m: ApiMatch) => this.toMatch(m));
    this.emitDiffEvents(mapped, data.matches);
    this.previous = new Map(mapped.map((m) => [m.id, m]));
    this.matches$.next(mapped);
  }

  private toMatch(m: ApiMatch): Match {
    const status =
      m.status === 'IN_PLAY' || m.status === 'PAUSED' || m.status === 'SUSPENDED'
        ? 'live'
        : m.status === 'FINISHED' || m.status === 'AWARDED'
          ? 'finished'
          : 'upcoming';
    const elapsedMin = Math.floor((Date.now() - Date.parse(m.utcDate)) / 60_000);
    return {
      id: String(m.id),
      stage: STAGE_MAP[m.stage] ?? 'group',
      group: m.group ? m.group.replace('GROUP_', '').replace('Group ', '') : undefined,
      homeTeamId: m.homeTeam?.name ? String(m.homeTeam.id) : null,
      awayTeamId: m.awayTeam?.name ? String(m.awayTeam.id) : null,
      homePlaceholder: m.homeTeam?.name ? undefined : 'TBD',
      awayPlaceholder: m.awayTeam?.name ? undefined : 'TBD',
      kickoffUtc: m.utcDate,
      status,
      homeScore: m.score?.fullTime?.home ?? 0,
      awayScore: m.score?.fullTime?.away ?? 0,
      minute:
        status === 'live'
          ? typeof m.minute === 'number'
            ? m.minute
            : Math.min(Math.max(elapsedMin, 1), 120)
          : status === 'finished'
            ? 90
            : 0,
      venue: m.venue ?? 'Venue TBC',
      city: '',
    };
  }

  /** Kickoffs, goals and final whistles, derived from snapshot deltas. */
  private emitDiffEvents(current: Match[], raw: ApiMatch[]): void {
    if (this.previous.size === 0) {
      return; // first snapshot: nothing to compare against
    }
    const namesById = new Map<string, string>();
    for (const r of raw) {
      if (r.homeTeam?.name) namesById.set(String(r.homeTeam.id), r.homeTeam.name);
      if (r.awayTeam?.name) namesById.set(String(r.awayTeam.id), r.awayTeam.name);
    }
    const name = (id: string | null) => (id && namesById.get(id)) || 'TBD';

    for (const m of current) {
      const prev = this.previous.get(m.id);
      if (!prev) {
        continue;
      }
      const scoreline = `${name(m.homeTeamId)} ${m.homeScore}–${m.awayScore} ${name(m.awayTeamId)}`;
      if (prev.status === 'upcoming' && m.status === 'live') {
        this.events$.next({
          matchId: m.id, minute: 0, type: 'kickoff',
          description: `Kick-off! ${name(m.homeTeamId)} vs ${name(m.awayTeamId)}`,
        });
      }
      if (m.homeScore > prev.homeScore) {
        this.events$.next({
          matchId: m.id, minute: m.minute, type: 'goal', teamId: m.homeTeamId ?? undefined,
          description: `GOAL! ${name(m.homeTeamId)} score — ${scoreline}`,
        });
      }
      if (m.awayScore > prev.awayScore) {
        this.events$.next({
          matchId: m.id, minute: m.minute, type: 'goal', teamId: m.awayTeamId ?? undefined,
          description: `GOAL! ${name(m.awayTeamId)} score — ${scoreline}`,
        });
      }
      if (prev.status === 'live' && m.status === 'finished') {
        this.events$.next({
          matchId: m.id, minute: m.minute, type: 'fulltime',
          description: `Full-time: ${scoreline}`,
        });
      }
    }
  }
}
