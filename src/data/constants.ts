export const CRIT_MULTIPLIER = 1.5;
export const HP_POTION_COST = 50;
export const MP_POTION_COST = 50;
export const HP_POTION_HEAL_PERCENT = 0.2; // 20% of Max HP
export const HP_POTION_HEAL_FLAT = 50; // Flat 50 HP (was 200, reduced for early-game balance)
export const MP_POTION_RECOVER_PERCENT = 0.5;
export const KILLS_FOR_BOSS = 10;

// BALANCE: Drastically increased boss difficulty for proper endgame challenge
// Final boss (Thanatos) should REQUIRE legendary equipment with +8-10 refinement
export const BOSS_HP_MULTIPLIER = 8;         // Was 5 - Now 13,040 HP (was 8,150)
export const BOSS_ATK_MULTIPLIER = 2.5;       // Was 1.5 - Now 900 ATK (was 540)
export const BOSS_ARMOR_PENETRATION = 25;     // Was 15% - Now ignores 25% of player DEF/MDEF
export const BOSS_DEF_MULTIPLIER = 2.8;       // Was 2 - Now 274 Soft DEF (was 196)
// Boss Hard DEF will be capped at 70% in useGameState.ts (up from 52%)

export const DROP_CHANCE = 0.2;
export const MAX_LOGS = 50;

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