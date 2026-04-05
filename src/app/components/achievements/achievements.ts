import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  inject,
  OnInit,
  signal,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ActivatedRoute } from '@angular/router';
import { forkJoin, switchMap } from 'rxjs';
import { Achievement } from '../../models/achievement';
import { Faction } from '../../models/character';
import { PveApiService } from '../../services/pve-api.service';

interface AchievementView extends Achievement {
  completed: boolean;
  completedDate: Date | null;
}

@Component({
  selector: 'app-achievements',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [],
  template: `
    <div class="achievement-container mx-auto">
      @for (ach of achievements(); track ach.ID) {
        <a
          [href]="'https://wowgaming.altervista.org/aowow/?achievement=' + ach.ID"
          target="_blank"
          rel="noopener noreferrer"
          class="achievement-link"
        >
          <div class="achievement" [class.completed]="ach.completed" role="listitem">
            <img
              class="achievement-icon"
              [src]="'https://wow.zamimg.com/images/wow/icons/large/' + ach.icon + '.jpg'"
              [alt]="ach.Name + ' icon'"
              width="50"
              height="50"
              loading="lazy"
            />
            <div class="achievement-content">
              <span class="achievement-name">{{ ach.Name }}</span>
              <span class="achievement-description">{{ ach.Description }}</span>
            </div>
            <div class="achievement-right">
              <span class="achievement-points" [class.achievement-points-0]="ach.Points === 0">{{
                ach.Points
              }}</span>
            </div>
          </div>
        </a>
      }
    </div>
  `,
  styleUrl: './achievements.css',
})
export class Achievements implements OnInit {
  private readonly api = inject(PveApiService);
  private readonly route = inject(ActivatedRoute);
  private readonly destroyRef = inject(DestroyRef);

  readonly achievements = signal<AchievementView[]>([]);

  ngOnInit(): void {
    const characterId = Number(this.route.parent?.snapshot.paramMap.get('id'));
    const faction: Faction = 'alliance';

    this.route.paramMap
      .pipe(
        switchMap((params) => {
          const catId = Number(params.get('catId'));
          return forkJoin({
            characterAchs: this.api.getCharacterAchievementsByCategory(characterId, catId),
            allAchs: this.api.getAchievementsByCategory(catId, faction),
          });
        }),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe(({ characterAchs, allAchs }) => {
        const completedMap = new Map(characterAchs.map((a) => [a.achievement, a.date]));

        const views: AchievementView[] = allAchs.map((ach) => {
          const dateTimestamp = completedMap.get(ach.ID);
          return {
            ...ach,
            icon: ach.icon === 'NULL' || !ach.icon ? 'trade_engineering' : ach.icon,
            completed: completedMap.has(ach.ID),
            completedDate: dateTimestamp ? new Date(dateTimestamp * 1000) : null,
          };
        });

        this.achievements.set(views);

        // Trigger wowgaming tooltip rescan for new achievement links
        setTimeout(() => {
          const wh = (window as unknown as Record<string, unknown>)['$WowheadPower'];
          if (wh && typeof (wh as { refreshLinks?: () => void }).refreshLinks === 'function') {
            (wh as { refreshLinks: () => void }).refreshLinks();
          }
        });
      });
  }
}
