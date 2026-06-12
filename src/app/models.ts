export type Stage = 'group' | 'r32' | 'r16' | 'qf' | 'sf' | 'third' | 'final';

export type MatchStatus = 'upcoming' | 'live' | 'finished';

export interface Team {
  /** Stable id, lowercase FIFA trigram (e.g. 'mex'). */
  id: string;
  name: string;
  /** FIFA trigram for compact display (e.g. 'MEX'). */
  code: string;
  /** Emoji flag — renders natively everywhere, no asset pipeline needed. */
  flag: string;
  /** Group letter A–L. */
  group: string;
}

export interface Match {
  id: string;
  stage: Stage;
  group?: string;
  /** null until the knockout slot is decided. */
  homeTeamId: string | null;
  awayTeamId: string | null;
  /** Shown when the team id is null, e.g. 'Winner Group A'. */
  homePlaceholder?: string;
  awayPlaceholder?: string;
  /** Fixed ISO 8601 UTC string — the client localizes it for display. */
  kickoffUtc: string;
  status: MatchStatus;
  homeScore: number;
  awayScore: number;
  /** Elapsed match minute while live. */
  minute: number;
  venue: string;
  city: string;
}

export interface MatchEvent {
  matchId: string;
  minute: number;
  type: 'kickoff' | 'goal' | 'fulltime';
  teamId?: string;
  description: string;
}

export const STAGE_LABELS: Record<Stage, string> = {
  group: 'Group Stage',
  r32: 'Round of 32',
  r16: 'Round of 16',
  qf: 'Quarter-final',
  sf: 'Semi-final',
  third: 'Third Place',
  final: 'Final',
};
