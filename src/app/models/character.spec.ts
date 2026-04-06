import { getFaction } from './character';

describe('getFaction', () => {
  it('should return "alliance" for alliance races', () => {
    const allianceRaces = [1, 3, 4, 7, 11];
    for (const race of allianceRaces) {
      expect(getFaction(race)).toBe('alliance');
    }
  });

  it('should return "horde" for horde races', () => {
    const hordeRaces = [2, 5, 6, 8, 10];
    for (const race of hordeRaces) {
      expect(getFaction(race)).toBe('horde');
    }
  });

  it('should return "horde" for unknown race IDs', () => {
    expect(getFaction(999)).toBe('horde');
  });
});
