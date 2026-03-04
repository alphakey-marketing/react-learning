import { ElementType } from "./element";
import { JobClass } from "./character";

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

// Weapon type system for class restrictions
export type WeaponType = 
  | "dagger"      // Novice, Mage, Thief
  | "sword"       // Swordsman, Knight, Merchant
  | "2h_sword"    // Swordsman, Knight
  | "spear"       // Knight (mounted)
  | "axe"         // Merchant, Blacksmith
  | "mace"        // Acolyte, Priest, Merchant
  | "staff"       // Mage, Wizard, Acolyte, Priest
  | "bow"         // Archer, Hunter
  | "katar";      // Assassin

export interface Equipment {
  id: number;
  name: string;
  type: EquipmentType;
  rarity: EquipmentRarity;
  
  // Weapon properties
  weaponType?: WeaponType;  // NEW: Weapon classification
  atk?: number;        // Attack power (weapons ONLY)
  weaponLevel?: number; // Weapon level (1-4), affects variance
  
  // Armor properties
  def?: number;        // Defense (armor, head, garment, footgear ONLY)
  
  // General properties
  slots?: number;      // Card slots (0-4)
  weight?: number;     // Weight in RO style
  refinement?: number; // +0 to +10 refine level
  
  // Elemental Properties
  element?: ElementType; // Weapons apply elemental damage, Armor grants resistance
  
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

// Class weapon restrictions (classic RO style)
export const CLASS_WEAPON_RESTRICTIONS: Record<JobClass, WeaponType[]> = {
  Novice: ["dagger"],
  Swordsman: ["sword", "2h_sword", "dagger"],
  Knight: ["sword", "2h_sword", "spear"],
  Mage: ["staff", "dagger"],
  Wizard: ["staff", "dagger"],
  Archer: ["bow"],
  Hunter: ["bow"],
};

// Check if a class can equip a weapon type
export function canEquipWeapon(jobClass: JobClass, weaponType: WeaponType): boolean {
  const allowedWeapons = CLASS_WEAPON_RESTRICTIONS[jobClass];
  return allowedWeapons.includes(weaponType);
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

// Helper to get weapon type display name
export function getWeaponTypeName(weaponType: WeaponType): string {
  const names: Record<WeaponType, string> = {
    dagger: "Dagger",
    sword: "Sword",
    "2h_sword": "Two-Handed Sword",
    spear: "Spear",
    axe: "Axe",
    mace: "Mace",
    staff: "Staff",
    bow: "Bow",
    katar: "Katar",
  };
  return names[weaponType];
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
  
  // Elements add base score value
  if (item.element) {
    score += 15;
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

// Phase 3: Calculate total stats from equipment
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
  
  const equipBonusAtk = 0;

  // === ARMOR TYPES: DEF ONLY ===
  const defenseSlots: EquipmentType[] = ['armor', 'head', 'garment', 'footgear'];
  const totalDef = items.reduce((sum, item) => {
    if (!defenseSlots.includes(item.type)) return sum;
    
    const baseDef = item.def || 0;
    const refineBonus = (item.refinement || 0) * 3;
    
    return sum + baseDef + refineBonus;
  }, 0);

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