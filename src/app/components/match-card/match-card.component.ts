import { ChangeDetectionStrategy, Component, computed, input, output } from '@angular/core';
import { DatePipe } from '@angular/common';
import { IonCard, IonIcon } from '@ionic/angular/standalone';
import { Match, STAGE_LABELS, Team } from '../../models';

@Component({
  selector: 'app-match-card',
  imports: [DatePipe, IonCard, IonIcon],
  templateUrl: './match-card.component.html',
  styleUrl: './match-card.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MatchCardComponent {
  match = input.required<Match>();
  home = input<Team | null>(null);
  away = input<Team | null>(null);
  favorites = input<ReadonlySet<string>>(new Set());

  favToggle = output<string>();

  stageLabel = computed(() => {
    const m = this.match();
    return m.stage === 'group' ? `Group ${m.group}` : STAGE_LABELS[m.stage];
  });

  hasFavorite = computed(() => {
    const m = this.match();
    const favs = this.favorites();
    return (m.homeTeamId !== null && favs.has(m.homeTeamId)) ||
      (m.awayTeamId !== null && favs.has(m.awayTeamId));
  });

  onStar(event: Event, teamId: string | null): void {
    event.stopPropagation();
    if (teamId) {
      this.favToggle.emit(teamId);
    }
  }
}
