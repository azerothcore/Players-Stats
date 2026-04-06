import { Injectable, signal } from '@angular/core';
import { Character, Faction } from '../models/character';
import { Achievement, AchievementCategory, CharacterAchievement } from '../models/achievement';

@Injectable({ providedIn: 'root' })
export class PlayerContextService {
  readonly character = signal<Character | null>(null);
  readonly faction = signal<Faction>('alliance');
  readonly achievementPoints = signal<number>(0);
  readonly allAchievements = signal<Achievement[]>([]);
  readonly characterAchievements = signal<CharacterAchievement[]>([]);
  readonly categories = signal<AchievementCategory[]>([]);
}
