import { Character } from "../types/character";
import { JobClass, JOB_DATA } from "../data/jobs";

export interface PlayerDefense {
  softDef: number;
  hardDefPercent: number;
}

export interface PlayerAttack {
  min: number;
  max: number;
}

// Physical Attack - Class-specific stat scaling (Classic RO style)
// Now returns { min, max } to support weapon variance
export function calcPlayerAtk(
  char: Character,
  weaponAtk: number,
  weaponLevel: number,
  weaponRefine: number,
  equipBonusAtk: number
): PlayerAttack {
  const { str, agi, dex, luk } = char.stats;
  const jobBonus = JOB_DATA[char.jobClass]?.bonuses.atkBonus || 0;
  
  let statusAtk = 0;
  
  // Status ATK: Melee classes use STR primary, DEX secondary
  if (char.jobClass === "Swordsman" || char.jobClass === "Knight") {
    statusAtk = str * 2 + dex * 0.5 + luk * 0.3;
  }
  // Ranged classes: DEX primary, STR + AGI secondary
  else if (char.jobClass === "Archer" || char.jobClass === "Hunter") {
    statusAtk = dex * 2 + str * 0.5 + agi * 0.3 + luk * 0.3;
  }
  // Mages use magic attack, but basic attack is physical with balanced scaling
  else if (char.jobClass === "Mage" || char.jobClass === "Wizard") {
    statusAtk = str * 1.0 + dex * 0.5 + char.stats.int * 0.5 + luk * 0.3;
  }
  // Novice: Balanced scaling for all stats
  else {
    statusAtk = str * 1.5 + dex * 0.5 + luk * 0.3;
  }
  
  statusAtk = Math.floor(statusAtk) + char.level + jobBonus + equipBonusAtk;

  // If no weapon is equipped, attack is just status ATK (bare hands)
  if (weaponAtk === 0) {
    return { min: statusAtk, max: statusAtk };
  }

  // RO Weapon Variance Formula
  // Refine ATK is added cleanly
  const refineAtk = weaponRefine * 5;
  
  // Variance scales with Weapon Level (10% variance per level)
  // Level 1 = 10% variance, Level 4 = 40% variance
  const variancePercent = weaponLevel * 0.1;
  const varianceAmount = Math.floor(weaponAtk * variancePercent);

  // High DEX reduces variance by boosting the minimum ATK floor
  const dexBonusFloor = Math.floor(dex * 0.5);
  
  let minWeaponAtk = weaponAtk - varianceAmount + dexBonusFloor;
  let maxWeaponAtk = weaponAtk + varianceAmount;

  // Min weapon ATK cannot exceed max weapon ATK
  if (minWeaponAtk > maxWeaponAtk) {
    minWeaponAtk = maxWeaponAtk;
  }
  // Min weapon ATK cannot be lower than 0
  if (minWeaponAtk < 0) {
    minWeaponAtk = 0;
  }

  return {
    min: statusAtk + minWeaponAtk + refineAtk,
    max: statusAtk + maxWeaponAtk + refineAtk,
  };
}

// Magic Attack - INT primary (all magic classes)
export function calcPlayerMagicAtk(char: Character): number {
  const { int, dex } = char.stats;
  const jobBonus = JOB_DATA[char.jobClass]?.bonuses.atkBonus || 0;
  return Math.floor(int * 3 + dex * 0.5) + char.level + jobBonus;
}

// Defense - Split into Soft DEF (flat, from VIT) and Hard DEF (%, from equipment)
export function calcPlayerDef(char: Character, armorBonus: number): PlayerDefense {
  const { vit } = char.stats;
  const jobBonus = JOB_DATA[char.jobClass]?.bonuses.defBonus || 0;
  
  // Soft DEF: VIT*0.5 + random variance based on VIT (RO style approximation)
  const baseSoft = Math.floor(vit * 0.5);
  const variableSoft = Math.floor(vit * 0.3);
  const maxVarSoft = Math.max(variableSoft, Math.floor((vit * vit) / 150) - 1);
  const softDef = baseSoft + Math.floor(Math.random() * (Math.max(0, maxVarSoft - variableSoft) + 1)) + variableSoft;
  
  // REBALANCE Phase 2: Hard DEF %
  // Instead of 1 armor = 1% reduction, make it 1 armor = 0.25% reduction
  // This scales much better into endgame without hitting immunity too early
  // A fully geared level 50 player might have ~120 DEF, giving 30% reduction instead of 90% cap
  const defMultiplier = 0.25;
  const rawHardDef = Math.floor((armorBonus + jobBonus) * defMultiplier);
  
  // Set a healthier cap of 70% reduction max (very hard to reach now)
  const hardDefPercent = Math.min(70, rawHardDef);
  
  return { softDef, hardDefPercent };
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