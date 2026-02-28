import { Character } from "../types/character";
import { Enemy } from "../types/enemy";
import { calcMaxHp, calcMaxMp } from "./character";

export interface LevelUpResult {
  newLevel: number;
  newExp: number;
  newExpToNext: number;
  newStatPoints: number;
  newHp: number;
  newMp: number;
  leveledUp: boolean;
}

export interface JobLevelUpResult {
  newJobLevel: number;
  newJobExp: number;
  newJobExpToNext: number;
  newSkillPoints: number;
  leveledUp: boolean;
}

// Base EXP scales with enemy level (for Base Level progression)
export function calculateExpGain(enemy: Enemy): number {
  return 20 + enemy.level * 10;
}

// Job EXP scales with enemy level AND current Job Level
// This is the Classic RO system: Job EXP is always easier to gain after job change!
export function calculateJobExpGain(enemy: Enemy, jobLevel: number): number {
  // Base job exp from enemy
  const baseJobExp = 25 + enemy.level * 12;
  
  // Apply level difference penalty/bonus
  // If enemy is lower level than your job level, you get less exp
  // If enemy is higher level, you get more exp
  const levelDifference = enemy.level - jobLevel;
  
  // Penalty for fighting lower level enemies (max -70% at 10+ levels below)
  // Bonus for fighting higher level enemies (max +50% at 5+ levels above)
  let multiplier = 1.0;
  
  if (levelDifference < 0) {
    // Enemy is lower level - penalty
    multiplier = Math.max(0.3, 1.0 + (levelDifference * 0.07));
  } else if (levelDifference > 0) {
    // Enemy is higher level - bonus
    multiplier = Math.min(1.5, 1.0 + (levelDifference * 0.1));
  }
  
  return Math.floor(baseJobExp * multiplier);
}

export function calculateGoldGain(enemy: Enemy): number {
  return 10 + enemy.level * 5;
}

export function processLevelUp(char: Character, expGained: number): LevelUpResult {
  let newLevel = char.level;
  let newExp = char.exp + expGained;
  let newExpToNext = char.expToNext;
  let newStatPoints = char.statPoints;
  let leveledUp = false;

  while (newExp >= newExpToNext) {
    newExp -= newExpToNext;
    newLevel += 1;
    newExpToNext = Math.floor(newExpToNext * 1.5);
    newStatPoints += 3;
    leveledUp = true;
  }

  const newHp = calcMaxHp(newLevel, char.stats.vit, char.jobClass);
  const newMp = calcMaxMp(newLevel, char.stats.int, char.jobClass);

  return {
    newLevel,
    newExp,
    newExpToNext,
    newStatPoints,
    newHp,
    newMp,
    leveledUp,
  };
}

export function processJobLevelUp(
  char: Character,
  jobExpGained: number
): JobLevelUpResult {
  let newJobLevel = char.jobLevel;
  let newJobExp = char.jobExp + jobExpGained;
  let newJobExpToNext = char.jobExpToNext;
  let newSkillPoints = char.skillPoints;
  let leveledUp = false;

  while (newJobExp >= newJobExpToNext) {
    newJobExp -= newJobExpToNext;
    newJobLevel += 1;
    newJobExpToNext = Math.floor(newJobExpToNext * 1.4);
    newSkillPoints += 1;
    leveledUp = true;
  }

  return {
    newJobLevel,
    newJobExp,
    newJobExpToNext,
    newSkillPoints,
    leveledUp,
  };
}
