import { Character } from "../types/character";
import { JobClass, JOB_DATA } from "../data/jobs";

// Physical Attack - Class-specific stat scaling (Classic RO style)
export function calcPlayerAtk(char: Character, weaponBonus: number): number {
  const { str, agi, dex, luk } = char.stats;
  const jobBonus = JOB_DATA[char.jobClass]?.bonuses.atkBonus || 0;
  
  let baseAtk = 0;
  
  // Melee classes: STR primary, DEX secondary
  if (char.jobClass === "Swordsman" || char.jobClass === "Knight") {
    baseAtk = str * 2 + dex * 0.5 + luk * 0.3;
  }
  // Ranged classes: DEX primary, STR + AGI secondary (archers benefit from AGI!)
  else if (char.jobClass === "Archer" || char.jobClass === "Hunter") {
    baseAtk = dex * 2 + str * 0.5 + agi * 0.3 + luk * 0.3;
  }
  // Mages use magic attack, but basic attack is physical with balanced scaling
  else if (char.jobClass === "Mage" || char.jobClass === "Wizard") {
    baseAtk = str * 1.0 + dex * 0.5 + char.stats.int * 0.5 + luk * 0.3;
  }
  // Novice: Balanced scaling for all stats
  else {
    baseAtk = str * 1.5 + dex * 0.5 + luk * 0.3;
  }
  
  return Math.floor(baseAtk) + weaponBonus + char.level + jobBonus;
}

// Magic Attack - INT primary (all magic classes)
export function calcPlayerMagicAtk(char: Character): number {
  const { int, dex } = char.stats;
  const jobBonus = JOB_DATA[char.jobClass]?.bonuses.atkBonus || 0;
  return Math.floor(int * 3 + dex * 0.5) + char.level + jobBonus;
}

// Defense - VIT primary, AGI secondary (all classes), plus job bonus
export function calcPlayerDef(char: Character, armorBonus: number): number {
  const { vit, agi } = char.stats;
  const jobBonus = JOB_DATA[char.jobClass]?.bonuses.defBonus || 0;
  const softDef = vit * 1.5 + agi * 0.5;
  return Math.floor(softDef) + armorBonus + jobBonus;
}

// Critical Rate - LUK based (all physical classes)
export function calcCritChance(char: Character): number {
  const { luk } = char.stats;
  return Math.min(50, Math.floor(luk / 3));
}

// Attack Speed (ASPD) - AGI and DEX based
// Returns attacks per second (e.g., 1.5 means 1.5 attacks every second)
export function calcASPD(char: Character): number {
  const { agi, dex } = char.stats;
  
  // Base ASPD is 1 attack per 1.5 seconds (0.66 attacks/sec)
  // Max ASPD is roughly 3 attacks per second (like RO 190 ASPD)
  const baseASPD = 0.66; 
  
  // AGI provides the bulk of ASPD, DEX provides a small amount
  const aspdBonus = (agi * 0.02) + (dex * 0.005);
  
  return Math.min(3.0, baseASPD + aspdBonus);
}

// Max HP - Level + VIT, scaled by job multiplier
export function calcMaxHp(level: number, vit: number, jobClass: JobClass = "Novice"): number {
  const baseHp = level * 20 + 50 + vit * 5;
  const multiplier = JOB_DATA[jobClass]?.bonuses.hpMultiplier || 1;
  return Math.floor(baseHp * multiplier);
}

// Max MP - Level + INT, scaled by job multiplier
export function calcMaxMp(level: number, int: number, jobClass: JobClass = "Novice"): number {
  const baseMp = level * 10 + 30 + int * 3;
  const multiplier = JOB_DATA[jobClass]?.bonuses.mpMultiplier || 1;
  return Math.floor(baseMp * multiplier);
}
