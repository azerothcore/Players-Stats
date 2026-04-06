import { TestBed } from '@angular/core/testing';
import { AchievementSummary } from './summary';
import { Achievement, AchievementCategory, CharacterAchievement } from '../../../models/achievement';

const mockCategories: AchievementCategory[] = [
  { ID: 92, Name: 'General', ParentID: -1 },
  { ID: 96, Name: 'Quests', ParentID: -1 },
  { ID: 97, Name: 'Exploration', ParentID: -1 },
  { ID: 95, Name: 'Player vs. Player', ParentID: -1 },
  { ID: 168, Name: 'Dungeons & Raids', ParentID: -1 },
  { ID: 169, Name: 'Professions', ParentID: -1 },
  { ID: 201, Name: 'Reputation', ParentID: -1 },
  { ID: 155, Name: 'World Events', ParentID: -1 },
  { ID: 200, Name: 'Sub of Quests', ParentID: 96 },
];

const mockAllAchs: Achievement[] = [
  { ID: 1, Name: 'Ach1', Description: 'Desc1', Points: 10, icon: 'icon1', Quantity: 0, category: 92 },
  { ID: 2, Name: 'Ach2', Description: 'Desc2', Points: 10, icon: 'icon2', Quantity: 0, category: 92 },
  { ID: 3, Name: 'Ach3', Description: 'Desc3', Points: 5, icon: 'NULL', Quantity: 0, category: 96 },
  { ID: 4, Name: 'Ach4', Description: 'Desc4', Points: 15, icon: 'icon4', Quantity: 0, category: 200 },
  { ID: 5, Name: 'Ach5', Description: 'Desc5', Points: 20, icon: 'icon5', Quantity: 0, category: 97 },
];

const mockCharAchs: CharacterAchievement[] = [
  { achievement: 1, date: 1700000000 },
  { achievement: 3, date: 1700100000 },
  { achievement: 5, date: 1700200000 },
  { achievement: 4, date: 1699900000 },
];

describe('AchievementSummary', () => {
  let component: AchievementSummary;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AchievementSummary],
    }).compileComponents();

    const fixture = TestBed.createComponent(AchievementSummary);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('allAchievements', mockAllAchs);
    fixture.componentRef.setInput('characterAchievements', mockCharAchs);
    fixture.componentRef.setInput('categories', mockCategories);
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('recentAchievements', () => {
    it('should return up to 4 most recent achievements sorted by date', () => {
      const recent = component.recentAchievements();
      expect(recent.length).toBe(4);
      expect(recent[0].id).toBe(5); // most recent
      expect(recent[1].id).toBe(3);
      expect(recent[2].id).toBe(1);
      expect(recent[3].id).toBe(4); // oldest
    });

    it('should replace NULL icon with default', () => {
      const recent = component.recentAchievements();
      const ach3 = recent.find((a) => a.id === 3)!;
      expect(ach3.icon).toBe('trade_engineering');
    });

    it('should convert timestamps to Date objects', () => {
      const recent = component.recentAchievements();
      expect(recent[0].date).toBeInstanceOf(Date);
    });
  });

  describe('categoryProgress', () => {
    it('should return progress for all 8 overview categories', () => {
      const progress = component.categoryProgress();
      expect(progress.length).toBe(8);
    });

    it('should compute earned/total for General', () => {
      const general = component.categoryProgress().find((p) => p.name === 'General')!;
      expect(general.earned).toBe(1); // Ach1 earned
      expect(general.total).toBe(2); // Ach1, Ach2
    });

    it('should include subcategory achievements in parent progress', () => {
      const quests = component.categoryProgress().find((p) => p.name === 'Quests')!;
      // Ach3 (cat 96) + Ach4 (cat 200, sub of 96)
      expect(quests.total).toBe(2);
      expect(quests.earned).toBe(2); // both earned
    });

    it('should compute percent', () => {
      const exploration = component.categoryProgress().find((p) => p.name === 'Exploration')!;
      expect(exploration.earned).toBe(1);
      expect(exploration.total).toBe(1);
      expect(exploration.percent).toBe(100);
    });

    it('should return 0% for categories with no achievements', () => {
      const pvp = component.categoryProgress().find((p) => p.name === 'Player vs. Player')!;
      expect(pvp.earned).toBe(0);
      expect(pvp.total).toBe(0);
      expect(pvp.percent).toBe(0);
    });
  });

  describe('totalProgress', () => {
    it('should sum all category progress', () => {
      const total = component.totalProgress();
      // General: 1/2, Quests: 2/2, Exploration: 1/1, rest: 0/0
      expect(total.earned).toBe(4);
      expect(total.total).toBe(5);
      expect(total.percent).toBe(80);
    });
  });
});
