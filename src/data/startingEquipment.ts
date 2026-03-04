import { Equipment } from "../types/equipment";

/**
 * Starting Equipment System
 * 
 * Provides basic equipment to new players to make Zone 1 viable.
 * Without starting equipment, the game is mathematically unwinnable.
 */

// Generate unique IDs for starting equipment
// Use negative numbers to avoid conflicts with loot generation
let equipmentIdCounter = -1000;
function generateId(): number {
  return equipmentIdCounter--;
}

/**
 * Creates a Training Knife for new players
 * Basic weapon that makes early combat possible
 */
export function createTrainingKnife(): Equipment {
  return {
    id: generateId(),
    name: "Training Knife",
    type: "weapon",
    rarity: "common",
    atk: 8,
    weaponLevel: 1,
    refinement: 0,
    slots: 0,
    weight: 40,
  };
}

/**
 * Creates Cotton Shirt for new players
 * Basic armor providing minimal defense
 */
export function createCottonShirt(): Equipment {
  return {
    id: generateId(),
    name: "Cotton Shirt",
    type: "armor",
    rarity: "common",
    def: 5,
    refinement: 0,
    slots: 0,
    weight: 10,
  };
}

/**
 * Creates Novice Slippers for movement speed fantasy
 * Provides small defensive bonus
 */
export function createNoviceSlippers(): Equipment {
  return {
    id: generateId(),
    name: "Novice Slippers",
    type: "footgear",
    rarity: "common",
    def: 2,
    refinement: 0,
    slots: 0,
    weight: 20,
  };
}

/**
 * Get complete starting equipment set
 * Returns array of all starting items
 */
export function getStartingEquipment(): Equipment[] {
  return [
    createTrainingKnife(),
    createCottonShirt(),
    createNoviceSlippers(),
  ];
}

/**
 * Get starting inventory (unequipped items)
 * For now, just returns empty array
 * Could add starting consumables here
 */
export function getStartingInventory(): Equipment[] {
  return [];
}

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