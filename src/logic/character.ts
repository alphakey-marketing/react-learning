import { Character } from "../types/character";
import { JobClass, JOB_DATA } from "../data/jobs";
import { WeaponType } from "../types/equipment";

export interface PlayerDefense {
  softDef: number;
  hardDefPercent: number;
  softMdef: number; // Phase 3: Magic Defense
  hardMdefPercent: number;
}

export interface PlayerAttack {
  min: number;
  max: number;
}

// Phase 2: Weapon Type Passive Bonuses
// Each weapon type provides unique benefits
export interface WeaponPassives {
  critBonus: number;      // Extra crit chance
  aspdBonus: number;      // Attack speed modifier
  penetration: number;    // Ignore % of enemy defense
  accuracyBonus: number;  // Hit rate increase
}

// Phase 2: Get weapon passive bonuses based on weapon type
// KNIGHT BALANCE: Buffed sword passives to compete with bows
function getWeaponPassives(weaponType: WeaponType | null): WeaponPassives {
  if (!weaponType) {
    return { critBonus: 0, aspdBonus: 0, penetration: 0, accuracyBonus: 0 };
  }
  
  switch (weaponType) {
    case "sword":
      // KNIGHT BUFF: Swords now competitive with bows
      // Balanced offense with penetration and speed
      return {
        critBonus: 3,        // BUFFED: 0% → 3% (meaningful crit chance)
        aspdBonus: 0.15,     // BUFFED: +10% → +15% (faster attacks)
        penetration: 15,     // BUFFED: 10% → 15% (better armor piercing)
        accuracyBonus: 0,    // Kept at 0 (melee doesn't need hit bonus)
      };
    
    case "bow":
      // Bows: High crit, accuracy, penetration, reduced ASPD penalty
      return {
        critBonus: 5,        // +5% base crit chance
        aspdBonus: -0.10,    // BALANCE: Reduced from -15% to -10%
        penetration: 5,      // BALANCE: Added 5% physical DEF penetration
        accuracyBonus: 10,   // +10% hit rate
      };
    
    case "wand":
      // Wands: Defense penetration for magic
      return {
        critBonus: 0,
        aspdBonus: 0,
        penetration: 15,     // Ignore 15% of enemy MDEF
        accuracyBonus: 0,
      };
    
    default:
      return { critBonus: 0, aspdBonus: 0, penetration: 0, accuracyBonus: 0 };
  }
}

// Phase 2: Cross-class weapon penalty
// Returns a damage multiplier (1.0 = no penalty, 0.7 = 30% damage loss)
function getWeaponClassPenalty(jobClass: JobClass, weaponType: WeaponType | null): number {
  if (!weaponType) return 1.0; // No weapon, no penalty
  
  // Define optimal weapon types per class
  const classWeaponMatch: Record<JobClass, WeaponType[]> = {
    "Novice": ["sword"], // Novices prefer swords
    "Swordsman": ["sword"],
    "Knight": ["sword"],
    "Archer": ["bow"],
    "Hunter": ["bow"],
    "Mage": ["wand"],
    "Wizard": ["wand"],
  };
  
  const optimalWeapons = classWeaponMatch[jobClass];
  
  // If using optimal weapon type, no penalty
  if (optimalWeapons.includes(weaponType)) {
    return 1.0;
  }
  
  // Mages/Wizards CANNOT use non-wands (enforced in equipment system)
  // This should never happen, but return 0 if it does
  if ((jobClass === "Mage" || jobClass === "Wizard") && weaponType !== "wand") {
    return 0.0;
  }
  
  // Cross-class usage: 25% damage penalty
  // Example: Knight with Bow, Archer with Sword
  return 0.75;
}

// NEW: Hit Rate Calculation (RO-inspired but player-friendly)
// Formula: Level + DEX + Equipment Hit Bonus
// This determines the player's accuracy against enemy flee
export function calcPlayerHit(
  char: Character,
  weaponAccuracyBonus: number = 0,
  equipmentHitBonus: number = 0
): number {
  const { dex } = char.stats;
  
  // Apply Owl's Eye passive skill bonus to DEX
  let effectiveDex = dex;
  if (char.learnedSkills["owl_eye"] > 0) {
    // Owl's Eye grants +10% DEX per level (max 50%)
    const owlEyeBonus = Math.floor(dex * (char.learnedSkills["owl_eye"] * 0.10));
    effectiveDex += owlEyeBonus;
  }
  
  // Hit = Level + DEX + Weapon Accuracy + Equipment Bonuses
  const baseHit = char.level + effectiveDex + weaponAccuracyBonus + equipmentHitBonus;
  
  return baseHit;
}

// NEW: Player Flee Calculation (for enemy accuracy vs player)
// Formula: Level + (AGI * 0.8) + Equipment Flee Bonus
// AGI slightly nerfed to prevent excessive dodge rates
export function calcPlayerFlee(
  char: Character,
  equipmentFleeBonus: number = 0
): number {
  const { agi } = char.stats;
  
  // Flee = Level + (AGI * 0.8) + Equipment Bonuses
  const baseFlee = char.level + Math.floor(agi * 0.8) + equipmentFleeBonus;
  
  return baseFlee;
}

// Phase 4: Classic RO Quadratic ATK Formula
// Physical Attack - Quadratic scaling for primary stats (Classic RO Pre-Renewal style)
// Formula: Floor(Floor(PrimaryStat/10)^2) + Floor(SecondaryStat/5) + Floor(LUK/5) + Level
// Returns { min, max } to support weapon variance
// Phase 2: Now returns weapon passives and cross-class penalty
export function calcPlayerAtk(
  char: Character,
  weaponAtk: number, // NOTE: This already includes rarity refinement bonus from equipment.ts
  weaponLevel: number,
  weaponRefine: number,
  equipBonusAtk: number,
  weaponType: WeaponType | null = null
): { attack: PlayerAttack; passives: WeaponPassives; classPenalty: number } {
  const { str, agi, dex, luk } = char.stats;
  const jobBonus = JOB_DATA[char.jobClass]?.bonuses.atkBonus || 0;
  
  let statusAtk = 0;
  
  // Apply passive skill bonuses to base stats internally
  let effectiveDex = dex;
  if (char.learnedSkills["owl_eye"] > 0) {
    // Owl's Eye grants +10% DEX per level (max 50%)
    const owlEyeBonus = Math.floor(dex * (char.learnedSkills["owl_eye"] * 0.10));
    effectiveDex += owlEyeBonus;
  }
  
  // Phase 4: Quadratic Scaling by Job Class (Classic RO Formula)
  // Each class has a primary stat that scales quadratically
  
  if (char.jobClass === "Swordsman" || char.jobClass === "Knight") {
    // Melee classes: Half-STR linear + breakpoint bonus, DEX/LUK linear
    // BALANCE (Lv 18-20 Cap): str + breakpoint is too strong for low levels. 
    // Using str/2 + breakpoint keeps incremental growth without overpowering end-game.
    const strBonus = Math.floor(str / 2) + Math.floor(Math.pow(Math.floor(str / 10), 2));
    const dexBonus = Math.floor(effectiveDex / 5);
    const lukBonus = Math.floor(luk / 5);
    statusAtk = strBonus + dexBonus + lukBonus;
  }
  else if (char.jobClass === "Archer" || char.jobClass === "Hunter") {
    // Ranged classes: DEX quadratic, STR/AGI secondary
    const dexBonus = Math.floor(Math.pow(Math.floor(effectiveDex / 10), 2));
    const strBonus = Math.floor(str / 5);
    const agiBonus = Math.floor(agi / 5);
    const lukBonus = Math.floor(luk / 5);
    statusAtk = dexBonus + strBonus + agiBonus + lukBonus;
  }
  else if (char.jobClass === "Mage" || char.jobClass === "Wizard") {
    // Mages: Weak physical attack (they use MATK for skills)
    // INT has no effect on physical ATK in Classic RO
    const strBonus = Math.floor(str / 5);
    const dexBonus = Math.floor(effectiveDex / 5);
    const lukBonus = Math.floor(luk / 5);
    statusAtk = strBonus + dexBonus + lukBonus;
  }
  else {
    // Novice: Balanced scaling for all stats (linear only)
    const strBonus = Math.floor(str / 3);
    const dexBonus = Math.floor(effectiveDex / 5);
    const lukBonus = Math.floor(luk / 5);
    statusAtk = strBonus + dexBonus + lukBonus;
  }
  
  // Add level and job bonus
  statusAtk += char.level + jobBonus + equipBonusAtk;

  // BALANCE: Knight Iron Will passive - Convert 20% of total DEF to ATK
  // This makes VIT investment contribute to damage output
  if (char.jobClass === "Knight" && char.learnedSkills["iron_will"] > 0) {
    // Calculate total DEF (we need to import this or pass it)
    // For now, approximate from VIT and job bonus
    const { vit } = char.stats;
    const jobDefBonus = JOB_DATA[char.jobClass]?.bonuses.defBonus || 0;
    
    // Approximate soft DEF (VIT * 0.5 + variance avg)
    let approximateSoftDef = Math.floor(vit * 0.5) + Math.floor(vit * 0.3);
    
    // Add Peco Peco Ride bonus if learned
    if (char.learnedSkills["peco_peco_ride"] > 0) {
      approximateSoftDef += 15;
    }
    
    // Note: This doesn't include equipment DEF, which will be added in combat calculation
    // The full Iron Will bonus is calculated there with complete DEF values
    const ironWillBonus = Math.floor(approximateSoftDef * 0.20);
    statusAtk += ironWillBonus;
  }

  // If no weapon is equipped, attack is just status ATK (bare hands)
  if (weaponAtk === 0) {
    const passives = getWeaponPassives(null);
    return { 
      attack: { min: statusAtk, max: statusAtk },
      passives,
      classPenalty: 1.0,
    };
  }

  // BUGFIX: Removed double-dipping classic RO refine formula here.
  // We now exclusively use the rarity-based refinement added directly to `weaponAtk` in equipment.ts.
  const refineAtk = 0; 
  
  // Variance scales with Weapon Level (10% variance per level)
  // Level 1 = 10% variance, Level 4 = 40% variance
  const variancePercent = weaponLevel * 0.1;
  const varianceAmount = Math.floor(weaponAtk * variancePercent);

  // High DEX reduces variance by boosting the minimum ATK floor
  const dexBonusFloor = Math.floor(effectiveDex * 0.5);
  
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

  // Phase 2: Get weapon passives and cross-class penalty
  const passives = getWeaponPassives(weaponType);
  const classPenalty = getWeaponClassPenalty(char.jobClass, weaponType);

  return {
    attack: {
      min: statusAtk + minWeaponAtk + refineAtk,
      max: statusAtk + maxWeaponAtk + refineAtk,
    },
    passives,
    classPenalty,
  };
}

// Phase 5: Magic Attack with Wand Refinement Support
// Classic RO Formula: Floor(Floor(INT/7)^2) + Floor(INT/5) + Floor(DEX/5) + Level
// Wands provide MATK instead of ATK, and benefit from refinement at 50% rate
// Phase 2: Now returns weapon passives
export function calcPlayerMagicAtk(
  char: Character,
  weaponMatk: number = 0, // NOTE: This already includes rarity refinement bonus from equipment.ts
  weaponLevel: number = 1,
  weaponRefine: number = 0,
  weaponType: WeaponType | null = null
): { matk: number; passives: WeaponPassives } {
  const { int, dex } = char.stats;
  const jobBonus = JOB_DATA[char.jobClass]?.bonuses.atkBonus || 0;
  
  let effectiveDex = dex;
  if (char.learnedSkills["owl_eye"] > 0) {
    effectiveDex += Math.floor(dex * (char.learnedSkills["owl_eye"] * 0.10));
  }

  // Quadratic INT scaling for status MATK
  const intQuadratic = Math.floor(Math.pow(Math.floor(int / 7), 2));
  const intLinear = Math.floor(int / 5);
  const dexBonus = Math.floor(effectiveDex / 5);
  
  const statusMatk = intQuadratic + intLinear + dexBonus + char.level + jobBonus;
  
  // If no wand equipped, return status MATK only
  if (weaponMatk === 0) {
    const passives = getWeaponPassives(null);
    return { matk: statusMatk, passives };
  }
  
  // BUGFIX: Removed double-dipping classic RO refine formula here.
  // We now exclusively use the rarity-based refinement added directly to `weaponMatk` in equipment.ts.
  const refineMatk = 0;
  
  // Phase 2: Get weapon passives (wand penetration is useful here)
  const passives = getWeaponPassives(weaponType);
  
  return { 
    matk: statusMatk + weaponMatk + refineMatk,
    passives,
  };
}

// Defense - Split into Soft DEF (flat, from VIT) and Hard DEF (%, from equipment)
// Phase 3: Add Soft MDEF calculation
export function calcPlayerDef(char: Character, armorBonus: number, mdefBonus: number = 0): PlayerDefense {
  const { vit, int } = char.stats;
  const jobBonus = JOB_DATA[char.jobClass]?.bonuses.defBonus || 0;
  
  // Soft DEF: VIT*0.5 + random variance based on VIT (RO style approximation)
  const baseSoft = Math.floor(vit * 0.5);
  const variableSoft = Math.floor(vit * 0.3);
  const maxVarSoft = Math.max(variableSoft, Math.floor((vit * vit) / 150) - 1);
  let softDef = baseSoft + Math.floor(Math.random() * (Math.max(0, maxVarSoft - variableSoft) + 1)) + variableSoft;
  
  // Apply Knight's Peco Peco Ride passive
  if (char.learnedSkills["peco_peco_ride"] > 0) {
    // Gives flat 15 DEF
    softDef += 15;
  }
  
  // REBALANCE Phase 2: Hard DEF %
  // Instead of 1 armor = 1% reduction, make it 1 armor = 0.25% reduction
  // This scales much better into endgame without hitting immunity too early
  // A fully geared level 50 player might have ~120 DEF, giving 30% reduction instead of 90% cap
  const defMultiplier = 0.25;
  const rawHardDef = Math.floor((armorBonus + jobBonus) * defMultiplier);
  
  // Set a healthier cap of 70% reduction max (very hard to reach now)
  const hardDefPercent = Math.min(70, rawHardDef);
  
  // Phase 3: Soft MDEF (Magic Defense)
  // Classic RO Formula: INT + VIT/2 (simplified)
  // INT is primary magic defense stat, VIT provides secondary protection
  const softMdef = int + Math.floor(vit / 2);
  
  const rawHardMdef = Math.floor((mdefBonus + Math.floor(jobBonus/2)) * defMultiplier);
  const hardMdefPercent = Math.min(70, rawHardMdef);

  return { softDef, hardDefPercent, softMdef, hardMdefPercent };
}

// Critical Rate - LUK based (all physical classes)
// Phase 2: Now accepts weapon passive bonus
export function calcCritChance(char: Character, weaponCritBonus: number = 0): number {
  const { luk } = char.stats;
  const baseCrit = Math.floor(luk / 3);
  return Math.min(50, baseCrit + weaponCritBonus);
}

// Attack Speed (ASPD) - AGI and DEX based
// Returns attacks per second (e.g., 1.5 means 1.5 attacks every second)
// Phase 2: Now accepts weapon ASPD modifier
export function calcASPD(char: Character, weaponAspdModifier: number = 0): number {
  const { agi, dex } = char.stats;
  
  let effectiveDex = dex;
  if (char.learnedSkills["owl_eye"] > 0) {
    effectiveDex += Math.floor(dex * (char.learnedSkills["owl_eye"] * 0.10));
  }
  
  // Base ASPD is 1 attack per 1.5 seconds (0.66 attacks/sec)
  // Max ASPD is roughly 3 attacks per second (like RO 190 ASPD)
  const baseASPD = 0.66; 
  
  // AGI provides the bulk of ASPD, DEX provides a small amount
  const aspdBonus = (agi * 0.02) + (effectiveDex * 0.005);
  
  const rawASPD = baseASPD + aspdBonus;
  
  // Apply weapon modifier (e.g., bow = -10%, sword = +15%)
  const finalASPD = rawASPD * (1 + weaponAspdModifier);
  
  return Math.min(3.0, Math.max(0.3, finalASPD)); // Min 0.3, max 3.0 attacks/sec
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
