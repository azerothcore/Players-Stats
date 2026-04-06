import {
  ChangeDetectionStrategy,
  Component,
  computed,
  DestroyRef,
  ElementRef,
  inject,
  OnInit,
  signal,
  viewChild,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ActivatedRoute } from '@angular/router';
import { forkJoin, switchMap } from 'rxjs';
import { Achievement } from '../../models/achievement';
import { Faction } from '../../models/character';
import { PveApiService } from '../../services/pve-api.service';

type AchievementFilter = 'all' | 'complete' | 'incomplete';

interface AchievementView extends Achievement {
  completed: boolean;
  completedDate: Date | null;
}

@Component({
  selector: 'app-achievements',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [],
  templateUrl: './achievements.html',
  styleUrl: './achievements.css',
})
export class Achievements implements OnInit {
  private readonly api = inject(PveApiService);
  private readonly route = inject(ActivatedRoute);
  private readonly destroyRef = inject(DestroyRef);

  private readonly listContainer = viewChild<ElementRef<HTMLElement>>('listContainer');

  readonly achievements = signal<AchievementView[]>([]);
  readonly filter = signal<AchievementFilter>('all');

  readonly filterOptions: { value: AchievementFilter; label: string }[] = [
    { value: 'all', label: 'All' },
    { value: 'complete', label: 'Complete' },
    { value: 'incomplete', label: 'Incomplete' },
  ];

  readonly filteredAchievements = computed(() => {
    const achs = this.achievements();
    const f = this.filter();
    if (f === 'complete') return achs.filter((a) => a.completed);
    if (f === 'incomplete') return achs.filter((a) => !a.completed);
    return achs;
  });

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
        const container = this.listContainer()?.nativeElement;
        if (container) {
          container.scrollTop = 0;
        }

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
