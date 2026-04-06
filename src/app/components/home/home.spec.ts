import { TestBed } from '@angular/core/testing';
import { provideRouter, Router } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { of } from 'rxjs';
import { Home } from './home';
import { PveApiService } from '../../services/pve-api.service';
import { PaginatedResponse, CharacterRank } from '../../models/character';

const mockRanks: CharacterRank[] = [
  { guid: 1, name: 'Alpha', race: 1, class: 1, level: 80, achievement_points: 1000, gender: 0, faction: 'alliance' },
  { guid: 2, name: 'Bravo', race: 2, class: 2, level: 70, achievement_points: 800, gender: 1, faction: 'horde' },
  { guid: 3, name: 'Charlie', race: 4, class: 3, level: 80, achievement_points: 600, gender: 0, faction: 'alliance' },
];

const mockResponse: PaginatedResponse<CharacterRank> = {
  data: mockRanks,
  total: 30,
  page: 1,
  limit: 10,
};

describe('Home', () => {
  let component: Home;
  let mockApi: Record<string, ReturnType<typeof vi.fn>>;
  let router: Router;

  beforeEach(async () => {
    mockApi = {
      getCharacterAchievements: vi.fn().mockReturnValue(of(mockResponse)),
    };

    await TestBed.configureTestingModule({
      imports: [Home],
      providers: [
        provideRouter([]),
        provideHttpClient(),
        provideHttpClientTesting(),
        { provide: PveApiService, useValue: mockApi },
      ],
    }).compileComponents();

    const fixture = TestBed.createComponent(Home);
    component = fixture.componentInstance;
    router = TestBed.inject(Router);
    vi.spyOn(router, 'navigate').mockReturnValue(Promise.resolve(true));
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('ngOnInit', () => {
    it('should load first page of rankings', () => {
      component.ngOnInit();

      expect(mockApi['getCharacterAchievements']).toHaveBeenCalledWith(1, 10);
      expect(component.ranks().length).toBe(3);
      expect(component.currentPage()).toBe(1);
      expect(component.totalItems()).toBe(30);
    });
  });

  describe('computed signals', () => {
    beforeEach(() => {
      component.ngOnInit();
    });

    it('should compute totalPages', () => {
      expect(component.totalPages()).toBe(3); // 30 / 10
    });

    it('should compute rankOffset', () => {
      expect(component.rankOffset()).toBe(0); // (1 - 1) * 10
    });

    it('should compute visiblePages', () => {
      const pages = component.visiblePages();
      expect(pages).toEqual([1, 2, 3]);
    });
  });

  describe('filteredRanks', () => {
    beforeEach(() => {
      component.ngOnInit();
    });

    it('should return all ranks when search is empty', () => {
      expect(component.filteredRanks().length).toBe(3);
    });

    it('should filter ranks by name (case-insensitive)', () => {
      component.searchQuery.set('alpha');
      expect(component.filteredRanks().length).toBe(1);
      expect(component.filteredRanks()[0].name).toBe('Alpha');
    });

    it('should return empty when no match', () => {
      component.searchQuery.set('zzz');
      expect(component.filteredRanks().length).toBe(0);
    });

    it('should match partial names', () => {
      component.searchQuery.set('a');
      const names = component.filteredRanks().map((r) => r.name);
      expect(names).toContain('Alpha');
      expect(names).toContain('Bravo');
      expect(names).toContain('Charlie');
    });
  });

  describe('goToPage', () => {
    beforeEach(() => {
      component.ngOnInit();
    });

    it('should load the requested page', () => {
      mockApi['getCharacterAchievements'].mockReturnValue(
        of({ ...mockResponse, page: 2 }),
      );

      component.goToPage(2);
      expect(mockApi['getCharacterAchievements']).toHaveBeenCalledWith(2, 10);
      expect(component.currentPage()).toBe(2);
    });

    it('should not load page below 1', () => {
      mockApi['getCharacterAchievements'].mockClear();
      component.goToPage(0);
      expect(mockApi['getCharacterAchievements']).not.toHaveBeenCalled();
    });

    it('should not load page above totalPages', () => {
      mockApi['getCharacterAchievements'].mockClear();
      component.goToPage(4);
      expect(mockApi['getCharacterAchievements']).not.toHaveBeenCalled();
    });
  });

  describe('showPlayerStats', () => {
    it('should navigate to player route', () => {
      component.showPlayerStats(42);
      expect(router.navigate).toHaveBeenCalledWith(['/player', 42]);
    });
  });
});
