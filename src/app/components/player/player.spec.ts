import { TestBed } from '@angular/core/testing';
import { provideRouter, Router } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { ActivatedRoute } from '@angular/router';
import { of } from 'rxjs';
import { Player } from './player';
import { PveApiService } from '../../services/pve-api.service';
import { AchievementCategory } from '../../models/achievement';
import { Character } from '../../models/character';

const mockCharacter: Character = {
  guid: 1,
  name: 'TestChar',
  race: 1,
  class: 1,
  level: 80,
  gender: 0,
  guildName: 'TestGuild',
};

const mockCategories: AchievementCategory[] = [
  { ID: 92, Name: 'General', ParentID: -1 },
  { ID: 96, Name: 'Quests', ParentID: -1 },
  { ID: 97, Name: 'Eastern Kingdoms', ParentID: 96 },
  { ID: 98, Name: 'Kalimdor', ParentID: 96 },
  { ID: 130, Name: 'Statistics', ParentID: -1 },
  { ID: 131, Name: 'Character', ParentID: 130 },
  { ID: 21, Name: 'Kills', ParentID: 131 },
];

describe('Player', () => {
  let component: Player;
  let mockApi: Record<string, ReturnType<typeof vi.fn>>;
  let router: Router;

  beforeEach(async () => {
    mockApi = {
      getCharacter: vi.fn().mockReturnValue(of(mockCharacter)),
      getAchievementCategories: vi.fn().mockReturnValue(of(mockCategories)),
    };

    await TestBed.configureTestingModule({
      imports: [Player],
      providers: [
        provideRouter([]),
        provideHttpClient(),
        provideHttpClientTesting(),
        { provide: PveApiService, useValue: mockApi },
        {
          provide: ActivatedRoute,
          useValue: {
            snapshot: { paramMap: { get: () => '1' } },
          },
        },
      ],
    }).compileComponents();

    const fixture = TestBed.createComponent(Player);
    component = fixture.componentInstance;
    router = TestBed.inject(Router);
    vi.spyOn(router, 'navigate').mockReturnValue(Promise.resolve(true));
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('ngOnInit', () => {
    it('should load character and categories on init', () => {
      component.ngOnInit();

      expect(mockApi['getCharacter']).toHaveBeenCalledWith(1);
      expect(mockApi['getAchievementCategories']).toHaveBeenCalled();
      expect(component.character()).toEqual(mockCharacter);
      expect(component.faction()).toBe('alliance');
    });

    it('should build category tree from flat categories', () => {
      component.ngOnInit();

      const tree = component.categoryTree();
      expect(tree.length).toBe(3);

      const general = tree.find((n) => n.id === 92)!;
      expect(general.children.length).toBe(0);

      const quests = tree.find((n) => n.id === 96)!;
      expect(quests.children.length).toBe(2);
      expect(quests.children[0].name).toBe('Eastern Kingdoms');
      expect(quests.children[1].name).toBe('Kalimdor');
    });

    it('should build three-level nesting', () => {
      component.ngOnInit();

      const tree = component.categoryTree();
      const stats = tree.find((n) => n.id === 130)!;
      expect(stats.children.length).toBe(1);
      expect(stats.children[0].name).toBe('Character');
      expect(stats.children[0].children.length).toBe(1);
      expect(stats.children[0].children[0].name).toBe('Kills');
    });

    it('should auto-navigate to category 92', () => {
      component.ngOnInit();

      expect(component.currentCategoryId()).toBe(92);
      expect(router.navigate).toHaveBeenCalled();
    });
  });

  describe('selectCategory', () => {
    beforeEach(() => {
      component.ngOnInit();
    });

    it('should navigate to ach route for non-stats category', () => {
      component.selectCategory(92);

      expect(component.currentCategoryId()).toBe(92);
      expect(router.navigate).toHaveBeenCalledWith(['ach', 92], expect.any(Object));
    });

    it('should navigate to stats route for stats category', () => {
      component.selectCategory(130);

      expect(router.navigate).toHaveBeenCalledWith(['stats', 130], expect.any(Object));
    });

    it('should close sidebar', () => {
      component.sidebarOpen.set(true);
      component.selectCategory(92);

      expect(component.sidebarOpen()).toBe(false);
    });
  });

  describe('onCategorySelected', () => {
    beforeEach(() => {
      component.ngOnInit();
    });

    it('should delegate to selectCategory', () => {
      component.onCategorySelected(96);

      expect(component.currentCategoryId()).toBe(96);
      expect(router.navigate).toHaveBeenCalledWith(['ach', 96], expect.any(Object));
    });
  });

  describe('toggleSidebar', () => {
    it('should toggle sidebar state', () => {
      expect(component.sidebarOpen()).toBe(false);
      component.toggleSidebar();
      expect(component.sidebarOpen()).toBe(true);
      component.toggleSidebar();
      expect(component.sidebarOpen()).toBe(false);
    });
  });

  describe('characterId', () => {
    it('should return 0 when no character is loaded', () => {
      expect(component.characterId()).toBe(0);
    });

    it('should return character guid when loaded', () => {
      component.ngOnInit();
      expect(component.characterId()).toBe(1);
    });
  });
});
