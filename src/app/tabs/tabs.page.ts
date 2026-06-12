import { Component } from '@angular/core';
import { IonIcon, IonLabel, IonTabBar, IonTabButton, IonTabs } from '@ionic/angular/standalone';

@Component({
  selector: 'app-tabs',
  imports: [IonTabs, IonTabBar, IonTabButton, IonIcon, IonLabel],
  template: `
    <ion-tabs>
      <ion-tab-bar slot="bottom">
        <ion-tab-button tab="matches">
          <ion-icon name="football"></ion-icon>
          <ion-label>Matches</ion-label>
        </ion-tab-button>
        <ion-tab-button tab="teams">
          <ion-icon name="people-circle-outline"></ion-icon>
          <ion-label>Teams</ion-label>
        </ion-tab-button>
      </ion-tab-bar>
    </ion-tabs>
  `,
  styles: [
    `
      ion-tab-bar {
        --background: rgba(8, 10, 14, 0.92);
        border-top: 1px solid rgba(198, 255, 77, 0.14);
        backdrop-filter: blur(12px);
      }
      ion-tab-button {
        --color: #6b7585;
        --color-selected: var(--wc-lime);
        font-weight: 600;
        letter-spacing: 0.02em;
      }
    `,
  ],
})
export class TabsPage {}
