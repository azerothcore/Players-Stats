import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  OnDestroy,
  OnInit,
  signal,
} from '@angular/core';
import { ActivatedRoute, Router, RouterOutlet } from '@angular/router';
import { forkJoin } from 'rxjs';
import { getFaction } from '../../models/character';
import { AchievementCategory, STATS_CATEGORY_IDS } from '../../models/achievement';
import { PveApiService } from '../../services/pve-api.service';
import { PlayerContextService } from '../../services/player-context.service';
import { CategoryNav, CategoryNode } from './category-nav/category-nav';

@Component({
  selector: 'app-player',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterOutlet, CategoryNav],
  templateUrl: './player.html',
  styleUrl: './player.css',
})
export class Player implements OnInit, OnDestroy {
  private readonly api = inject(PveApiService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly playerContext = inject(PlayerContextService);

  readonly character = this.playerContext.character;
  readonly faction = this.playerContext.faction;
  readonly categoryTree = signal<CategoryNode[]>([]);
  readonly currentCategoryId = signal<number | null>(null);
  readonly sidebarOpen = signal(false);

  readonly characterId = computed(() => {
    const char = this.character();
    return char?.guid ?? 0;
  });

  ngOnInit(): void {
    const id = Number(this.route.snapshot.paramMap.get('id'));

    forkJoin({
      character: this.api.getCharacter(id),
      categories: this.api.getAchievementCategories(),
      charAchs: this.api.getAllCharacterAchievements(id),
      allAchs: this.api.getAllAchievements('alliance'),
    }).subscribe(({ character, categories, charAchs, allAchs }) => {
      const faction = getFaction(character.race);
      this.character.set(character);
      this.faction.set(faction);
      const summaryNode: CategoryNode = { id: -100, name: 'Summary', children: [] };
      this.categoryTree.set([summaryNode, ...this.buildCategoryTree(categories)]);

      // Store data in context for summary
      this.playerContext.allAchievements.set(allAchs);
      this.playerContext.characterAchievements.set(charAchs);
      this.playerContext.categories.set(categories);

      // Compute total achievement points
      const earnedSet = new Set(charAchs.map((a) => a.achievement));
      const totalPoints = allAchs
        .filter((a) => earnedSet.has(a.ID))
        .reduce((sum, a) => sum + a.Points, 0);
      this.playerContext.achievementPoints.set(totalPoints);

      // Auto-navigate to Summary
      this.selectCategory(-100);
    });
  }

  private buildCategoryTree(categories: AchievementCategory[]): CategoryNode[] {
    const parents = categories.filter((c) => c.ParentID === -1);
    return parents.map((parent) => ({
      id: parent.ID,
      name: parent.Name,
      children: categories
        .filter((c) => c.ParentID === parent.ID)
        .map((child) => ({
          id: child.ID,
          name: child.Name,
          children: categories
            .filter((c) => c.ParentID === child.ID)
            .map((sub) => ({
              id: sub.ID,
              name: sub.Name,
              children: [],
            })),
        })),
    }));
  }

  onCategorySelected(catId: number): void {
    this.selectCategory(catId);
  }

  selectCategory(catId: number): void {
    this.currentCategoryId.set(catId);
    this.sidebarOpen.set(false);

    const characterId = this.character()?.guid;
    if (!characterId) return;

    if (catId === -100) {
      this.router.navigate(['summary'], { relativeTo: this.route });
    } else if (STATS_CATEGORY_IDS.has(catId)) {
      this.router.navigate(['stats', catId], { relativeTo: this.route });
    } else {
      this.router.navigate(['ach', catId], { relativeTo: this.route });
    }
  }

  ngOnDestroy(): void {
    this.playerContext.character.set(null);
    this.playerContext.faction.set('alliance');
    this.playerContext.achievementPoints.set(0);
    this.playerContext.allAchievements.set([]);
    this.playerContext.characterAchievements.set([]);
    this.playerContext.categories.set([]);
  }

  toggleSidebar(): void {
    this.sidebarOpen.update((v) => !v);
  }
}
