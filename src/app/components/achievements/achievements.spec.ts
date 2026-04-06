import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { ActivatedRoute, convertToParamMap, ParamMap } from '@angular/router';
import { BehaviorSubject } from 'rxjs';
import { of } from 'rxjs';
import { Achievements } from './achievements';
import { PveApiService } from '../../services/pve-api.service';
import { Achievement, CharacterAchievement } from '../../models/achievement';

const mockAllAchs: Achievement[] = [
  { ID: 1, Name: 'First Kill', Description: 'Kill a mob', Points: 10, icon: 'sword', Quantity: 0 },
  { ID: 2, Name: 'Explorer', Description: 'Explore a zone', Points: 10, icon: 'map', Quantity: 0 },
  { ID: 3, Name: 'Rich', Description: 'Earn 100g', Points: 5, icon: 'NULL', Quantity: 0 },
];

const mockCharAchs: CharacterAchievement[] = [
  { achievement: 1, date: 1700000000 },
];

describe('Achievements', () => {
  let component: Achievements;
  let mockApi: Record<string, ReturnType<typeof vi.fn>>;
  let paramMapSubject: BehaviorSubject<ParamMap>;

  beforeEach(async () => {
    mockApi = {
      getCharacterAchievementsByCategory: vi.fn().mockReturnValue(of(mockCharAchs)),
      getAchievementsByCategory: vi.fn().mockReturnValue(of(mockAllAchs)),
    };

    paramMapSubject = new BehaviorSubject<ParamMap>(convertToParamMap({ catId: '92' }));

    await TestBed.configureTestingModule({
      imports: [Achievements],
      providers: [
        provideRouter([]),
        provideHttpClient(),
        provideHttpClientTesting(),
        { provide: PveApiService, useValue: mockApi },
        {
          provide: ActivatedRoute,
          useValue: {
            paramMap: paramMapSubject.asObservable(),
            parent: { snapshot: { paramMap: { get: () => '1' } } },
          },
        },
      ],
    }).compileComponents();

    const fixture = TestBed.createComponent(Achievements);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('ngOnInit', () => {
    it('should load and merge achievements with completion status', () => {
      component.ngOnInit();

      const achs = component.achievements();
      expect(achs.length).toBe(3);
      expect(achs[0].completed).toBe(true);
      expect(achs[0].completedDate).toBeInstanceOf(Date);
      expect(achs[1].completed).toBe(false);
      expect(achs[1].completedDate).toBeNull();
    });

    it('should replace NULL icon with default', () => {
      component.ngOnInit();

      const rich = component.achievements().find((a) => a.ID === 3)!;
      expect(rich.icon).toBe('trade_engineering');
    });

    it('should keep valid icons', () => {
      component.ngOnInit();

      const first = component.achievements().find((a) => a.ID === 1)!;
      expect(first.icon).toBe('sword');
    });

    it('should react to route param changes', () => {
      component.ngOnInit();
      expect(mockApi['getAchievementsByCategory']).toHaveBeenCalledWith(92, 'alliance');

      paramMapSubject.next(convertToParamMap({ catId: '96' }));
      expect(mockApi['getAchievementsByCategory']).toHaveBeenCalledWith(96, 'alliance');
    });
  });

  describe('filter', () => {
    beforeEach(() => {
      component.ngOnInit();
    });

    it('should default to "all"', () => {
      expect(component.filter()).toBe('all');
    });

    it('should show all achievements when filter is "all"', () => {
      expect(component.filteredAchievements().length).toBe(3);
    });

    it('should show only completed achievements when filter is "complete"', () => {
      component.filter.set('complete');

      const filtered = component.filteredAchievements();
      expect(filtered.length).toBe(1);
      expect(filtered[0].ID).toBe(1);
      expect(filtered[0].completed).toBe(true);
    });

    it('should show only incomplete achievements when filter is "incomplete"', () => {
      component.filter.set('incomplete');

      const filtered = component.filteredAchievements();
      expect(filtered.length).toBe(2);
      expect(filtered.every((a) => !a.completed)).toBe(true);
    });

    it('should update reactively when filter changes', () => {
      expect(component.filteredAchievements().length).toBe(3);

      component.filter.set('complete');
      expect(component.filteredAchievements().length).toBe(1);

      component.filter.set('incomplete');
      expect(component.filteredAchievements().length).toBe(2);

      component.filter.set('all');
      expect(component.filteredAchievements().length).toBe(3);
    });
  });

  describe('filterOptions', () => {
    it('should have three options', () => {
      expect(component.filterOptions.length).toBe(3);
    });

    it('should have correct values and labels', () => {
      expect(component.filterOptions).toEqual([
        { value: 'all', label: 'All' },
        { value: 'complete', label: 'Complete' },
        { value: 'incomplete', label: 'Incomplete' },
      ]);
    });
  });
});
