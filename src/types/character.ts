import { QuestEndingChoice } from "../data/questChains";

export type JobClass = "Novice" | "Swordsman" | "Mage" | "Archer" | "Knight" | "Wizard" | "Hunter";

export type { QuestEndingChoice };

export interface CharacterStats {
  str: number;
  agi: number;
  vit: number;
  int: number;
  dex: number;
  luk: number;
}

// NEW: Buff/Debuff tracking
export interface ActiveBuff {
  skillId: string;
  duration: number; // seconds remaining
  appliedAt: number; // timestamp when applied
}

export interface Character {
  level: number;
  exp: number;
  expToNext: number;
  hp: number;
  maxHp: number;
  mp: number;
  maxMp: number;
  gold: number;
  stats: CharacterStats;
  statPoints: number;
  jobClass: JobClass;
  jobLevel: number;
  jobExp: number;
  jobExpToNext: number;
  skillPoints: number;
  learnedSkills: Record<string, number>;
  autoAttackSkillId: string; // DEPRECATED: Use skillRotation instead
  
  // NEW: Multi-skill rotation system
  skillRotation?: string[]; // Priority queue of skill IDs to rotate through
  
  // NEW: Active buff/debuff tracking
  activeBuffs?: Record<string, ActiveBuff>; // enemy debuffs applied by player
  
  elunium: number; // Armor refine material
  oridecon: number; // Weapon refine material

  // "You Are the Monster" — corruption accumulates as the player kills and completes quests
  corruptionLevel: number; // 0–100
  // Quest progress: step IDs the player has accepted (intro seen, quest active)
  acceptedStepIds: Record<string, boolean>;
  // Quest items found but not yet submitted at the Quest Log
  heldQuestItems: Record<string, boolean>; // stepId → true
  // Quest progress: step IDs the player has completed (item submitted + choice made)
  completedStepIds: Record<string, boolean>;
  // Ending choice made at the conclusion of Chain 3 (null until chosen)
  questEnding: QuestEndingChoice;
  // The dialogue choice text selected for each completed step (stepId → chosen text)
  questChoicesMade: Record<string, { label: string; text: string; corruptionDelta: number }>;
}
