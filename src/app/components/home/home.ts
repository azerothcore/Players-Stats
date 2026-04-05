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
  styleUrl: './home.css',
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
          class="w-full rounded border-2 border-[#333] bg-[#222] px-4 py-2 font-bold text-[#555] placeholder-[#555] transition-colors duration-300 focus:border-[#999] focus:bg-white focus:text-[#111] focus:outline-none"
          aria-label="Search characters by name"
        />
      </div>

      <div
        class="overflow-x-auto rounded-lg border border-[#333]"
        role="region"
        aria-label="Character rankings"
      >
        <table class="w-full text-left" aria-label="Character rankings table">
          <thead>
            <tr class="bg-[#ffffff22]">
              <th scope="col" class="px-4 py-3 font-semibold text-white">#</th>
              <th scope="col" class="px-4 py-3 font-semibold text-white">Character</th>
              <th scope="col" class="px-4 py-3 font-semibold text-center text-white">
                Lvl
              </th>
              <th scope="col" class="px-4 py-3 font-semibold text-right text-white">
                Points
              </th>
            </tr>
          </thead>
          <tbody>
            @for (rank of filteredRanks(); track rank.guid; let i = $index) {
              <tr
                class="rank-row"
                [class.row-odd]="i % 2 === 0"
                [class.row-even]="i % 2 !== 0"
                (click)="showPlayerStats(rank.guid)"
                (keydown.enter)="showPlayerStats(rank.guid)"
                tabindex="0"
                [attr.aria-label]="
                  'Rank ' + (i + 1) + ': ' + rank.name + ', ' + rank.achievement_points + ' points'
                "
                role="link"
              >
                <td class="px-4 py-3 text-gray-500">{{ i + 1 }}</td>
                <td class="px-4 py-3 font-bold" [class]="rank.faction">
                  <img
                    [src]="'/img/race/64/' + rank.race + '-' + rank.gender + '.png'"
                    [alt]="'Race ' + rank.race"
                    width="32"
                    height="32"
                    class="inline-block"
                  />
                  <img
                    [src]="'/img/class/64/' + rank.class + '.png'"
                    [alt]="'Class ' + rank.class"
                    width="32"
                    height="32"
                    class="inline-block"
                  />
                  {{ rank.name }}
                </td>
                <td class="px-4 py-3 text-center">{{ rank.level }}</td>
                <td class="px-4 py-3 text-right font-bold text-wow-gold">
                  {{ rank.achievement_points }}
                </td>
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
