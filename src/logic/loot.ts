import { Equipment, EquipmentType, EquipmentRarity, WeaponType } from "../types/equipment";
import { DROP_CHANCE } from "../data/constants";
import { QUEST_ITEMS } from "../data/quests";
import { getCorruptionModifiers, CorruptionModifiers } from "./corruption";

// RO-inspired equipment names
const EQUIPMENT_NAMES: Omit<Record<EquipmentType, string[]>, "weapon"> = {
  armor: [
    "Cotton Shirt", "Padded Armor", "Chain Mail", "Full Plate",
    "Saint's Robe", "Formal Suit", "Tights", "Silver Robe", "Glittering Jacket",
    "Heavy Chestplate", "Leather Vest", "Mithril Armor"
  ],
  head: [
    "Bandana", "Circlet", "Goggles", "Biretta", "Helm",
    "Crown", "Feather Beret", "Unicorn Horn", "Angel Wing", "Dragon Helm",
    "Pointy Hat", "Iron Cap", "Bone Mask"
  ],
  garment: [
    "Muffler", "Manteau", "Cape", "Ragamuffin Manteau",
    "Heavenly Maiden Robe", "Survivor's Manteau", "Noxious", "Asprika",
    "Leather Cloak", "Silk Mantle", "Tattered Shawl"
  ],
  footgear: [
    "Sandals", "Shoes", "Boots", "Crystal Pumps",
    "Sleipnir", "Green Boots", "Variant Shoes", "Shukabu",
    "Roller Skates", "Ice Skates", "Steel Greaves", "Heavy Sabatons", "Leather Sneakers", "Cloth Slippers"
  ],
  accessory: [
    "Ring", "Earring", "Glove", "Brooch", "Clip",
    "Rosary", "Safety Ring", "Celebrant's Glove", "Orleans Glove", "Megingjard",
    "Silver Necklace", "Jade Pendant", "Gold Bracelet", "Ruby Amulet"
  ],
};

const WEAPON_NAMES: Record<WeaponType, string[]> = {
  sword: ["Knife", "Cutter", "Main Gauche", "Stiletto", "Gladius", "Damascus", "Katana", "Claymore", "Excalibur", "Broadsword", "Rapier"],
  bow: ["Bow", "Crossbow", "Composite Bow", "Gakkung", "Arbalest", "Hunter Bow", "Elven Bow", "Rudra Bow", "Longbow", "Shortbow"],
  wand: ["Rod", "Wand", "Staff", "Arc Wand", "Mighty Staff", "Piercing Staff", "Wizardry Staff", "Staff of Destruction", "Scepter", "Cane"],
};

export function shouldDropLoot(): boolean {
  return Math.random() < DROP_CHANCE;
}

// Helper to determine weapon level based on rarity
function getWeaponLevel(rarity: EquipmentRarity): number {
  switch (rarity) {
    case "legendary": return 4;
    case "epic": return 4;
    case "rare": return 3;
    case "uncommon": return 2;
    case "common":
    default: return 1;
  }
}

// PROGRESSIVE RARITY SYSTEM: Rarity chances based on player level (zone progression)
function determineRarity(playerLevel: number): EquipmentRarity {
  const rarityRoll = Math.random();
  
  // Zone 1-2 (Lv 1-10): Common/Uncommon heavy, rare is rare, no epic/legendary
  if (playerLevel <= 10) {
    if (rarityRoll > 0.95) return "rare";      // 5%
    if (rarityRoll > 0.60) return "uncommon";  // 35%
    return "common";                           // 60%
  }
  
  // Zone 3-4 (Lv 11-20): Introduce Epic, increase Rare
  if (playerLevel <= 20) {
    if (rarityRoll > 0.97) return "epic";      // 3%
    if (rarityRoll > 0.75) return "rare";      // 22%
    if (rarityRoll > 0.30) return "uncommon";  // 45%
    return "common";                           // 30%
  }
  
  // Zone 5-6 (Lv 21-30): Introduce Legendary, Epic more common
  if (playerLevel <= 30) {
    if (rarityRoll > 0.98) return "legendary"; // 2%
    if (rarityRoll > 0.80) return "epic";      // 18%
    if (rarityRoll > 0.40) return "rare";      // 40%
    if (rarityRoll > 0.10) return "uncommon";  // 30%
    return "common";                           // 10%
  }
  
  // Zone 7+ (Lv 31+): Endgame loot, no more common drops
  if (rarityRoll > 0.85) return "legendary";   // 15%
  if (rarityRoll > 0.40) return "epic";        // 45%
  if (rarityRoll > 0.10) return "rare";        // 30%
  return "uncommon";                           // 10%
}

// Corruption bias roll — gives a chance to skip to a higher rarity tier before normal table
function determineRarityWithBias(
  playerLevel: number,
  bias: CorruptionModifiers["rarityBias"]
): EquipmentRarity {
  const biasRoll = Math.random() * 100;
  if (bias.legendary && biasRoll < bias.legendary) return "legendary";
  if (bias.epic && biasRoll < bias.epic) return "epic";
  if (bias.rare && biasRoll < bias.rare) return "rare";
  if (bias.uncommon && biasRoll < bias.uncommon) return "uncommon";
  return determineRarity(playerLevel);
}

// Boss loot rarity based on zone
function determineBossRarity(playerLevel: number): EquipmentRarity {
  const rarityRoll = Math.random();
  
  // Zone 1-2 boss: Guaranteed Rare
  if (playerLevel <= 10) {
    return "rare";
  }
  
  // Zone 3-4 boss: Rare 70% / Epic 30%
  if (playerLevel <= 20) {
    return rarityRoll > 0.70 ? "epic" : "rare";
  }
  
  // Zone 5-6 boss: Epic 60% / Legendary 40%
  if (playerLevel <= 30) {
    return rarityRoll > 0.60 ? "legendary" : "epic";
  }
  
  // Zone 7+ boss: Legendary guaranteed
  return "legendary";
}

// Phase 3: Equipment Type Specialization
// Different equipment types provide different bonuses matching Classic RO design
function generateStatsByType(
  type: EquipmentType,
  baseValue: number,
  refinement: number,
  rarity: EquipmentRarity,
  weaponSubType?: WeaponType
): Partial<Equipment> {
  const stats: Partial<Equipment> = {};

  // RARITY STAT MULTIPLIERS: Higher rarity = better base stats
  const rarityMultiplier = {
    common: 1.0,
    uncommon: 1.3,
    rare: 1.7,
    epic: 2.2,
    legendary: 3.0,
  }[rarity];
  
  const adjustedBaseValue = Math.floor(baseValue * rarityMultiplier);

  switch (type) {
    case "weapon":
      // Weapons: ATK for physical, MATK for wands
      stats.weaponLevel = getWeaponLevel(rarity);
      stats.weaponType = weaponSubType || "sword";
      // Scale weapon ATK with baseValue (level-appropriate)
      const weaponBaseValue = adjustedBaseValue + (stats.weaponLevel * 3);
      if (stats.weaponType === "wand") {
        stats.matk = weaponBaseValue + refinement * 5;
      } else {
        stats.atk = weaponBaseValue + refinement * 5;
      }
      break;

    case "armor":
      // Armor: Primary DEF + MDEF source (highest multiplier)
      stats.def = Math.floor(adjustedBaseValue * 0.8) + refinement * 3;
      if (stats.def === 0) stats.def = 2;
      // MDEF: roughly 60-70% of DEF value
      stats.mdef = Math.floor(stats.def * 0.65) + refinement * 1;
      if (stats.mdef === 0) stats.mdef = 1;
      break;

    case "head":
      // Headgear: Medium DEF + MDEF + stat bonuses (utility focus)
      stats.def = Math.floor(adjustedBaseValue * 0.5) + refinement * 2;
      if (stats.def === 0) stats.def = 1;
      stats.mdef = Math.floor(stats.def * 0.6) + refinement * 1;
      // 40% chance for stat bonus (higher than other slots)
      if (Math.random() > 0.6) {
        const statTypes = ["str", "agi", "vit", "int", "dex", "luk"];
        const bonusStat = statTypes[Math.floor(Math.random() * statTypes.length)];
        const bonusValue = Math.floor(Math.random() * 2) + 1; // +1 to +2
        (stats as any)[bonusStat] = bonusValue;
      }
      break;

    case "garment":
      // Garment: Light DEF + MDEF + resistance/utility focus
      stats.def = Math.floor(adjustedBaseValue * 0.4) + refinement * 2;
      if (stats.def === 0) stats.def = 1;
      stats.mdef = Math.floor(stats.def * 0.5);
      // 25% chance for stat bonus (defensive stats preferred)
      if (Math.random() > 0.75) {
        const statTypes = ["vit", "agi", "int"]; // Defense-oriented stats
        const bonusStat = statTypes[Math.floor(Math.random() * statTypes.length)];
        const bonusValue = 1;
        (stats as any)[bonusStat] = bonusValue;
      }
      break;

    case "footgear":
      // Footgear: Minimal DEF + MDEF + mobility (AGI/DEX focus)
      stats.def = Math.floor(adjustedBaseValue * 0.3) + refinement * 1;
      if (stats.def === 0) stats.def = 1;
      stats.mdef = Math.floor(stats.def * 0.4);
      // 30% chance for AGI/DEX bonus
      if (Math.random() > 0.7) {
        const statTypes = ["agi", "dex"];
        const bonusStat = statTypes[Math.floor(Math.random() * statTypes.length)];
        const bonusValue = 1;
        (stats as any)[bonusStat] = bonusValue;
      }
      break;

    case "accessory":
      // Accessory: No DEF/MDEF, pure stat bonuses
      // 60% chance for stat bonus (main purpose)
      if (Math.random() > 0.4) {
        const statTypes = ["str", "agi", "vit", "int", "dex", "luk"];
        const bonusStat = statTypes[Math.floor(Math.random() * statTypes.length)];
        // Higher rarity = better stat bonuses
        let bonusValue = 1;
        if (rarity === "legendary") bonusValue = 4;
        else if (rarity === "epic") bonusValue = 3;
        else if (rarity === "rare") bonusValue = 2;
        (stats as any)[bonusStat] = bonusValue;
      }
      break;
  }

  return stats;
}

export function generateLoot(playerLevel: number, corruptionLevel = 0): Equipment {
  // Random equipment type
  const types: EquipmentType[] = ["weapon", "armor", "head", "garment", "footgear", "accessory"];
  const type = types[Math.floor(Math.random() * types.length)];
  
  let baseName = "";
  let weaponSubType: WeaponType | undefined = undefined;

  if (type === "weapon") {
    const subTypes: WeaponType[] = ["sword", "bow", "wand"];
    weaponSubType = subTypes[Math.floor(Math.random() * subTypes.length)];
    const names = WEAPON_NAMES[weaponSubType];
    baseName = names[Math.floor(Math.random() * names.length)];
  } else {
    const names = EQUIPMENT_NAMES[type as keyof typeof EQUIPMENT_NAMES];
    baseName = names[Math.floor(Math.random() * names.length)];
  }
  
  // Base value scales with player level
  // Tuned to match enemy power curve: Zone 1 (~level 3) → Zone 8 (~level 38)
  const baseValue = Math.floor(Math.random() * 5) + 1 + Math.floor(playerLevel * 1.2);
  
  // Refinement chance: 15% for +1 to +4
  const refinement = Math.random() > 0.85 ? Math.floor(Math.random() * 4) + 1 : 0;
  
  // ZONE-PROGRESSIVE RARITY with corruption bias
  const rarity = determineRarityWithBias(playerLevel, getCorruptionModifiers(corruptionLevel).rarityBias);
  
  // Generate base equipment
  const equipment: Equipment = {
    id: Date.now() + Math.random(),
    name: baseName,
    type,
    rarity,
    refinement,
    slots: Math.floor(Math.random() * 3),
    weight: type === "weapon" ? 50 : type === "armor" ? 80 : 20,
  };
  
  // Apply type-specific stats
  const typeStats = generateStatsByType(type, baseValue, refinement, rarity, weaponSubType);
  Object.assign(equipment, typeStats);
  
  // Legacy support for old systems
  equipment.stat = equipment.atk || equipment.matk || equipment.def || baseValue;
  
  return equipment;
}

export function generateBossLoot(playerLevel: number, corruptionLevel = 0): Equipment {
  const types: EquipmentType[] = ["weapon", "armor", "head", "garment", "footgear", "accessory"];
  const type = types[Math.floor(Math.random() * types.length)];
  
  let baseName = "";
  let weaponSubType: WeaponType | undefined = undefined;

  if (type === "weapon") {
    const subTypes: WeaponType[] = ["sword", "bow", "wand"];
    weaponSubType = subTypes[Math.floor(Math.random() * subTypes.length)];
    const names = WEAPON_NAMES[weaponSubType];
    baseName = names[Math.floor(Math.random() * names.length)];
  } else {
    const names = EQUIPMENT_NAMES[type as keyof typeof EQUIPMENT_NAMES];
    baseName = names[Math.floor(Math.random() * names.length)];
  }
  
  // Boss drops are significantly better
  const baseValue = Math.floor(Math.random() * 10) + 5 + Math.floor(playerLevel * 2.5);
  const refinement = Math.floor(Math.random() * 5) + 3; // +3 to +7
  
  // ZONE-PROGRESSIVE BOSS RARITY with corruption bias
  const { rarityBias } = getCorruptionModifiers(corruptionLevel);
  const bossBaseRarity = determineBossRarity(playerLevel);
  // Boss rarity is already elevated — bias only upgrades if bias roll exceeds boss rarity
  const rarityOrder: EquipmentRarity[] = ["common", "uncommon", "rare", "epic", "legendary"];
  const biasRoll = Math.random() * 100;
  let biasRarity: EquipmentRarity | null = null;
  if (rarityBias.legendary && biasRoll < rarityBias.legendary) biasRarity = "legendary";
  else if (rarityBias.epic && biasRoll < rarityBias.epic) biasRarity = "epic";
  const rarity = (biasRarity && rarityOrder.indexOf(biasRarity) > rarityOrder.indexOf(bossBaseRarity))
    ? biasRarity
    : bossBaseRarity;
  
  const equipment: Equipment = {
    id: Date.now() + Math.random(),
    name: `${baseName} [Boss]`,
    type,
    rarity,
    refinement,
    slots: Math.floor(Math.random() * 2) + 2, // 2-3 slots
    weight: type === "weapon" ? 50 : type === "armor" ? 80 : 20,
  };
  
  // Apply type-specific stats
  const typeStats = generateStatsByType(type, baseValue, refinement, rarity, weaponSubType);
  Object.assign(equipment, typeStats);
  
  // Boss items get EXTRA bonus stats (always at least 1, up to 2)
  const statTypes = ["str", "agi", "vit", "int", "dex", "luk"];
  const numBonuses = Math.floor(Math.random() * 2) + 1; // 1-2 bonus stats
  
  for (let i = 0; i < numBonuses; i++) {
    const bonusStat = statTypes[Math.floor(Math.random() * statTypes.length)];
    const currentValue = (equipment as any)[bonusStat] || 0;
    const bonusValue = Math.floor(Math.random() * 3) + 2; // +2 to +4
    (equipment as any)[bonusStat] = currentValue + bonusValue;
  }
  
  equipment.stat = equipment.atk || equipment.matk || equipment.def || baseValue;
  
  return equipment;
}

/**
 * Pure drop check for quest items. No side effects.
 *
 * @param enemyName - The raw enemy name (boss prefix stripped internally)
 * @param zoneId - Current zone ID
 * @param isBoss - Whether this is a boss kill
 * @param collectedQuestItemIds - IDs of quest items already in the player's inventory
 * @returns Equipment (type:"quest") if a quest item should drop, otherwise null
 */
export function checkQuestItemDrop(
  enemyName: string,
  zoneId: number,
  isBoss: boolean,
  collectedQuestItemIds: string[]
): Equipment | null {
  // Strip boss prefix so "👹 Boss: Poring" matches "Poring"
  const cleanName = enemyName.replace(/^👹 Boss: /, "");

  for (const qi of QUEST_ITEMS) {
    // Already collected — skip
    if (collectedQuestItemIds.includes(qi.id)) continue;

    const { drop } = qi;
    if (drop.zoneId !== zoneId) continue;
    if (drop.enemyName !== cleanName) continue;
    if (drop.isBossOnly && !isBoss) continue;

    // Roll for drop
    if (Math.random() < drop.dropChance) {
      const item: Equipment = {
        id: Date.now() + Math.random(),
        name: qi.name,
        type: "quest",
        rarity: "common",
        questItemId: qi.id,
      };
      return item;
    }
  }

  return null;
}
