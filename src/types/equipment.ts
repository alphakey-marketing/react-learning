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
  atk?: number;        // Attack power (weapons ONLY)
  def?: number;        // Defense (armor, head, garment, footgear ONLY)
  slots?: number;      // Card slots (0-4)
  weight?: number;     // Weight in RO style
  refinement?: number; // +0 to +10 refine level
  weaponLevel?: number; // Weapon level (1-4), affects variance
  
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

// Phase 3: Calculate Gear Score with TYPE SPECIALIZATION
// Only count stats that are actually relevant to each equipment type
export function calculateGearScore(item: Equipment): number {
  if (!item) return 0;
  
  let score = 0;
  
  const isWeapon = item.type === 'weapon';
  const isArmor = ['armor', 'head', 'garment', 'footgear'].includes(item.type);
  
  // ATK: ONLY for weapons
  if (isWeapon) {
    score += (item.atk || 0) * 2;
    
    // Weapon level bonus (only weapons have this)
    if (item.weaponLevel) {
      score += item.weaponLevel * 5;
    }
  }
  
  // DEF: ONLY for armor types
  if (isArmor) {
    score += (item.def || 0) * 1.5;
  }
  
  // Bonus stats: ALL equipment types can have these
  const stats = ['str', 'agi', 'vit', 'int', 'dex', 'luk'] as const;
  stats.forEach(stat => {
    score += (item[stat] || 0) * 5;
  });
  
  // Refinement bonus: All equipment except accessories
  if (item.type !== 'accessory' && item.refinement) {
    score += item.refinement * 3;
  }
  
  return Math.floor(score);
}

// Phase 3: Calculate total stats from equipment with TYPE SPECIALIZATION
// Weapons provide ATK only, armor slots provide DEF only, accessories provide stats only
export function calculateEquipmentStats(equipped: EquippedItems): {
  weaponAtk: number;
  weaponLevel: number;
  weaponRefine: number;
  equipBonusAtk: number;
  totalDef: number;
  bonusStr: number;
  bonusAgi: number;
  bonusVit: number;
  bonusInt: number;
  bonusDex: number;
  bonusLuk: number;
} {
  const items = Object.values(equipped).filter((item): item is Equipment => item !== null);
  
  // === WEAPONS: ATK ONLY ===
  const weapon = equipped.weapon;
  const weaponAtk = weapon ? (weapon.atk || 0) : 0;
  const weaponLevel = weapon?.weaponLevel || 1;
  const weaponRefine = weapon?.refinement || 0;
  
  // Phase 3: Non-weapon items should NOT provide ATK (accessories/armor don't boost attack)
  // Legacy items with ATK in wrong slots are ignored
  const equipBonusAtk = 0;

  // === ARMOR TYPES: DEF ONLY ===
  // Only armor, head, garment, footgear contribute to DEF
  // Accessories and weapons do NOT provide DEF
  const defenseSlots: EquipmentType[] = ['armor', 'head', 'garment', 'footgear'];
  const totalDef = items.reduce((sum, item) => {
    if (!defenseSlots.includes(item.type)) return sum;
    
    // Base DEF from the item
    const baseDef = item.def || 0;
    
    // Refine bonus: armor slots get +3 DEF per refine (matching Phase 3 loot generation)
    const refineBonus = (item.refinement || 0) * 3;
    
    return sum + baseDef + refineBonus;
  }, 0);

  // === BONUS STATS: ALL EQUIPMENT ===
  // Any equipment can provide stat bonuses (STR ring, DEX boots, etc.)
  return {
    weaponAtk,
    weaponLevel,
    weaponRefine,
    equipBonusAtk,
    totalDef,
    bonusStr: items.reduce((sum, item) => sum + (item.str || 0), 0),
    bonusAgi: items.reduce((sum, item) => sum + (item.agi || 0), 0),
    bonusVit: items.reduce((sum, item) => sum + (item.vit || 0), 0),
    bonusInt: items.reduce((sum, item) => sum + (item.int || 0), 0),
    bonusDex: items.reduce((sum, item) => sum + (item.dex || 0), 0),
    bonusLuk: items.reduce((sum, item) => sum + (item.luk || 0), 0),
  };
}