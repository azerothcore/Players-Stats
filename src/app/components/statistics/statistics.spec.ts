import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { ActivatedRoute, convertToParamMap, ParamMap } from '@angular/router';
import { BehaviorSubject, of } from 'rxjs';
import { Statistics } from './statistics';
import { PveApiService } from '../../services/pve-api.service';
import { Achievement, AchievementCategory, AchievementProgress } from '../../models/achievement';

const mockCategory: AchievementCategory = { ID: 130, Name: 'Character', ParentID: -1 };

const mockAchievements: Achievement[] = [
  { ID: 1, Name: 'Deaths', Description: 'Total deaths', Points: 0, icon: 'skull', Quantity: 0, category: 130 },
  { ID: 2, Name: 'Quests Completed', Description: 'Total quests', Points: 0, icon: 'quest', Quantity: 100, category: 130 },
  { ID: 3, Name: 'No Progress', Description: 'Nothing yet', Points: 0, icon: 'NULL', Quantity: 0, category: 130 },
];

const mockProgress: AchievementProgress[] = [
  { achievement: 1, counter: 42 },
  { achievement: 2, counter: 75 },
];

const mockMoneyAchievements: Achievement[] = [
  { ID: 328, Name: 'Total gold acquired', Description: 'Gold earned', Points: 0, icon: 'gold', Quantity: 0, category: 140 },
  { ID: 329, Name: 'Filtered out 1', Description: '', Points: 0, icon: '', Quantity: 0, category: 140 },
  { ID: 330, Name: 'Filtered out 2', Description: '', Points: 0, icon: '', Quantity: 0, category: 140 },
];

const mockMoneyProgress: AchievementProgress[] = [
  { achievement: 328, counter: 1234567 },
];

describe('Statistics', () => {
  let component: Statistics;
  let mockApi: Record<string, ReturnType<typeof vi.fn>>;
  let paramMapSubject: BehaviorSubject<ParamMap>;

  beforeEach(async () => {
    mockApi = {
      getAchievementCategory: vi.fn().mockReturnValue(of(mockCategory)),
      getAchievementProgress: vi.fn().mockReturnValue(of(mockProgress)),
      getAchievementsByCategory: vi.fn().mockReturnValue(of(mockAchievements)),
    };

    paramMapSubject = new BehaviorSubject<ParamMap>(convertToParamMap({ statsId: '130' }));

    await TestBed.configureTestingModule({
      imports: [Statistics],
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

    const fixture = TestBed.createComponent(Statistics);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('ngOnInit', () => {
    it('should load category, progress, and achievements', () => {
      component.ngOnInit();

      expect(mockApi['getAchievementCategory']).toHaveBeenCalledWith(130);
      expect(mockApi['getAchievementProgress']).toHaveBeenCalledWith(1, 130);
      expect(mockApi['getAchievementsByCategory']).toHaveBeenCalledWith(130);
      expect(component.category()).toEqual(mockCategory);
    });

    it('should build stat views from achievements and progress', () => {
      component.ngOnInit();

      const stats = component.stats();
      expect(stats.length).toBe(3);
    });

    it('should mark stats with progress as completed', () => {
      component.ngOnInit();

      const deaths = component.stats().find((s) => s.id === 1)!;
      expect(deaths.completed).toBe(true);
      expect(deaths.counter).toBe('42');
    });

    it('should mark stats without progress as not completed', () => {
      component.ngOnInit();

      const noProgress = component.stats().find((s) => s.id === 3)!;
      expect(noProgress.completed).toBe(false);
      expect(noProgress.counter).toBe('-');
    });

    it('should replace NULL icon with default', () => {
      component.ngOnInit();

      const noProgress = component.stats().find((s) => s.id === 3)!;
      expect(noProgress.icon).toBe('trade_engineering');
    });

    it('should calculate progress percentage for achievements with quantity > 1', () => {
      component.ngOnInit();

      const quests = component.stats().find((s) => s.id === 2)!;
      expect(quests.hasProgress).toBe(true);
      expect(quests.progressPercent).toBe(75);
      expect(quests.counterNum).toBe(75);
      expect(quests.quantity).toBe(100);
    });

    it('should not show progress bar for achievements with quantity <= 1', () => {
      component.ngOnInit();

      const deaths = component.stats().find((s) => s.id === 1)!;
      expect(deaths.hasProgress).toBe(false);
    });

    it('should cap progress at 100%', () => {
      mockApi['getAchievementProgress'].mockReturnValue(
        of([{ achievement: 2, counter: 200 }]),
      );

      component.ngOnInit();

      const quests = component.stats().find((s) => s.id === 2)!;
      expect(quests.progressPercent).toBe(100);
    });
  });

  describe('money formatting (statsId 140)', () => {
    beforeEach(() => {
      mockApi['getAchievementCategory'].mockReturnValue(of({ ID: 140, Name: 'Wealth', ParentID: -1 }));
      mockApi['getAchievementProgress'].mockReturnValue(of(mockMoneyProgress));
      mockApi['getAchievementsByCategory'].mockReturnValue(of(mockMoneyAchievements));
      paramMapSubject.next(convertToParamMap({ statsId: '140' }));
    });

    it('should filter out achievement IDs 329 and 330 for money category', () => {
      component.ngOnInit();

      const stats = component.stats();
      expect(stats.length).toBe(1);
      expect(stats[0].id).toBe(328);
    });

    it('should produce counterHtml for money stats', () => {
      component.ngOnInit();

      const gold = component.stats().find((s) => s.id === 328)!;
      expect(gold.counterHtml).not.toBeNull();
    });
  });

  describe('route param changes', () => {
    it('should reload data when route params change', () => {
      component.ngOnInit();
      expect(mockApi['getAchievementCategory']).toHaveBeenCalledWith(130);

      paramMapSubject.next(convertToParamMap({ statsId: '131' }));
      expect(mockApi['getAchievementCategory']).toHaveBeenCalledWith(131);
    });
  });
});
