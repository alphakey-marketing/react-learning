import { Character } from "../types/character";
import { Enemy } from "../types/enemy";
import { Skill } from "../types/skill";
import { EquippedItems, calculateEquipmentStats } from "../types/equipment";
import { calcPlayerAtk, calcPlayerMagicAtk, calcCritChance, calcPlayerHit, PlayerDefense } from "./character";
import { CRIT_MULTIPLIER, BOSS_ARMOR_PENETRATION } from "../data/constants";
import { ActiveSelfBuff } from "../hooks/useGameState";

export interface DamageResult {
  damage: number;
  isCrit: boolean;
  isMagic: boolean;
  isAOE: boolean;
  isMiss: boolean; // NEW: Track if attack missed
}

export interface EnemyDamageResult {
  hpDamage: number;
  mpDamage: number;
  counterDamage: number; // NEW: Knight Counter Strike damage
}

// UAT FIX: Added magic_bolt for Novice INT builds
const MAGIC_SKILLS = ["magic_bolt", "fire_bolt", "cold_bolt", "lightning_bolt", "jupitel_thunder", "storm_gust", "meteor_storm"];

export function isMagicSkill(skillId: string): boolean {
  return MAGIC_SKILLS.includes(skillId);
}

// NEW: Calculate hit rate percentage
// Player-friendly formula: 85 + ((Hit - Flee) * 0.5)
// Capped between 50% minimum and 95% maximum
function calculateHitRate(playerHit: number, enemyFlee: number): number {
  const baseHitRate = 85;
  const hitDifference = playerHit - enemyFlee;
  const hitRate = baseHitRate + (hitDifference * 0.5);
  
  // Cap between 50% and 95%
  return Math.max(50, Math.min(95, hitRate));
}

export function calculateDamage(
  char: Character,
  enemy: Enemy,
  skill: Skill,
  skillLevel: number,
  equipped: EquippedItems,
  activeSelfBuffs: ActiveSelfBuff[] = []
): DamageResult {
  const isMagic = isMagicSkill(skill.id);
  const equipStats = calculateEquipmentStats(equipped);
  
  let baseDmg = 0;
  let isCrit = false;
  let isMiss = false;
  
  if (isMagic) {
    // MAGIC ATTACKS: Always hit (no accuracy check for magic)
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
    // PHYSICAL ATTACKS: Check hit rate first
    const { attack: atkRange, passives, classPenalty } = calcPlayerAtk(
      char, 
      equipStats.weaponAtk, 
      equipStats.weaponLevel, 
      equipStats.weaponRefine, 
      equipStats.equipBonusAtk,
      equipStats.weaponType
    );
    
    // NEW: Hit/Flee Accuracy Check
    const playerHit = calcPlayerHit(char, passives.accuracyBonus, 0); // TODO: Add equipment hit bonus
    const hitRate = calculateHitRate(playerHit, enemy.flee);
    const hitRoll = Math.random() * 100;
    
    // Check if attack misses
    if (hitRoll >= hitRate) {
      // MISS! Return 0 damage
      isMiss = true;
      baseDmg = 0;
    } else {
      // HIT! Calculate damage normally
      // TRUE SIGHT BUFF: Check if Hunter has True Sight active
      const now = Date.now();
      const trueSightBuff = activeSelfBuffs.find(b => b.id === "true_sight" && now <= b.expiresAt);
      let trueSightCritBonus = 0;
      let trueSightDamageBonus = 1.0;
      
      if (trueSightBuff) {
        // Lv1: +1% crit chance, +2% crit damage
        // Lv10: +10% crit chance, +20% crit damage
        trueSightCritBonus = trueSightBuff.skillLevel * 1.0;
        trueSightDamageBonus = 1.0 + (trueSightBuff.skillLevel * 0.02);
      }
      
      // Phase 2: Apply weapon crit bonus + True Sight bonus
      const critChance = calcCritChance(char, passives.critBonus + trueSightCritBonus);
      const roll = Math.random() * 100;

      if (roll < critChance) {
        // CRITICAL HIT: Bypass variance (use max ATK) and bypass DEF entirely
        isCrit = true;
        const rawCritDmg = Math.floor(atkRange.max * CRIT_MULTIPLIER);
        
        // TRUE SIGHT: Apply crit damage multiplier
        const trueSightCritDmg = Math.floor(rawCritDmg * trueSightDamageBonus);
        
        // Phase 2: Apply cross-class penalty even to crits
        baseDmg = Math.floor(trueSightCritDmg * classPenalty);
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

  return { damage, isCrit, isMagic, isAOE, isMiss };
}

// Phase 3: Enhanced enemy damage calculation with MDEF and Knight Counter Strike
export function calculateEnemyDamage(
  enemy: Enemy,
  playerDef: PlayerDefense,
  char: Character
): EnemyDamageResult {
  const enemyRawDmg = enemy.atk;
  
  // Determine if this is a magic attack (simplified: 30% of enemy attacks are "magic")
  const isMagicAttack = Math.random() < 0.3;
  
  // Use explicit isBoss flag instead of name checking
  const isBoss = enemy.isBoss || false;
  const armorPen = isBoss ? BOSS_ARMOR_PENETRATION : 0;
  
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
  let counterDamage = 0;
  
  // KNIGHT COUNTER STRIKE: 15% chance to counter physical attacks
  if (!isMagicAttack && char.jobClass === "Knight" && char.learnedSkills["counter_strike"] > 0) {
    const counterChance = 15; // 15% chance
    const counterRoll = Math.random() * 100;
    
    if (counterRoll < counterChance) {
      // Calculate counter damage as 50% of Knight's ATK
      // Use mid-range ATK for consistency
      const { str, dex, luk } = char.stats;
      const strBonus = Math.floor(Math.pow(Math.floor(str / 10), 2));
      const dexBonus = Math.floor(dex / 5);
      const lukBonus = Math.floor(luk / 5);
      const baseAtk = strBonus + dexBonus + lukBonus + char.level + 10; // +10 from Knight job bonus
      
      // Add Iron Will bonus (20% of soft DEF)
      let ironWillBonus = 0;
      if (char.learnedSkills["iron_will"] > 0) {
        ironWillBonus = Math.floor(playerDef.softDef * 0.20);
      }
      
      counterDamage = Math.floor((baseAtk + ironWillBonus) * 0.5);
      counterDamage = Math.max(1, counterDamage); // Minimum 1 damage
    }
  }
  
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

  return { hpDamage, mpDamage, counterDamage };
}
