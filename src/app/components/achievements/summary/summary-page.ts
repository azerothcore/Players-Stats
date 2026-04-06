import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { PlayerContextService } from '../../../services/player-context.service';
import { AchievementSummary } from './summary';

@Component({
  selector: 'app-summary-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [AchievementSummary],
  template: `
    <app-achievement-summary
      [allAchievements]="playerContext.allAchievements()"
      [characterAchievements]="playerContext.characterAchievements()"
      [categories]="playerContext.categories()"
    />
  `,
})
export class SummaryPage {
  readonly playerContext = inject(PlayerContextService);
}
