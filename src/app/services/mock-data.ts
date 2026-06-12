import { Match, Team } from '../models';

/**
 * Illustrative tournament data for the mock engine.
 *
 * The 48-team field below is a plausible draw, not the official one — it is
 * placeholder content that the production API implementation will replace
 * wholesale near tournament time.
 *
 * The schedule is anchored relative to "now" so the demo always shows finished
 * matches, a couple of matches live this instant, and a full upcoming slate,
 * no matter when the app is opened.
 */

const T = (id: string, name: string, code: string, flag: string, group: string): Team =>
  ({ id, name, code, flag, group });

export const TEAMS: Team[] = [
  T('mex', 'Mexico', 'MEX', '🇲🇽', 'A'),
  T('den', 'Denmark', 'DEN', '🇩🇰', 'A'),
  T('kor', 'South Korea', 'KOR', '🇰🇷', 'A'),
  T('tun', 'Tunisia', 'TUN', '🇹🇳', 'A'),
  T('can', 'Canada', 'CAN', '🇨🇦', 'B'),
  T('sui', 'Switzerland', 'SUI', '🇨🇭', 'B'),
  T('ecu', 'Ecuador', 'ECU', '🇪🇨', 'B'),
  T('civ', 'Ivory Coast', 'CIV', '🇨🇮', 'B'),
  T('usa', 'United States', 'USA', '🇺🇸', 'C'),
  T('nor', 'Norway', 'NOR', '🇳🇴', 'C'),
  T('aus', 'Australia', 'AUS', '🇦🇺', 'C'),
  T('par', 'Paraguay', 'PAR', '🇵🇾', 'C'),
  T('bra', 'Brazil', 'BRA', '🇧🇷', 'D'),
  T('mar', 'Morocco', 'MAR', '🇲🇦', 'D'),
  T('sco', 'Scotland', 'SCO', '🏴󠁧󠁢󠁳󠁣󠁴󠁿', 'D'),
  T('jor', 'Jordan', 'JOR', '🇯🇴', 'D'),
  T('esp', 'Spain', 'ESP', '🇪🇸', 'E'),
  T('uru', 'Uruguay', 'URU', '🇺🇾', 'E'),
  T('ksa', 'Saudi Arabia', 'KSA', '🇸🇦', 'E'),
  T('gha', 'Ghana', 'GHA', '🇬🇭', 'E'),
  T('arg', 'Argentina', 'ARG', '🇦🇷', 'F'),
  T('col', 'Colombia', 'COL', '🇨🇴', 'F'),
  T('qat', 'Qatar', 'QAT', '🇶🇦', 'F'),
  T('hai', 'Haiti', 'HAI', '🇭🇹', 'F'),
  T('fra', 'France', 'FRA', '🇫🇷', 'G'),
  T('sen', 'Senegal', 'SEN', '🇸🇳', 'G'),
  T('aut', 'Austria', 'AUT', '🇦🇹', 'G'),
  T('pan', 'Panama', 'PAN', '🇵🇦', 'G'),
  T('eng', 'England', 'ENG', '🏴󠁧󠁢󠁥󠁮󠁧󠁿', 'H'),
  T('cro', 'Croatia', 'CRO', '🇭🇷', 'H'),
  T('alg', 'Algeria', 'ALG', '🇩🇿', 'H'),
  T('uzb', 'Uzbekistan', 'UZB', '🇺🇿', 'H'),
  T('por', 'Portugal', 'POR', '🇵🇹', 'I'),
  T('jpn', 'Japan', 'JPN', '🇯🇵', 'I'),
  T('egy', 'Egypt', 'EGY', '🇪🇬', 'I'),
  T('nzl', 'New Zealand', 'NZL', '🇳🇿', 'I'),
  T('ned', 'Netherlands', 'NED', '🇳🇱', 'J'),
  T('irn', 'Iran', 'IRN', '🇮🇷', 'J'),
  T('rsa', 'South Africa', 'RSA', '🇿🇦', 'J'),
  T('cuw', 'Curaçao', 'CUW', '🇨🇼', 'J'),
  T('bel', 'Belgium', 'BEL', '🇧🇪', 'K'),
  T('ukr', 'Ukraine', 'UKR', '🇺🇦', 'K'),
  T('cpv', 'Cape Verde', 'CPV', '🇨🇻', 'K'),
  T('jam', 'Jamaica', 'JAM', '🇯🇲', 'K'),
  T('ger', 'Germany', 'GER', '🇩🇪', 'L'),
  T('ita', 'Italy', 'ITA', '🇮🇹', 'L'),
  T('irq', 'Iraq', 'IRQ', '🇮🇶', 'L'),
  T('bol', 'Bolivia', 'BOL', '🇧🇴', 'L'),
];

/** The 16 real 2026 host venues. */
const VENUES: ReadonlyArray<{ venue: string; city: string }> = [
  { venue: 'Estadio Azteca', city: 'Mexico City' },
  { venue: 'Estadio Akron', city: 'Guadalajara' },
  { venue: 'Estadio BBVA', city: 'Monterrey' },
  { venue: 'BMO Field', city: 'Toronto' },
  { venue: 'BC Place', city: 'Vancouver' },
  { venue: 'Mercedes-Benz Stadium', city: 'Atlanta' },
  { venue: 'Gillette Stadium', city: 'Boston' },
  { venue: 'AT&T Stadium', city: 'Dallas' },
  { venue: 'NRG Stadium', city: 'Houston' },
  { venue: 'Arrowhead Stadium', city: 'Kansas City' },
  { venue: 'SoFi Stadium', city: 'Los Angeles' },
  { venue: 'Hard Rock Stadium', city: 'Miami' },
  { venue: 'MetLife Stadium', city: 'New York / NJ' },
  { venue: 'Lincoln Financial Field', city: 'Philadelphia' },
  { venue: "Levi's Stadium", city: 'San Francisco' },
  { venue: 'Lumen Field', city: 'Seattle' },
];

const HOUR = 3_600_000;
const DAY = 24 * HOUR;

/** "Now" lands on tournament day 6 (matchday 2 of the group stage). */
const TODAY_INDEX = 6;

/** Kickoff slots within a day, in hours relative to the anchor clock time. */
const GROUP_SLOTS_H = [-9, -6, -3, -1, -0.5, 2];

/** Which groups play on each of the 4 days of a matchday window. */
const DAY_GROUPS = [
  ['A', 'B', 'C'],
  ['D', 'E', 'F'],
  ['G', 'H', 'I'],
  ['J', 'K', 'L'],
];

/** Round-robin pairings (by index within the group) for matchdays 1–3. */
const ROUND_ROBIN: ReadonlyArray<ReadonlyArray<[number, number]>> = [
  [[0, 1], [2, 3]],
  [[0, 2], [1, 3]],
  [[0, 3], [1, 2]],
];

/** Deterministic PRNG so simulated past results survive reloads. */
export function mulberry32(seed: number): () => number {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export function hashId(id: string): number {
  let h = 2166136261;
  for (let i = 0; i < id.length; i++) {
    h = Math.imul(h ^ id.charCodeAt(i), 16777619);
  }
  return h >>> 0;
}

interface KnockoutSlot {
  home: string;
  away: string;
  day: number;
  slotH: number;
}

function knockoutRounds(): Array<{ stage: Match['stage']; slots: KnockoutSlot[] }> {
  // 12 group winners + 12 runners-up + 8 best third-placed teams.
  const r32Pairs: Array<[string, string]> = [
    ['Winner Group A', '3rd Place C/E/H'],
    ['Winner Group B', '3rd Place A/D/F'],
    ['Winner Group C', '3rd Place B/G/J'],
    ['Winner Group D', '3rd Place I/K/L'],
    ['Winner Group E', '3rd Place D/F/H'],
    ['Winner Group F', '3rd Place A/B/C'],
    ['Winner Group G', '3rd Place E/I/J'],
    ['Winner Group H', '3rd Place G/K/L'],
    ['Winner Group I', 'Runner-up Group A'],
    ['Winner Group J', 'Runner-up Group B'],
    ['Winner Group K', 'Runner-up Group C'],
    ['Winner Group L', 'Runner-up Group D'],
    ['Runner-up Group E', 'Runner-up Group F'],
    ['Runner-up Group G', 'Runner-up Group H'],
    ['Runner-up Group I', 'Runner-up Group J'],
    ['Runner-up Group K', 'Runner-up Group L'],
  ];
  const slot = (i: number, perDay: number, firstDay: number, hours: number[]): { day: number; slotH: number } => ({
    day: firstDay + Math.floor(i / perDay),
    slotH: hours[i % perDay],
  });

  return [
    {
      stage: 'r32',
      slots: r32Pairs.map(([home, away], i) => ({ home, away, ...slot(i, 4, 13, [-6, -3, 0, 3]) })),
    },
    {
      stage: 'r16',
      slots: Array.from({ length: 8 }, (_, i) => ({
        home: `Winner Match ${73 + i * 2}`,
        away: `Winner Match ${74 + i * 2}`,
        ...slot(i, 2, 18, [-3, 1]),
      })),
    },
    {
      stage: 'qf',
      slots: Array.from({ length: 4 }, (_, i) => ({
        home: `Winner Match ${89 + i * 2}`,
        away: `Winner Match ${90 + i * 2}`,
        ...slot(i, 2, 22, [-3, 1]),
      })),
    },
    {
      stage: 'sf',
      slots: Array.from({ length: 2 }, (_, i) => ({
        home: `Winner Match ${97 + i * 2}`,
        away: `Winner Match ${98 + i * 2}`,
        ...slot(i, 1, 26, [0]),
      })),
    },
    {
      stage: 'third',
      slots: [{ home: 'Loser Semi-final 1', away: 'Loser Semi-final 2', day: 30, slotH: 0 }],
    },
    {
      stage: 'final',
      slots: [{ home: 'Winner Semi-final 1', away: 'Winner Semi-final 2', day: 31, slotH: 0 }],
    },
  ];
}

/**
 * Builds the full 104-match schedule. Kickoffs are fixed ISO 8601 UTC strings
 * computed relative to `anchorMs` (= app launch, tournament day 6) so the
 * three segments — past / live / upcoming — are all populated immediately.
 */
export function buildSchedule(anchorMs: number): Match[] {
  // Round to a whole 5 minutes so kickoff times look like real fixtures.
  const anchor = Math.floor(anchorMs / (5 * 60_000)) * 5 * 60_000;
  const teamsByGroup = new Map<string, Team[]>();
  for (const team of TEAMS) {
    teamsByGroup.set(team.group, [...(teamsByGroup.get(team.group) ?? []), team]);
  }

  const matches: Match[] = [];
  let matchNo = 1;

  const push = (m: Omit<Match, 'id' | 'status' | 'homeScore' | 'awayScore' | 'minute'>) => {
    matches.push({ id: `m${matchNo++}`, status: 'upcoming', homeScore: 0, awayScore: 0, minute: 0, ...m });
  };

  // 72 group matches: 3 matchdays × 4 days × 3 groups × 2 fixtures.
  for (let md = 0; md < 3; md++) {
    for (let d = 0; d < 4; d++) {
      const day = md * 4 + d;
      let slotIdx = 0;
      for (const groupLetter of DAY_GROUPS[d]) {
        const squad = teamsByGroup.get(groupLetter)!;
        for (const [h, a] of ROUND_ROBIN[md]) {
          const { venue, city } = VENUES[(matchNo * 7) % VENUES.length];
          push({
            stage: 'group',
            group: groupLetter,
            homeTeamId: squad[h].id,
            awayTeamId: squad[a].id,
            kickoffUtc: new Date(anchor + (day - TODAY_INDEX) * DAY + GROUP_SLOTS_H[slotIdx++] * HOUR).toISOString(),
            venue,
            city,
          });
        }
      }
    }
  }

  // 32 knockout matches with TBD slots.
  for (const round of knockoutRounds()) {
    for (const s of round.slots) {
      const { venue, city } = VENUES[(matchNo * 7) % VENUES.length];
      push({
        stage: round.stage,
        homeTeamId: null,
        awayTeamId: null,
        homePlaceholder: s.home,
        awayPlaceholder: s.away,
        kickoffUtc: new Date(anchor + (s.day - TODAY_INDEX) * DAY + s.slotH * HOUR).toISOString(),
        venue,
        city,
      });
    }
  }

  return matches;
}
