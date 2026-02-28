import { Character } from "../types/character";
import { Enemy } from "../types/enemy";
import { Skill } from "../types/skill";
import { calcPlayerAtk, calcPlayerMagicAtk, calcCritChance } from "./character";
import { CRIT_MULTIPLIER } from "../data/constants";

export interface DamageResult {
  damage: number;
  isCrit: boolean;
  isMagic: boolean;
}

const MAGIC_SKILLS = ["fire_bolt", "cold_bolt", "lightning_bolt"];

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
  const damage = Math.floor(baseDmg * multiplier);

  return { damage, isCrit, isMagic };
}

export function calculateEnemyDamage(
  enemy: Enemy,
  playerDef: number
): number {
  const enemyRawDmg = enemy.atk;
  return Math.max(1, Math.floor(enemyRawDmg - playerDef * 0.7));
}
