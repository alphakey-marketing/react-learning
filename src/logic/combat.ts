import { Character } from "../types/character";
import { Enemy } from "../types/enemy";
import { Skill } from "../types/skill";
import { calcPlayerAtk, calcPlayerMagicAtk, calcCritChance } from "./character";
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
  weaponBonus: number
): DamageResult {
  const isMagic = isMagicSkill(skill.id);
  const baseAtk = isMagic
    ? calcPlayerMagicAtk(char)
    : calcPlayerAtk(char, weaponBonus);

  const randomVar = Math.floor(Math.random() * 5);
  let baseDmg = Math.max(1, baseAtk - enemy.def + randomVar);

  const critChance = isMagic ? 0 : calcCritChance(char);
  const roll = Math.random() * 100;
  let isCrit = false;

  if (roll < critChance) {
    isCrit = true;
    baseDmg = Math.floor(baseDmg * CRIT_MULTIPLIER);
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
  playerDef: number
): number {
  const enemyRawDmg = enemy.atk;
  return Math.max(1, Math.floor(enemyRawDmg - playerDef * 0.7));
}
