import { ApplicationConfig, provideZoneChangeDetection } from '@angular/core';
import { RouteReuseStrategy, provideRouter, withHashLocation } from '@angular/router';
import { IonicRouteStrategy, provideIonicAngular } from '@ionic/angular/standalone';

import { routes } from './app.routes';
import { WORLD_CUP_SERVICE } from './services/world-cup.contract';
import { MockWorldCupService } from './services/mock-world-cup.service';
import { FootballDataService } from './services/football-data.service';
import { FOOTBALL_DATA_TOKEN, USE_HOSTED_SNAPSHOT } from './services/api-config';

export const appConfig: ApplicationConfig = {
  providers: [
    provideZoneChangeDetection({ eventCoalescing: true }),
    { provide: RouteReuseStrategy, useClass: IonicRouteStrategy },
    provideIonicAngular({ mode: 'md' }),
    // Hash-based URLs (/#/matches) work on any static host (GitHub Pages)
    // and inside the Capacitor webview without server rewrites.
    provideRouter(routes, withHashLocation()),

    // The data-layer swap: live data via direct API (token) or hosted
    // snapshots (GitHub Actions refresh); the mock simulation engine
    // otherwise. See services/api-config.ts.
    {
      provide: WORLD_CUP_SERVICE,
      useClass:
        FOOTBALL_DATA_TOKEN || USE_HOSTED_SNAPSHOT
          ? FootballDataService
          : MockWorldCupService,
    },
  ],
};
