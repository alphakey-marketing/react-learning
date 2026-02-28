import { Character } from "../types/character";
import { JobClass, JOB_DATA } from "../data/jobs";

export function calcPlayerAtk(char: Character, weaponBonus: number): number {
  const { str, dex, luk } = char.stats;
  const base = str * 2 + Math.floor(dex * 0.5) + Math.floor(luk * 0.3);
  return base + weaponBonus + char.level;
}

export function calcPlayerMagicAtk(char: Character): number {
  const { int, dex } = char.stats;
  return int * 3 + Math.floor(dex * 0.3) + char.level;
}

export function calcPlayerDef(char: Character, armorBonus: number): number {
  const { vit, agi } = char.stats;
  const softDef = vit * 1.5 + agi * 0.5;
  return softDef + armorBonus;
}

export function calcCritChance(char: Character): number {
  const { luk } = char.stats;
  return Math.min(50, Math.floor(luk / 3));
}

export function calcMaxHp(level: number, vit: number, jobClass: JobClass = "Novice"): number {
  const baseHp = level * 20 + 50 + vit * 5;
  const multiplier = JOB_DATA[jobClass]?.bonuses.hpMultiplier || 1;
  return Math.floor(baseHp * multiplier);
}

export function calcMaxMp(level: number, int: number, jobClass: JobClass = "Novice"): number {
  const baseMp = level * 10 + 30 + int * 3;
  const multiplier = JOB_DATA[jobClass]?.bonuses.mpMultiplier || 1;
  return Math.floor(baseMp * multiplier);
}
