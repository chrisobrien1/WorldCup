import { Routes } from '@angular/router';
import { TabsPage } from './tabs/tabs.page';

export const routes: Routes = [
  {
    path: '',
    component: TabsPage,
    children: [
      {
        path: 'matches',
        loadComponent: () => import('./pages/matches/matches.page').then((m) => m.MatchesPage),
      },
      {
        path: 'teams',
        loadComponent: () => import('./pages/teams/teams.page').then((m) => m.TeamsPage),
      },
      { path: '', redirectTo: 'matches', pathMatch: 'full' },
    ],
  },
];
