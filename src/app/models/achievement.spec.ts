import { STATS_CATEGORY_IDS } from './achievement';

describe('STATS_CATEGORY_IDS', () => {
  it('should be a Set', () => {
    expect(STATS_CATEGORY_IDS).toBeInstanceOf(Set);
  });

  it('should contain known statistics category IDs', () => {
    expect(STATS_CATEGORY_IDS.has(130)).toBe(true);
    expect(STATS_CATEGORY_IDS.has(141)).toBe(true);
    expect(STATS_CATEGORY_IDS.has(21)).toBe(true);
    expect(STATS_CATEGORY_IDS.has(140)).toBe(true);
  });

  it('should not contain non-statistics category IDs', () => {
    expect(STATS_CATEGORY_IDS.has(92)).toBe(false);
    expect(STATS_CATEGORY_IDS.has(0)).toBe(false);
    expect(STATS_CATEGORY_IDS.has(1)).toBe(false);
  });
});
