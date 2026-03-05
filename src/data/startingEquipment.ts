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