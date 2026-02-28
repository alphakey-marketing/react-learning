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

export function calculateExpGain(enemy: Enemy): number {
  return 20 + enemy.level * 10;
}

export function calculateJobExpGain(enemy: Enemy): number {
  return 15 + enemy.level * 8;
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

  const newHp = calcMaxHp(newLevel, char.stats.vit);
  const newMp = calcMaxMp(newLevel, char.stats.int);

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
