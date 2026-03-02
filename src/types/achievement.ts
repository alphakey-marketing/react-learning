export type AchievementCategory = "combat" | "progression" | "collection" | "exploration";
export type AchievementRarity = "common" | "rare" | "epic" | "legendary";

export interface Achievement {
  id: string;
  name: string;
  description: string;
  category: AchievementCategory;
  rarity: AchievementRarity;
  icon: string;
  
  // Requirements
  requirement: {
    type: string;
    target: number;
  };
  
  // Rewards
  rewardTitle?: string;
  rewardDescription?: string;
}

export interface AchievementProgress {
  achievementId: string;
  current: number;
  unlocked: boolean;
  unlockedAt?: number;
}

export interface PlayerAchievements {
  unlocked: Set<string>;
  progress: Record<string, number>;
  titles: string[];
  selectedTitle?: string;
}
