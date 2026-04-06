import { TestBed } from '@angular/core/testing';
import { CategoryNav, CategoryNode } from './category-nav';

const mockTree: CategoryNode[] = [
  { id: 92, name: 'General', children: [] },
  {
    id: 96,
    name: 'Quests',
    children: [
      { id: 97, name: 'Eastern Kingdoms', children: [] },
      { id: 98, name: 'Kalimdor', children: [] },
    ],
  },
  {
    id: 130,
    name: 'Statistics',
    children: [
      {
        id: 131,
        name: 'Character',
        children: [
          { id: 21, name: 'Kills', children: [] },
        ],
      },
    ],
  },
];

describe('CategoryNav', () => {
  let component: CategoryNav;
  let emittedCategories: number[];

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CategoryNav],
    }).compileComponents();

    const fixture = TestBed.createComponent(CategoryNav);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('categoryTree', mockTree);
    fixture.componentRef.setInput('currentCategoryId', null);

    emittedCategories = [];
    component.categorySelected.subscribe((id: number) => emittedCategories.push(id));
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('toggleParent', () => {
    it('should emit and not expand for leaf parent', () => {
      const general = mockTree[0];
      component.toggleParent(general);

      expect(emittedCategories).toEqual([92]);
      expect(component.expandedParents().size).toBe(0);
    });

    it('should expand and emit for parent with children', () => {
      const quests = mockTree[1];
      component.toggleParent(quests);

      expect(component.isParentExpanded(96)).toBe(true);
      expect(emittedCategories).toEqual([96]);
    });

    it('should collapse already expanded parent without emitting', () => {
      const quests = mockTree[1];
      component.toggleParent(quests); // expand
      emittedCategories.length = 0;
      component.toggleParent(quests); // collapse

      expect(component.isParentExpanded(96)).toBe(false);
      expect(emittedCategories).toEqual([]);
    });

    it('should collapse other parents when expanding a new one', () => {
      const quests = mockTree[1];
      const stats = mockTree[2];

      component.toggleParent(quests);
      expect(component.isParentExpanded(96)).toBe(true);

      component.toggleParent(stats);
      expect(component.isParentExpanded(96)).toBe(false);
      expect(component.isParentExpanded(130)).toBe(true);
    });
  });

  describe('toggleStatistic', () => {
    it('should expand and emit', () => {
      component.toggleStatistic(131);

      expect(component.isStatisticExpanded(131)).toBe(true);
      expect(emittedCategories).toEqual([131]);
    });

    it('should collapse without emitting', () => {
      component.toggleStatistic(131);
      emittedCategories.length = 0;
      component.toggleStatistic(131);

      expect(component.isStatisticExpanded(131)).toBe(false);
      expect(emittedCategories).toEqual([]);
    });
  });

  describe('selectCategory', () => {
    it('should emit the category id', () => {
      component.selectCategory(97);

      expect(emittedCategories).toEqual([97]);
    });
  });

  describe('isStatCategory', () => {
    it('should return true for known stats category IDs', () => {
      expect(component.isStatCategory(130)).toBe(true);
      expect(component.isStatCategory(140)).toBe(true);
    });

    it('should return false for non-stats category IDs', () => {
      expect(component.isStatCategory(92)).toBe(false);
      expect(component.isStatCategory(96)).toBe(false);
    });
  });
});
