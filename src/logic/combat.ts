import { Character } from "../types/character";
import { Enemy } from "../types/enemy";
import { Skill } from "../types/skill";
import { EquippedItems, calculateEquipmentStats } from "../types/equipment";
import { calcPlayerAtk, calcPlayerMagicAtk, calcCritChance, PlayerDefense } from "./character";
import { CRIT_MULTIPLIER } from "../data/constants";

export interface DamageResult {
  damage: number;
  isCrit: boolean;
  isMagic: boolean;
  isAOE: boolean;
}

const MAGIC_SKILLS = ["fire_bolt", "cold_bolt", "lightning_bolt", "storm_gust", "meteor_storm"];

export function isMagicSkill(skillId: string): boolean {
  return MAGIC_SKILLS.includes(skillId);
}

export function calculateDamage(
  char: Character,
  enemy: Enemy,
  skill: Skill,
  skillLevel: number,
  equipped: EquippedItems
): DamageResult {
  const isMagic = isMagicSkill(skill.id);
  
  let baseDmg = 0;
  let isCrit = false;
  
  if (isMagic) {
    const baseAtk = calcPlayerMagicAtk(char);
    const randomVar = Math.floor(Math.random() * 5);
    const rawDmg = baseAtk + randomVar;
    
    // RO DEF Formula: damage * (1 - hardDEF%) - softDEF
    // Apply Enemy Defense
    const afterHardDef = Math.floor(rawDmg * (1 - enemy.hardDefPercent / 100));
    baseDmg = Math.max(1, afterHardDef - enemy.softDef);
  } else {
    // Physical Attack with Weapon Variance
    const equipStats = calculateEquipmentStats(equipped);
    const atkRange = calcPlayerAtk(
      char, 
      equipStats.weaponAtk, 
      equipStats.weaponLevel, 
      equipStats.weaponRefine, 
      equipStats.equipBonusAtk
    );
    
    const critChance = calcCritChance(char);
    const roll = Math.random() * 100;

    if (roll < critChance) {
      // CRITICAL HIT: Bypass variance (use max ATK) and bypass DEF entirely
      isCrit = true;
      baseDmg = Math.floor(atkRange.max * CRIT_MULTIPLIER);
    } else {
      // NORMAL HIT: Roll random damage between min and max
      const rawDmg = Math.floor(Math.random() * (atkRange.max - atkRange.min + 1)) + atkRange.min;
      
      // Apply Enemy Defense
      const afterHardDef = Math.floor(rawDmg * (1 - enemy.hardDefPercent / 100));
      baseDmg = Math.max(1, afterHardDef - enemy.softDef);
    }
  }

  const multiplier = skill.damageMultiplier(skillLevel);
  let damage = Math.floor(baseDmg * multiplier);

  // AOE Bonus: If skill can hit multiple targets AND enemy group has multiple enemies
  const skillTargets = skill.targetCount || 1;
  const enemyCount = enemy.count || 1;
  const isAOE = skillTargets > 1 && enemyCount > 1;
  
  if (isAOE) {
    // AOE bonus scales with both skill targets and enemy count
    // Base 1.3x, up to 1.5x for large groups
    const aoeMultiplier = 1.3 + Math.min(0.2, (enemyCount - 1) * 0.1);
    damage = Math.floor(damage * aoeMultiplier);
  }

  return { damage, isCrit, isMagic, isAOE };
}

export function calculateEnemyDamage(
  enemy: Enemy,
  playerDef: PlayerDefense
): number {
  const enemyRawDmg = enemy.atk;
  
  // RO DEF Formula: damage * (1 - hardDEF%) - softDEF
  const afterHardDef = Math.floor(enemyRawDmg * (1 - playerDef.hardDefPercent / 100));
  const finalDamage = Math.max(1, afterHardDef - playerDef.softDef);
  
  return finalDamage;
}