import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import {
  IonContent,
  IonHeader,
  IonIcon,
  IonItem,
  IonLabel,
  IonList,
  IonListHeader,
  IonTitle,
  IonToolbar,
} from '@ionic/angular/standalone';
import { Team } from '../../models';
import { WORLD_CUP_SERVICE } from '../../services/world-cup.contract';

@Component({
  selector: 'app-teams',
  imports: [
    IonHeader,
    IonToolbar,
    IonTitle,
    IonContent,
    IonList,
    IonListHeader,
    IonItem,
    IonLabel,
    IonIcon,
  ],
  templateUrl: './teams.page.html',
  styleUrl: './teams.page.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TeamsPage {
  private readonly data = inject(WORLD_CUP_SERVICE);

  private readonly teams = toSignal(this.data.getTeams(), { initialValue: [] as Team[] });
  private readonly favoriteIds = toSignal(this.data.getFavorites(), { initialValue: [] as string[] });

  readonly favorites = computed(() => new Set(this.favoriteIds()));
  readonly favoriteCount = computed(() => this.favoriteIds().length);

  readonly groups = computed(() => {
    const byGroup = new Map<string, Team[]>();
    for (const team of this.teams()) {
      byGroup.set(team.group, [...(byGroup.get(team.group) ?? []), team]);
    }
    return [...byGroup.entries()]
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([letter, teams]) => ({ letter, teams }));
  });

  toggle(teamId: string): void {
    this.data.toggleFavorite(teamId);
  }
}
