export type JobClass = "Novice" | "Swordsman" | "Mage" | "Archer" | "Knight" | "Wizard" | "Hunter";

export interface CharacterStats {
  str: number;
  agi: number;
  vit: number;
  int: number;
  dex: number;
  luk: number;
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
  autoAttackSkillId: string; // Which skill to use for auto-attack
}
