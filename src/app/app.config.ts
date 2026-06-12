import { ApplicationConfig, provideZoneChangeDetection } from '@angular/core';
import { RouteReuseStrategy, provideRouter, withHashLocation } from '@angular/router';
import { IonicRouteStrategy, provideIonicAngular } from '@ionic/angular/standalone';

import { routes } from './app.routes';
import { WORLD_CUP_SERVICE } from './services/world-cup.contract';
import { MockWorldCupService } from './services/mock-world-cup.service';
import { FootballDataService } from './services/football-data.service';
import { FOOTBALL_DATA_TOKEN } from './services/api-config';

export const appConfig: ApplicationConfig = {
  providers: [
    provideZoneChangeDetection({ eventCoalescing: true }),
    { provide: RouteReuseStrategy, useClass: IonicRouteStrategy },
    provideIonicAngular({ mode: 'md' }),
    // Hash-based URLs (/#/matches) work on any static host (GitHub Pages)
    // and inside the Capacitor webview without server rewrites.
    provideRouter(routes, withHashLocation()),

    // The data-layer swap: paste a token into services/api-config.ts and
    // the live football-data.org adapter takes over; otherwise the mock
    // simulation engine runs.
    {
      provide: WORLD_CUP_SERVICE,
      useClass: FOOTBALL_DATA_TOKEN ? FootballDataService : MockWorldCupService,
    },
  ],
};
