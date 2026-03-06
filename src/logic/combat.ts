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

export interface EnemyDamageResult {
  hpDamage: number;
  mpDamage: number;
}

const MAGIC_SKILLS = ["fire_bolt", "cold_bolt", "lightning_bolt", "jupitel_thunder", "storm_gust", "meteor_storm"];

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
  const equipStats = calculateEquipmentStats(equipped);
  
  let baseDmg = 0;
  let isCrit = false;
  
  if (isMagic) {
    // Phase 2 & 3: Magic damage with wand passives and MDEF
    const { matk, passives } = calcPlayerMagicAtk(
      char, 
      equipStats.weaponMatk,
      equipStats.weaponLevel,
      equipStats.weaponRefine,
      equipStats.weaponType
    );
    
    const randomVar = Math.floor(Math.random() * 5);
    const rawDmg = matk + randomVar;
    
    // Phase 3: Apply Enemy MDEF
    // Phase 2: Wand penetration reduces MDEF effectiveness
    const effectiveMdefPercent = Math.max(0, enemy.hardMdefPercent - passives.penetration);
    const afterHardMdef = Math.floor(rawDmg * (1 - effectiveMdefPercent / 100));
    
    baseDmg = Math.max(1, afterHardMdef - enemy.softMdef);
  } else {
    // Phase 2: Physical Attack with Weapon Passives and Cross-Class Penalty
    const { attack: atkRange, passives, classPenalty } = calcPlayerAtk(
      char, 
      equipStats.weaponAtk, 
      equipStats.weaponLevel, 
      equipStats.weaponRefine, 
      equipStats.equipBonusAtk,
      equipStats.weaponType
    );
    
    // Phase 2: Apply weapon crit bonus
    const critChance = calcCritChance(char, passives.critBonus);
    const roll = Math.random() * 100;

    if (roll < critChance) {
      // CRITICAL HIT: Bypass variance (use max ATK) and bypass DEF entirely
      isCrit = true;
      const rawCritDmg = Math.floor(atkRange.max * CRIT_MULTIPLIER);
      
      // Phase 2: Apply cross-class penalty even to crits
      baseDmg = Math.floor(rawCritDmg * classPenalty);
    } else {
      // NORMAL HIT: Roll random damage between min and max
      const rawDmg = Math.floor(Math.random() * (atkRange.max - atkRange.min + 1)) + atkRange.min;
      
      // Phase 2: Apply cross-class penalty BEFORE defense calculation
      const penalizedDmg = Math.floor(rawDmg * classPenalty);
      
      // BALANCE: Apply physical penetration to reduce enemy DEF effectiveness
      const effectiveDefPercent = Math.max(0, enemy.hardDefPercent - passives.penetration);
      const afterHardDef = Math.floor(penalizedDmg * (1 - effectiveDefPercent / 100));
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

// Phase 3: Enhanced enemy damage calculation with MDEF
export function calculateEnemyDamage(
  enemy: Enemy,
  playerDef: PlayerDefense,
  char: Character
): EnemyDamageResult {
  const enemyRawDmg = enemy.atk;
  
  // Determine if this is a magic attack (simplified: 30% of enemy attacks are "magic")
  const isMagicAttack = Math.random() < 0.3;
  
  const isBoss = enemy.name.includes("Boss");
  const armorPen = isBoss ? 20 : 0; // Bosses ignore 20% of player DEF/MDEF
  
  let rawDamage = 0;
  
  if (isMagicAttack) {
    // Phase 3: Magic damage uses player's Soft MDEF and Hard MDEF
    const effectiveMdef = Math.max(0, playerDef.hardMdefPercent - armorPen);
    const afterHardMdef = Math.floor(enemyRawDmg * (1 - effectiveMdef / 100));
    rawDamage = Math.max(1, afterHardMdef - playerDef.softMdef);
  } else {
    // Physical damage uses normal DEF
    const effectiveDef = Math.max(0, playerDef.hardDefPercent - armorPen);
    const afterHardDef = Math.floor(enemyRawDmg * (1 - effectiveDef / 100));
    rawDamage = Math.max(1, afterHardDef - playerDef.softDef);
  }
  
  let hpDamage = rawDamage;
  let mpDamage = 0;
  
  // ENERGY COAT: If Wizard and has learned energy coat
  if (char.jobClass === "Wizard" && char.learnedSkills["energy_coat"] > 0) {
    const absorbed = Math.floor(rawDamage * 0.2); // Absorb 20% damage to MP
    if (char.mp >= absorbed) {
      hpDamage = rawDamage - absorbed;
      mpDamage = absorbed;
    } else if (char.mp > 0) {
      // Drain remaining MP
      hpDamage = rawDamage - char.mp;
      mpDamage = char.mp;
    }
  }

  return { hpDamage, mpDamage };
}