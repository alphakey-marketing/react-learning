import { Equipment } from "../types/equipment";

/**
 * Starting Equipment System
 * 
 * Provides basic equipment to new players to make Zone 1 viable.
 * Uses hardcoded negative IDs to prevent conflicts with loot generation
 * and avoid React Strict Mode double-render bugs.
 */

export const STARTING_WEAPON: Equipment = {
  id: -1000,
  name: "Training Knife",
  type: "weapon",
  weaponType: "sword",
  rarity: "common",
  atk: 8,
  weaponLevel: 1,
  refinement: 0,
  slots: 0,
  weight: 40,
};

/**
 * BALANCE: Novice Wand for INT-based builds
 * Provides 8 MATK to match Training Knife's 8 ATK
 * Allows magic-focused Novices to be viable before job change
 */
export const NOVICE_WAND: Equipment = {
  id: -1004,
  name: "Novice Wand",
  type: "weapon",
  weaponType: "wand",
  rarity: "common",
  matk: 8,
  weaponLevel: 1,
  refinement: 0,
  slots: 0,
  weight: 30,
};

export const STARTING_ARMOR: Equipment = {
  id: -1001,
  name: "Cotton Shirt",
  type: "armor",
  rarity: "common",
  def: 5,
  refinement: 0,
  slots: 0,
  weight: 10,
};

export const STARTING_FOOTGEAR: Equipment = {
  id: -1002,
  name: "Novice Slippers",
  type: "footgear",
  rarity: "common",
  def: 2,
  refinement: 0,
  slots: 0,
  weight: 20,
};

/**
 * BALANCE: Improved starter wand for Mage job change
 * Provides 12 MATK instead of 8, helping early Mage/Wizard viability
 */
export const STARTING_WAND: Equipment = {
  id: -1003,
  name: "Apprentice Wand",
  type: "weapon",
  weaponType: "wand",
  rarity: "common",
  matk: 12,  // Higher than Training Knife's 8 ATK
  weaponLevel: 1,
  refinement: 0,
  slots: 0,
  weight: 30,
};

/**
 * Configuration for starting resources
 */
export const STARTING_RESOURCES = {
  hpPotions: 5,        // Start with 5 HP potions for learning
  mpPotions: 3,        // Start with 3 MP potions
  gold: 100,           // Start with 100 gold for emergency purchases
  elunium: 0,          // No starting refine materials
  oridecon: 0,
};

/**
 * Tutorial hints for starting equipment
 */
export const STARTING_EQUIPMENT_TUTORIAL = {
  title: "You received starting equipment!",
  messages: [
    "🗡️ Training Knife equipped - Provides basic attack power",
    "🛡️ Cotton Shirt equipped - Reduces damage taken",
    "👟 Novice Slippers equipped - Basic foot protection",
    "🍖 5 HP Potions - Use them when your health is low!",
    "💡 TIP: Invest your 12 stat points before entering Zone 1!",
  ],
};