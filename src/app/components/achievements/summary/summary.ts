import {
  ChangeDetectionStrategy,
  Component,
  computed,
  input,
} from '@angular/core';
import { DatePipe } from '@angular/common';
import { Achievement, AchievementCategory, CharacterAchievement } from '../../../models/achievement';

export interface RecentAchievement {
  id: number;
  name: string;
  description: string;
  icon: string;
  points: number;
  date: Date;
}

export interface CategoryProgress {
  name: string;
  earned: number;
  total: number;
  percent: number;
}

/** Category IDs matching the armory overview: General, Quests, Exploration, PvP, Dungeons & Raids, Professions, Reputation, World Events */
const OVERVIEW_CATEGORY_IDS = [92, 96, 97, 95, 168, 169, 201, 155];

@Component({
  selector: 'app-achievement-summary',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [DatePipe],
  templateUrl: './summary.html',
  styleUrl: './summary.css',
})
export class AchievementSummary {
  readonly allAchievements = input.required<Achievement[]>();
  readonly characterAchievements = input.required<CharacterAchievement[]>();
  readonly categories = input.required<AchievementCategory[]>();

  readonly recentAchievements = computed<RecentAchievement[]>(() => {
    const charAchs = this.characterAchievements();
    const allAchs = this.allAchievements();
    const achMap = new Map(allAchs.map((a) => [a.ID, a]));

    return charAchs
      .filter((ca) => achMap.has(ca.achievement))
      .sort((a, b) => b.date - a.date)
      .slice(0, 4)
      .map((ca) => {
        const ach = achMap.get(ca.achievement)!;
        return {
          id: ach.ID,
          name: ach.Name,
          description: ach.Description,
          icon: ach.icon === 'NULL' || !ach.icon ? 'trade_engineering' : ach.icon,
          points: ach.Points,
          date: new Date(ca.date * 1000),
        };
      });
  });

  readonly categoryProgress = computed<CategoryProgress[]>(() => {
    const allAchs = this.allAchievements();
    const earnedSet = new Set(this.characterAchievements().map((ca) => ca.achievement));
    const cats = this.categories();

    return OVERVIEW_CATEGORY_IDS.map((catId) => {
      const cat = cats.find((c) => c.ID === catId);
      const subCatIds = new Set(
        cats.filter((c) => c.ParentID === catId).map((c) => c.ID),
      );
      // Include achievements in this category and all its subcategories (2 levels deep)
      const deepSubIds = new Set<number>();
      for (const subId of subCatIds) {
        deepSubIds.add(subId);
        for (const c of cats) {
          if (c.ParentID === subId) {
            deepSubIds.add(c.ID);
          }
        }
      }

      const categoryAchs = allAchs.filter(
        (a) => a.category === catId || deepSubIds.has(a.category),
      );
      const earned = categoryAchs.filter((a) => earnedSet.has(a.ID)).length;
      const total = categoryAchs.length;

      return {
        name: cat?.Name ?? `Category ${catId}`,
        earned,
        total,
        percent: total > 0 ? Math.round((earned / total) * 100) : 0,
      };
    });
  });

  readonly totalProgress = computed<CategoryProgress>(() => {
    const progress = this.categoryProgress();
    const earned = progress.reduce((sum, p) => sum + p.earned, 0);
    const total = progress.reduce((sum, p) => sum + p.total, 0);
    return {
      name: 'Achievements Earned',
      earned,
      total,
      percent: total > 0 ? Math.round((earned / total) * 100) : 0,
    };
  });
}
