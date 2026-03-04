import { Character } from "../types/character";
import { Enemy } from "../types/enemy";
import { Skill } from "../types/skill";
import { EquippedItems, calculateEquipmentStats } from "../types/equipment";
import { calcPlayerAtk, calcPlayerMagicAtk, calcCritChance, PlayerDefense } from "./character";
import { CRIT_MULTIPLIER } from "../data/constants";
import { ElementType, getElementMultiplier } from "../types/element";

export interface DamageResult {
  damage: number;
  isCrit: boolean;
  isMagic: boolean;
  isAOE: boolean;
  elementMultiplier: number;
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
  
  let rawDmg = 0;
  
  // 1. Determine Attacking Element
  let attackElement: ElementType = "Neutral";
  if (skill.element && skill.element !== "Neutral") {
    // Skills have innate priority over weapons (e.g. Fire Bolt is always Fire)
    attackElement = skill.element;
  } else if (equipped.weapon?.element && !isMagic) {
    // If physical attack with no specific skill element, use weapon element
    attackElement = equipped.weapon.element;
  }
  
  // 2. Get Elemental Multiplier against Enemy
  const enemyElement = enemy.element?.type || "Neutral";
  const elementMulti = getElementMultiplier(attackElement, enemyElement);
  
  if (isMagic) {
    const baseAtk = calcPlayerMagicAtk(char);
    const randomVar = Math.floor(Math.random() * 5);
    rawDmg = baseAtk + randomVar;
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
    
    // Roll random damage between min and max
    rawDmg = Math.floor(Math.random() * (atkRange.max - atkRange.min + 1)) + atkRange.min;
  }

  // RO DEF Formula: damage * (1 - hardDEF%) - softDEF
  // Apply Enemy Defense
  const afterHardDef = Math.floor(rawDmg * (1 - enemy.hardDefPercent / 100));
  let baseDmg = Math.max(1, afterHardDef - enemy.softDef);

  const critChance = isMagic ? 0 : calcCritChance(char);
  const roll = Math.random() * 100;
  let isCrit = false;

  if (roll < critChance) {
    isCrit = true;
    baseDmg = Math.floor(baseDmg * CRIT_MULTIPLIER);
  }

  const multiplier = skill.damageMultiplier(skillLevel);
  let damage = Math.floor(baseDmg * multiplier * elementMulti);

  // AOE Bonus: If skill can hit multiple targets AND enemy group has multiple enemies
  const skillTargets = skill.targetCount || 1;
  const enemyCount = enemy.count || 1;
  const isAOE = skillTargets > 1 && enemyCount > 1;
  
  if (isAOE) {
    // AOE bonus scales with both skill targets and enemy count
    const aoeMultiplier = 1.3 + Math.min(0.2, (enemyCount - 1) * 0.1);
    damage = Math.floor(damage * aoeMultiplier);
  }

  return { damage, isCrit, isMagic, isAOE, elementMultiplier: elementMulti };
}

export function calculateEnemyDamage(
  enemy: Enemy,
  playerDef: PlayerDefense
): number {
  const enemyRawDmg = enemy.atk;
  
  // NOTE: In Phase 1 Element System, enemies only deal Neutral damage to player for now.
  // Armor element resistances will be added in the next update.
  
  // RO DEF Formula: damage * (1 - hardDEF%) - softDEF
  const afterHardDef = Math.floor(enemyRawDmg * (1 - playerDef.hardDefPercent / 100));
  const finalDamage = Math.max(1, afterHardDef - playerDef.softDef);
  
  return finalDamage;
}