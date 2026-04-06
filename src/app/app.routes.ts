import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () => import('./components/home/home').then((m) => m.Home),
  },
  {
    path: 'player/:id',
    loadComponent: () => import('./components/player/player').then((m) => m.Player),
    children: [
      {
        path: 'summary',
        loadComponent: () =>
          import('./components/achievements/summary/summary-page').then((m) => m.SummaryPage),
      },
      {
        path: 'ach/:catId',
        loadComponent: () =>
          import('./components/achievements/achievements').then((m) => m.Achievements),
      },
      {
        path: 'stats/:statsId',
        loadComponent: () =>
          import('./components/statistics/statistics').then((m) => m.Statistics),
      },
    ],
  },
  {
    path: '**',
    redirectTo: '',
  },
];
