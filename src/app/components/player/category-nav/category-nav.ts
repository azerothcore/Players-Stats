import {
  ChangeDetectionStrategy,
  Component,
  input,
  output,
  signal,
} from '@angular/core';
import { STATS_CATEGORY_IDS } from '../../../models/achievement';

export interface CategoryNode {
  id: number;
  name: string;
  children: CategoryNode[];
}

@Component({
  selector: 'app-category-nav',
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './category-nav.html',
  styleUrl: './category-nav.css',
})
export class CategoryNav {
  readonly categoryTree = input.required<CategoryNode[]>();
  readonly currentCategoryId = input<number | null>(null);

  readonly categorySelected = output<number>();

  readonly expandedParents = signal<Set<number>>(new Set());
  readonly expandedStatistics = signal<Set<number>>(new Set());

  toggleParent(parent: CategoryNode): void {
    if (parent.children.length === 0) {
      this.categorySelected.emit(parent.id);
      this.expandedParents.set(new Set());
      return;
    }

    const isExpanded = this.expandedParents().has(parent.id);
    this.expandedParents.update((set) => {
      const next = new Set(set);
      if (isExpanded) {
        next.delete(parent.id);
      } else {
        next.clear();
        next.add(parent.id);
      }
      return next;
    });

    if (!isExpanded) {
      this.categorySelected.emit(parent.id);
    }
  }

  isParentExpanded(parentId: number): boolean {
    return this.expandedParents().has(parentId);
  }

  toggleStatistic(catId: number): void {
    const isExpanded = this.expandedStatistics().has(catId);
    this.expandedStatistics.update((set) => {
      const next = new Set(set);
      if (isExpanded) {
        next.delete(catId);
      } else {
        next.add(catId);
      }
      return next;
    });

    if (!isExpanded) {
      this.categorySelected.emit(catId);
    }
  }

  isStatisticExpanded(catId: number): boolean {
    return this.expandedStatistics().has(catId);
  }

  selectCategory(catId: number): void {
    this.categorySelected.emit(catId);
  }

  isStatCategory(catId: number): boolean {
    return STATS_CATEGORY_IDS.has(catId);
  }
}
