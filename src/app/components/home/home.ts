import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  OnInit,
  signal,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { CharacterRank, getFaction } from '../../models/character';
import { PveApiService } from '../../services/pve-api.service';

@Component({
  selector: 'app-home',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [FormsModule],
  templateUrl: './home.html',
  styleUrl: './home.css',
})
export class Home implements OnInit {
  private readonly api = inject(PveApiService);
  private readonly router = inject(Router);

  private readonly pageSize = 10;

  readonly ranks = signal<CharacterRank[]>([]);
  readonly searchQuery = signal('');
  readonly currentPage = signal(1);
  readonly totalItems = signal(0);

  readonly totalPages = computed(() => Math.ceil(this.totalItems() / this.pageSize));
  readonly rankOffset = computed(() => (this.currentPage() - 1) * this.pageSize);

  readonly visiblePages = computed(() => {
    const total = this.totalPages();
    const current = this.currentPage();
    const pages: number[] = [];
    const start = Math.max(1, current - 2);
    const end = Math.min(total, current + 2);
    for (let i = start; i <= end; i++) {
      pages.push(i);
    }
    return pages;
  });

  readonly filteredRanks = computed(() => {
    const query = this.searchQuery().toLowerCase();
    const allRanks = this.ranks();
    if (!query) return allRanks;
    return allRanks.filter((r) => r.name.toLowerCase().includes(query));
  });

  ngOnInit(): void {
    this.loadPage(1);
  }

  goToPage(page: number): void {
    if (page < 1 || page > this.totalPages()) return;
    this.loadPage(page);
  }

  private loadPage(page: number): void {
    this.api.getCharacterAchievements(page, this.pageSize).subscribe((res) => {
      const ranked = res.data.map((r) => ({
        ...r,
        faction: getFaction(r.race),
      }));
      this.ranks.set(ranked);
      this.currentPage.set(res.page);
      this.totalItems.set(res.total);
    });
  }

  showPlayerStats(guid: number): void {
    this.router.navigate(['/player', guid]);
  }
}
