import { Equipment, EquipmentType, EquipmentRarity } from "../types/equipment";
import { DROP_CHANCE } from "../data/constants";

// RO-inspired equipment names
const EQUIPMENT_NAMES: Record<EquipmentType, string[]> = {
  weapon: [
    "Knife", "Cutter", "Main Gauche", "Stiletto", "Gladius",
    "Damascus", "Sword Breaker", "Katana", "Claymore", "Excalibur",
  ],
  armor: [
    "Cotton Shirt", "Padded Armor", "Chain Mail", "Full Plate",
    "Saint's Robe", "Formal Suit", "Tights", "Silver Robe", "Glittering Jacket",
  ],
  head: [
    "Bandana", "Circlet", "Goggles", "Biretta", "Helm",
    "Crown", "Feather Beret", "Unicorn Horn", "Angel Wing", "Dragon Helm",
  ],
  garment: [
    "Muffler", "Manteau", "Cape", "Ragamuffin Manteau",
    "Heavenly Maiden Robe", "Survivor's Manteau", "Noxious", "Asprika",
  ],
  footgear: [
    "Sandals", "Shoes", "Boots", "Crystal Pumps",
    "Sleipnir", "Green Boots", "Variant Shoes", "Shukabu",
  ],
  accessory: [
    "Ring", "Earring", "Glove", "Brooch", "Clip",
    "Rosary", "Safety Ring", "Celebrant's Glove", "Orleans Glove", "Megingjard",
  ],
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

// Phase 3: Equipment Type Specialization
// Different equipment types provide different bonuses matching Classic RO design
function generateStatsByType(
  type: EquipmentType,
  baseValue: number,
  refinement: number,
  rarity: EquipmentRarity
): Partial<Equipment> {
  const stats: Partial<Equipment> = {};

  switch (type) {
    case "weapon":
      // Weapons: Pure ATK, weapon level controls variance
      stats.weaponLevel = getWeaponLevel(rarity);
      // Scale weapon ATK with baseValue (level-appropriate)
      const weaponBaseValue = baseValue + (stats.weaponLevel * 3);
      stats.atk = weaponBaseValue + refinement * 5;
      break;

    case "armor":
      // Armor: Primary DEF source (highest DEF multiplier)
      // Balanced to provide meaningful defense without reaching cap too early
      stats.def = Math.floor(baseValue * 0.8) + refinement * 3;
      if (stats.def === 0) stats.def = 2;
      break;

    case "head":
      // Headgear: Medium DEF + stat bonuses (utility focus)
      stats.def = Math.floor(baseValue * 0.5) + refinement * 2;
      if (stats.def === 0) stats.def = 1;
      // 40% chance for stat bonus (higher than other slots)
      if (Math.random() > 0.6) {
        const statTypes = ["str", "agi", "vit", "int", "dex", "luk"];
        const bonusStat = statTypes[Math.floor(Math.random() * statTypes.length)];
        const bonusValue = Math.floor(Math.random() * 2) + 1; // +1 to +2
        (stats as any)[bonusStat] = bonusValue;
      }
      break;

    case "garment":
      // Garment: Light DEF + resistance/utility focus
      stats.def = Math.floor(baseValue * 0.4) + refinement * 2;
      if (stats.def === 0) stats.def = 1;
      // 25% chance for stat bonus (defensive stats preferred)
      if (Math.random() > 0.75) {
        const statTypes = ["vit", "agi", "int"]; // Defense-oriented stats
        const bonusStat = statTypes[Math.floor(Math.random() * statTypes.length)];
        const bonusValue = 1;
        (stats as any)[bonusStat] = bonusValue;
      }
      break;

    case "footgear":
      // Footgear: Minimal DEF + mobility (AGI/DEX focus)
      stats.def = Math.floor(baseValue * 0.3) + refinement * 1;
      if (stats.def === 0) stats.def = 1;
      // 30% chance for AGI/DEX bonus
      if (Math.random() > 0.7) {
        const statTypes = ["agi", "dex"];
        const bonusStat = statTypes[Math.floor(Math.random() * statTypes.length)];
        const bonusValue = 1;
        (stats as any)[bonusStat] = bonusValue;
      }
      break;

    case "accessory":
      // Accessory: No DEF, pure stat bonuses
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

export function generateLoot(playerLevel: number): Equipment {
  // Random equipment type
  const types: EquipmentType[] = ["weapon", "armor", "head", "garment", "footgear", "accessory"];
  const type = types[Math.floor(Math.random() * types.length)];
  
  // Random name from pool
  const names = EQUIPMENT_NAMES[type];
  const baseName = names[Math.floor(Math.random() * names.length)];
  
  // Base value scales with player level
  // Tuned to match enemy power curve: Zone 1 (~level 3) → Zone 8 (~level 38)
  const baseValue = Math.floor(Math.random() * 5) + 1 + Math.floor(playerLevel * 1.2);
  
  // Refinement chance: 15% for +1 to +4
  const refinement = Math.random() > 0.85 ? Math.floor(Math.random() * 4) + 1 : 0;
  
  // Determine rarity
  let rarity: EquipmentRarity;
  const rarityRoll = Math.random();
  if (rarityRoll > 0.95) rarity = "legendary";
  else if (rarityRoll > 0.85) rarity = "epic";
  else if (rarityRoll > 0.65) rarity = "rare";
  else if (rarityRoll > 0.40) rarity = "uncommon";
  else rarity = "common";
  
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
  const typeStats = generateStatsByType(type, baseValue, refinement, rarity);
  Object.assign(equipment, typeStats);
  
  // Legacy support for old systems
  equipment.stat = equipment.atk || equipment.def || baseValue;
  
  return equipment;
}

export function generateBossLoot(playerLevel: number): Equipment {
  const types: EquipmentType[] = ["weapon", "armor", "head", "garment", "footgear", "accessory"];
  const type = types[Math.floor(Math.random() * types.length)];
  
  const names = EQUIPMENT_NAMES[type];
  const baseName = names[Math.floor(Math.random() * names.length)];
  
  // Boss drops are significantly better
  const baseValue = Math.floor(Math.random() * 10) + 5 + Math.floor(playerLevel * 2.5);
  const refinement = Math.floor(Math.random() * 5) + 3; // +3 to +7
  
  // Boss drops have better rarity distribution
  const rarityRoll = Math.random();
  const rarity: EquipmentRarity = rarityRoll > 0.7 ? "legendary" : "epic";
  
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
  const typeStats = generateStatsByType(type, baseValue, refinement, rarity);
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
  
  equipment.stat = equipment.atk || equipment.def || baseValue;
  
  return equipment;
}