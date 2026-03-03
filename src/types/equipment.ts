export type EquipmentType = 
  | "weapon" 
  | "armor" 
  | "head" 
  | "garment" 
  | "footgear" 
  | "accessory";

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
  atk?: number;        // Attack power (weapons)
  def?: number;        // Defense (armor, head, garment, footgear)
  slots?: number;      // Card slots (0-4)
  weight?: number;     // Weight in RO style
  refinement?: number; // +0 to +10 refine level
  
  // Bonus stats
  str?: number;
  agi?: number;
  vit?: number;
  int?: number;
  dex?: number;
  luk?: number;
  
  // Legacy support
  stat?: number;       // For backward compatibility
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
export function getEquipmentIcon(type: EquipmentType): string {
  const icons: Record<EquipmentType, string> = {
    weapon: "⚔️",
    armor: "🛡️",
    head: "🎩",
    garment: "🧥",
    footgear: "👢",
    accessory: "💍",
  };
  return icons[type];
}

// Helper to get rarity color
export function getRarityColor(rarity: EquipmentRarity): string {
  const colors: Record<EquipmentRarity, string> = {
    common: "#9ca3af",      // Gray
    uncommon: "#22c55e",    // Green
    rare: "#3b82f6",        // Blue
    epic: "#a855f7",        // Purple
    legendary: "#f59e0b",   // Orange/Gold
  };
  return colors[rarity];
}

// Helper to calculate Gear Score (Combat Power) for a single item
export function calculateGearScore(item: Equipment): number {
  if (!item) return 0;
  
  let score = 0;
  
  // Base stats weight
  score += (item.atk || 0) * 2;
  score += (item.def || 0) * 1.5;
  score += (item.stat || 0) * 2; // Legacy stat support (usually atk or def)
  
  // Bonus stats weight (very valuable)
  const stats = ['str', 'agi', 'vit', 'int', 'dex', 'luk'] as const;
  stats.forEach(stat => {
    score += (item[stat] || 0) * 5;
  });
  
  // Refinement bonus
  if (item.refinement) {
    score += item.refinement * 3;
  }
  
  return Math.floor(score);
}

// Helper to calculate total stats from equipment
export function calculateEquipmentStats(equipped: EquippedItems): {
  totalAtk: number;
  totalDef: number;
  bonusStr: number;
  bonusAgi: number;
  bonusVit: number;
  bonusInt: number;
  bonusDex: number;
  bonusLuk: number;
} {
  const items = Object.values(equipped).filter((item): item is Equipment => item !== null);
  
  return {
    totalAtk: items.reduce((sum, item) => {
      const refineBonus = item.type === 'weapon' ? (item.refinement || 0) * 5 : 0;
      const baseAtk = item.atk || (item.type === 'weapon' ? (item.stat || 0) : 0);
      return sum + baseAtk + refineBonus;
    }, 0),
    totalDef: items.reduce((sum, item) => {
      const armorTypes = ['armor', 'head', 'garment', 'footgear'];
      const refineBonus = armorTypes.includes(item.type) ? (item.refinement || 0) * 2 : 0;
      const baseDef = item.def || (item.type === 'armor' ? (item.stat || 0) : 0);
      return sum + baseDef + refineBonus;
    }, 0),
    bonusStr: items.reduce((sum, item) => sum + (item.str || 0), 0),
    bonusAgi: items.reduce((sum, item) => sum + (item.agi || 0), 0),
    bonusVit: items.reduce((sum, item) => sum + (item.vit || 0), 0),
    bonusInt: items.reduce((sum, item) => sum + (item.int || 0), 0),
    bonusDex: items.reduce((sum, item) => sum + (item.dex || 0), 0),
    bonusLuk: items.reduce((sum, item) => sum + (item.luk || 0), 0),
  };
}
