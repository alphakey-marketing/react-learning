import { REFINEMENT_WEAPON_BONUS, REFINEMENT_ARMOR_BONUS, RARITY_REFINE_BONUS } from "../data/constants";

export type EquipmentType = 
  | "weapon" 
  | "armor" 
  | "head" 
  | "garment" 
  | "footgear" 
  | "accessory"
  | "consumable"
  | "quest";

export type WeaponType = "sword" | "bow" | "wand";

export type EquipmentRarity = 
  | "common" 
  | "uncommon" 
  | "rare" 
  | "epic" 
  | "legendary";

export interface Equipment {
  id: number;
  name: string;
  type: EquipmentType;
  rarity: EquipmentRarity;
  
  // RO-style stats
  atk?: number;
  matk?: number;
  def?: number;
  mdef?: number;
  slots?: number;
  weight?: number;
  refinement?: number;
  weaponLevel?: number;
  weaponType?: WeaponType;
  
  // Bonus stats
  str?: number;
  agi?: number;
  vit?: number;
  int?: number;
  dex?: number;
  luk?: number;
  
  // Legacy support
  stat?: number;

  // Consumable-specific
  quantity?: number;
  hpRestore?: number;
  mpRestore?: number;
}

export interface EquippedItems {
  weapon: Equipment | null;
  armor: Equipment | null;
  head: Equipment | null;
  garment: Equipment | null;
  footgear: Equipment | null;
  accessory1: Equipment | null;
  accessory2: Equipment | null;
}

// Helper to get equipment icon
export function getEquipmentIcon(itemOrType: Equipment | EquipmentType): string {
  const type = typeof itemOrType === 'string' ? itemOrType : itemOrType.type;
  const weaponType = typeof itemOrType === 'string' ? undefined : (itemOrType as Equipment).weaponType;

  if (type === "weapon" && weaponType) {
    const weaponIcons: Record<WeaponType, string> = {
      sword: "🗡️",
      bow: "🏹",
      wand: "🪄",
    };
    return weaponIcons[weaponType] || "⚔️";
  }

  if (type === "consumable") {
    if (typeof itemOrType !== 'string') {
      const name = (itemOrType as Equipment).name.toLowerCase();
      if (name.includes("mp") || name.includes("mana") || name.includes("blue")) return "💧";
      if (name.includes("hp") || name.includes("health") || name.includes("red")) return "🧪";
    }
    return "🧪";
  }

  const icons: Record<EquipmentType, string> = {
    weapon: "⚔️",
    armor: "🛡️",
    head: "🎩",
    garment: "🧥",
    footgear: "👢",
    accessory: "💍",
    consumable: "🧪",
    quest: "📜",
  };
  return icons[type] ?? "❓";
}

// Helper to get weapon type icon
export function getWeaponTypeIcon(weaponType?: WeaponType): string {
  if (!weaponType) return "⚔️";
  const icons: Record<WeaponType, string> = {
    sword: "🗡️",
    bow: "🏹",
    wand: "🪄",
  };
  return icons[weaponType];
}

// Helper to get rarity color
export function getRarityColor(rarity: EquipmentRarity): string {
  const colors: Record<EquipmentRarity, string> = {
    common: "#9ca3af",
    uncommon: "#22c55e",
    rare: "#3b82f6",
    epic: "#a855f7",
    legendary: "#f59e0b",
  };
  return colors[rarity];
}

// Calculate refinement bonus with rarity multiplier
// At +7 and above, higher rarity items get bigger bonuses
export function calculateRefinementBonus(
  item: Equipment,
  baseBonus: number
): number {
  const refineLevel = item.refinement || 0;
  
  if (refineLevel === 0) return 0;
  
  // +0 to +6: Flat bonus for all rarities
  if (refineLevel <= 6) {
    return baseBonus * refineLevel;
  }
  
  // +7 to +10: Apply rarity multiplier to the +7+ levels
  const normalLevels = 6;
  const bonusLevels = refineLevel - normalLevels;
  const rarityMultiplier = RARITY_REFINE_BONUS[item.rarity];
  
  return (baseBonus * normalLevels) + (baseBonus * rarityMultiplier * bonusLevels);
}

// Calculate Gear Score with TYPE SPECIALIZATION
// Consumables and quest items return 0 — they have no gear score
export function calculateGearScore(item: Equipment): number {
  if (!item) return 0;
  if (item.type === "consumable" || item.type === "quest") return 0;
  
  let score = 0;
  
  const isWeapon = item.type === 'weapon';
  const isArmor = ['armor', 'head', 'garment', 'footgear'].includes(item.type);
  
  // ATK/MATK: ONLY for weapons (includes refinement bonuses)
  if (isWeapon) {
    const weaponRefineBonus = calculateRefinementBonus(item, REFINEMENT_WEAPON_BONUS);
    score += ((item.atk || 0) + weaponRefineBonus) * 2;
    score += ((item.matk || 0) + weaponRefineBonus) * 2;
    
    if (item.weaponLevel) {
      score += item.weaponLevel * 5;
    }
  }
  
  // DEF/MDEF: ONLY for armor types (includes refinement bonuses)
  if (isArmor) {
    const armorRefineBonus = calculateRefinementBonus(item, REFINEMENT_ARMOR_BONUS);
    score += ((item.def || 0) + armorRefineBonus) * 1.5;
    score += ((item.mdef || 0) + Math.floor(armorRefineBonus * 0.5)) * 2;
  }
  
  // Bonus stats: ALL equipment types can have these
  const stats = ['str', 'agi', 'vit', 'int', 'dex', 'luk'] as const;
  stats.forEach(stat => {
    score += (item[stat] || 0) * 5;
  });
  
  // Refinement bonus for non-accessories (already counted above in ATK/DEF)
  if (item.type !== 'accessory' && item.refinement) {
    score += item.refinement * 3;
  }
  
  return Math.floor(score);
}

// Calculate total stats from equipment with WEAPON TYPE support
export function calculateEquipmentStats(equipped: EquippedItems): {
  weaponAtk: number;
  weaponMatk: number;
  weaponLevel: number;
  weaponRefine: number;
  weaponType: WeaponType | null;
  equipBonusAtk: number;
  totalDef: number;
  totalMdef: number;
  bonusStr: number;
  bonusAgi: number;
  bonusVit: number;
  bonusInt: number;
  bonusDex: number;
  bonusLuk: number;
} {
  const items = Object.values(equipped).filter((item): item is Equipment => item !== null);
  
  // === WEAPONS: ATK or MATK with refinement bonuses ===
  const weapon = equipped.weapon;
  let weaponAtk = 0;
  let weaponMatk = 0;
  
  if (weapon) {
    const refineBonus = calculateRefinementBonus(weapon, REFINEMENT_WEAPON_BONUS);
    if (weapon.weaponType !== 'wand') {
      weaponAtk = (weapon.atk || 0) + refineBonus;
    } else {
      weaponMatk = (weapon.matk || 0) + refineBonus;
    }
  }
  
  const weaponLevel = weapon?.weaponLevel || 1;
  const weaponRefine = weapon?.refinement || 0;
  const weaponType = weapon?.weaponType || null;
  
  // Non-weapon items do not provide ATK
  const equipBonusAtk = 0;

  // === ARMOR TYPES: DEF & MDEF with refinement bonuses ===
  const defenseSlots: EquipmentType[] = ['armor', 'head', 'garment', 'footgear'];
  
  const totalDef = items.reduce((sum, item) => {
    if (!defenseSlots.includes(item.type)) return sum;
    const baseDef = item.def || 0;
    const refineBonus = calculateRefinementBonus(item, REFINEMENT_ARMOR_BONUS);
    return sum + baseDef + refineBonus;
  }, 0);

  const totalMdef = items.reduce((sum, item) => {
    if (!defenseSlots.includes(item.type)) return sum;
    const baseMdef = item.mdef || 0;
    const refineBonus = Math.floor(calculateRefinementBonus(item, REFINEMENT_ARMOR_BONUS) * 0.5);
    return sum + baseMdef + refineBonus;
  }, 0);

  // === BONUS STATS: ALL EQUIPMENT ===
  return {
    weaponAtk,
    weaponMatk,
    weaponLevel,
    weaponRefine,
    weaponType,
    equipBonusAtk,
    totalDef,
    totalMdef,
    bonusStr: items.reduce((sum, item) => sum + (item.str || 0), 0),
    bonusAgi: items.reduce((sum, item) => sum + (item.agi || 0), 0),
    bonusVit: items.reduce((sum, item) => sum + (item.vit || 0), 0),
    bonusInt: items.reduce((sum, item) => sum + (item.int || 0), 0),
    bonusDex: items.reduce((sum, item) => sum + (item.dex || 0), 0),
    bonusLuk: items.reduce((sum, item) => sum + (item.luk || 0), 0),
  };
}