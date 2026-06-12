import { ApplicationConfig, provideZoneChangeDetection } from '@angular/core';
import { RouteReuseStrategy, provideRouter } from '@angular/router';
import { IonicRouteStrategy, provideIonicAngular } from '@ionic/angular/standalone';

import { routes } from './app.routes';
import { WORLD_CUP_SERVICE } from './services/world-cup.contract';
import { MockWorldCupService } from './services/mock-world-cup.service';

export const appConfig: ApplicationConfig = {
  providers: [
    provideZoneChangeDetection({ eventCoalescing: true }),
    { provide: RouteReuseStrategy, useClass: IonicRouteStrategy },
    provideIonicAngular({ mode: 'md' }),
    provideRouter(routes),

    // The single line to change when wiring a live production API:
    // swap MockWorldCupService for e.g. ApiFootballService.
    { provide: WORLD_CUP_SERVICE, useClass: MockWorldCupService },
  ],
};
