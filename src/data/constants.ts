// Game balance constants
export const KILLS_FOR_BOSS = 10;

// Boss multipliers
export const BOSS_HP_MULTIPLIER = 5;
export const BOSS_ATK_MULTIPLIER = 1.5;
export const BOSS_DEF_MULTIPLIER = 1.3;

// Potion costs and effects
export const HP_POTION_COST = 50;
export const MP_POTION_COST = 100;
export const HP_POTION_HEAL_PERCENT = 0.5; // 50% of max HP
export const MP_POTION_RECOVER_PERCENT = 0.5; // 50% of max MP

// Loot drop chance
export const DROP_CHANCE = 0.20; // 20% chance per kill

// REFINEMENT SYSTEM
// Material costs scale with refinement bracket
export const REFINEMENT_MATERIAL_COSTS: Record<number, number> = {
  0: 1, 1: 1, 2: 1,  // +0 to +3: 1 material
  3: 2, 4: 2, 5: 2,  // +4 to +6: 2 materials
  6: 3, 7: 3,        // +7 to +8: 3 materials
  8: 4,              // +9: 4 materials
  9: 5,              // +10: 5 materials
};

// Gold cost multiplier (reduced from 750 to 250)
export const REFINEMENT_GOLD_MULTIPLIER = 250;

// Base refinement bonuses (flat per level)
export const REFINEMENT_WEAPON_BONUS = 2;  // +2 ATK/MATK per refine level
export const REFINEMENT_ARMOR_BONUS = 1;   // +1 DEF per refine level

// Rarity multipliers for refinement at +7 and above
export const RARITY_REFINE_BONUS = {
  common: 1.0,      // No bonus (base)
  uncommon: 1.0,    // No bonus (base)
  rare: 1.5,        // +50% bonus at +7+
  epic: 2.0,        // +100% bonus at +7+
  legendary: 3.0,   // +200% bonus at +7+
};
