import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { takeUntilDestroyed, toSignal } from '@angular/core/rxjs-interop';
import { DatePipe } from '@angular/common';
import {
  IonBadge,
  IonContent,
  IonHeader,
  IonLabel,
  IonSegment,
  IonSegmentButton,
  IonTitle,
  IonToggle,
  IonToolbar,
  ToastController,
} from '@ionic/angular/standalone';
import { filter } from 'rxjs';
import { Match, MatchStatus, Team } from '../../models';
import { WORLD_CUP_SERVICE } from '../../services/world-cup.contract';
import { MatchCardComponent } from '../../components/match-card/match-card.component';

interface DaySection {
  /** Local-timezone day the matches fall on. */
  day: Date;
  matches: Match[];
}

@Component({
  selector: 'app-matches',
  imports: [
    DatePipe,
    IonHeader,
    IonToolbar,
    IonTitle,
    IonContent,
    IonSegment,
    IonSegmentButton,
    IonLabel,
    IonBadge,
    IonToggle,
    MatchCardComponent,
  ],
  templateUrl: './matches.page.html',
  styleUrl: './matches.page.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MatchesPage {
  private readonly data = inject(WORLD_CUP_SERVICE);
  private readonly toast = inject(ToastController);

  readonly timezoneLabel = formatTimezone();

  readonly segment = signal<MatchStatus>('live');
  readonly favoritesOnly = signal(false);

  private readonly matches = toSignal(this.data.getMatches(), { initialValue: [] as Match[] });
  private readonly teams = toSignal(this.data.getTeams(), { initialValue: [] as Team[] });
  readonly favoriteSet = toSignal(this.data.getFavorites(), { initialValue: [] as string[] });

  readonly teamsById = computed(() => new Map(this.teams().map((t) => [t.id, t])));
  readonly favorites = computed(() => new Set(this.favoriteSet()));
  readonly liveCount = computed(() => this.matches().filter((m) => m.status === 'live').length);

  readonly sections = computed<DaySection[]>(() => {
    const favs = this.favorites();
    const wanted = this.segment();
    let list = this.matches().filter((m) => m.status === wanted);

    if (this.favoritesOnly()) {
      list = list.filter(
        (m) =>
          (m.homeTeamId !== null && favs.has(m.homeTeamId)) ||
          (m.awayTeamId !== null && favs.has(m.awayTeamId))
      );
    }

    const byTime = (a: Match, b: Match) => Date.parse(a.kickoffUtc) - Date.parse(b.kickoffUtc);
    list = [...list].sort(wanted === 'finished' ? (a, b) => byTime(b, a) : byTime);

    const sections: DaySection[] = [];
    for (const match of list) {
      const day = new Date(match.kickoffUtc);
      day.setHours(0, 0, 0, 0);
      const current = sections[sections.length - 1];
      if (current && current.day.getTime() === day.getTime()) {
        current.matches.push(match);
      } else {
        sections.push({ day, matches: [match] });
      }
    }
    return sections;
  });

  constructor() {
    this.data
      .getLiveUpdates()
      .pipe(
        filter((e) => e.type === 'goal'),
        takeUntilDestroyed()
      )
      .subscribe((e) => this.presentGoalToast(e.description));
  }

  team(id: string | null): Team | null {
    return id ? (this.teamsById().get(id) ?? null) : null;
  }

  onToggleFavorite(teamId: string): void {
    this.data.toggleFavorite(teamId);
  }

  onSegmentChange(value: string | number | undefined): void {
    this.segment.set(value as MatchStatus);
  }

  private async presentGoalToast(message: string): Promise<void> {
    const toast = await this.toast.create({
      message: `⚽ ${message}`,
      duration: 2600,
      position: 'top',
      cssClass: 'goal-toast',
    });
    await toast.present();
  }
}

function formatTimezone(): string {
  const zone = Intl.DateTimeFormat().resolvedOptions().timeZone;
  const offsetMin = -new Date().getTimezoneOffset();
  const sign = offsetMin >= 0 ? '+' : '-';
  const abs = Math.abs(offsetMin);
  const h = Math.floor(abs / 60);
  const m = abs % 60;
  return `${zone} (GMT${sign}${h}${m ? ':' + String(m).padStart(2, '0') : ''})`;
}
