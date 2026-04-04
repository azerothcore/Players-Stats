import { ChangeDetectionStrategy, Component, computed, inject, OnInit, signal } from '@angular/core';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CharacterRank, getFaction } from '../../models/character';
import { PveApiService } from '../../services/pve-api.service';

@Component({
  selector: 'app-home',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [FormsModule],
  template: `
    <div class="mx-auto max-w-5xl px-4 py-6">
      <div class="mb-4">
        <label for="search" class="sr-only">Search characters</label>
        <input
          id="search"
          type="text"
          placeholder="Search character..."
          [ngModel]="searchQuery()"
          (ngModelChange)="searchQuery.set($event)"
          class="w-full rounded border border-wow-gold/30 bg-wow-dark-brown px-4 py-2 text-white placeholder-gray-400 focus:border-wow-gold focus:outline-none"
          aria-label="Search characters by name"
        />
      </div>

      <div class="overflow-x-auto rounded-lg border border-gray-700" role="region" aria-label="Character rankings">
        <table class="w-full text-left" aria-label="Character rankings table">
          <thead>
            <tr class="border-b border-gray-700 bg-wow-dark-brown text-wow-gold">
              <th scope="col" class="px-4 py-3 font-semibold">#</th>
              <th scope="col" class="px-4 py-3 font-semibold">Character</th>
              <th scope="col" class="px-4 py-3 font-semibold text-center">
                <span class="sr-only">Race and Class</span>
                <span aria-hidden="true">&#9679;</span>
              </th>
              <th scope="col" class="px-4 py-3 font-semibold text-center">Lvl</th>
              <th scope="col" class="px-4 py-3 font-semibold text-right">Points</th>
            </tr>
          </thead>
          <tbody>
            @for (rank of filteredRanks(); track rank.guid; let i = $index) {
              <tr
                class="cursor-pointer border-b border-gray-800 transition-colors hover:bg-gray-800/50"
                [class.bg-gray-900]="i % 2 === 0"
                [class.bg-gray-900/50]="i % 2 !== 0"
                (click)="showPlayerStats(rank.guid)"
                (keydown.enter)="showPlayerStats(rank.guid)"
                tabindex="0"
                [attr.aria-label]="'Rank ' + (i + 1) + ': ' + rank.name + ', ' + rank.achievement_points + ' points'"
                role="link"
              >
                <td class="px-4 py-3 text-gray-400">{{ i + 1 }}</td>
                <td class="px-4 py-3 font-bold" [class]="rank.faction">{{ rank.name }}</td>
                <td class="px-4 py-3 text-center">
                  <img
                    [src]="'/img/race/18/' + rank.race + '-' + rank.gender + '.gif'"
                    [alt]="'Race ' + rank.race"
                    width="18"
                    height="18"
                    class="inline-block"
                  />
                  <img
                    [src]="'/img/class/18/' + rank.class + '.gif'"
                    [alt]="'Class ' + rank.class"
                    width="18"
                    height="18"
                    class="inline-block"
                  />
                </td>
                <td class="px-4 py-3 text-center">{{ rank.level }}</td>
                <td class="px-4 py-3 text-right font-bold text-wow-gold">{{ rank.achievement_points }}</td>
              </tr>
            }
          </tbody>
        </table>
      </div>
    </div>
  `,
})
export class Home implements OnInit {
  private readonly api = inject(PveApiService);
  private readonly router = inject(Router);

  readonly ranks = signal<CharacterRank[]>([]);
  readonly searchQuery = signal('');

  readonly filteredRanks = computed(() => {
    const query = this.searchQuery().toLowerCase();
    const allRanks = this.ranks();
    if (!query) return allRanks;
    return allRanks.filter((r) => r.name.toLowerCase().includes(query));
  });

  ngOnInit(): void {
    this.api.getCharacterAchievements().subscribe((data) => {
      const ranked = data.map((r) => ({
        ...r,
        faction: getFaction(r.race),
      }));
      this.ranks.set(ranked);
    });
  }

  showPlayerStats(guid: number): void {
    this.router.navigate(['/player', guid]);
  }
}
