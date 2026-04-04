export interface AchievementCategory {
  ID: number;
  Name: string;
  ParentID: number;
}

export interface Achievement {
  ID: number;
  Name: string;
  Description: string;
  Points: number;
  icon: string;
  Quantity: number;
}

export interface CharacterAchievement {
  achievement: number;
  date: number;
  counter?: number;
}

export interface AchievementProgress {
  achievement: number;
  counter: number;
}

/** Category IDs that are statistics rather than achievements */
export const STATS_CATEGORY_IDS = new Set([
  141, 147, 152, 154, 173, 126, 127, 128, 129, 130, 131, 132, 133, 134, 135,
  136, 137, 138, 139, 140, 145, 146, 148, 149, 150, 153, 155, 156, 157, 158,
]);
