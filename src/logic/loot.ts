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

export function generateLoot(playerLevel: number): Equipment {
  // Random equipment type
  const types: EquipmentType[] = ["weapon", "armor", "head", "garment", "footgear", "accessory"];
  const type = types[Math.floor(Math.random() * types.length)];
  
  // Random name from pool
  const names = EQUIPMENT_NAMES[type];
  const baseName = names[Math.floor(Math.random() * names.length)];
  
  // Calculate stats based on player level
  const baseValue = Math.floor(Math.random() * 5) + 1 + Math.floor(playerLevel * 1.5);
  const refinement = Math.random() > 0.7 ? Math.floor(Math.random() * 4) + 1 : 0;
  
  // Determine rarity
  let rarity: EquipmentRarity;
  const rarityRoll = Math.random();
  if (rarityRoll > 0.95) rarity = "legendary";
  else if (rarityRoll > 0.85) rarity = "epic";
  else if (rarityRoll > 0.65) rarity = "rare";
  else if (rarityRoll > 0.40) rarity = "uncommon";
  else rarity = "common";
  
  // Build equipment
  const equipment: Equipment = {
    id: Date.now() + Math.random(),
    name: baseName,
    type,
    rarity,
    refinement,
    slots: Math.floor(Math.random() * 3),
    weight: type === "weapon" ? 50 : type === "armor" ? 80 : 20,
  };
  
  // Add appropriate stats
  if (type === "weapon") {
    equipment.atk = baseValue + refinement * 2;
  } else {
    equipment.def = Math.floor(baseValue * 0.8) + refinement;
  }
  
  // Random bonus stat (20% chance)
  if (Math.random() > 0.8) {
    const statTypes = ["str", "agi", "vit", "int", "dex", "luk"];
    const bonusStat = statTypes[Math.floor(Math.random() * statTypes.length)];
    const bonusValue = Math.floor(Math.random() * 3) + 1;
    (equipment as any)[bonusStat] = bonusValue;
  }
  
  // Legacy support
  equipment.stat = equipment.atk || equipment.def || baseValue;
  
  return equipment;
}

export function generateBossLoot(playerLevel: number): Equipment {
  const types: EquipmentType[] = ["weapon", "armor", "head", "garment", "footgear", "accessory"];
  const type = types[Math.floor(Math.random() * types.length)];
  
  const names = EQUIPMENT_NAMES[type];
  const baseName = names[Math.floor(Math.random() * names.length)];
  
  // Boss drops are always good
  const baseValue = Math.floor(Math.random() * 10) + 5 + Math.floor(playerLevel * 2);
  const refinement = Math.floor(Math.random() * 5) + 3; // +3 to +7
  
  // Boss drops have better rarity
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
  
  if (type === "weapon") {
    equipment.atk = baseValue + refinement * 3;
  } else {
    equipment.def = Math.floor(baseValue * 0.8) + refinement * 2;
  }
  
  // Boss items always have bonus stats
  const statTypes = ["str", "agi", "vit", "int", "dex", "luk"];
  const numBonuses = Math.floor(Math.random() * 2) + 1; // 1-2 bonus stats
  
  for (let i = 0; i < numBonuses; i++) {
    const bonusStat = statTypes[Math.floor(Math.random() * statTypes.length)];
    const bonusValue = Math.floor(Math.random() * 4) + 2; // +2 to +5
    (equipment as any)[bonusStat] = bonusValue;
  }
  
  equipment.stat = equipment.atk || equipment.def || baseValue;
  
  return equipment;
}
