export interface Enemy {
  name: string;
  level: number;
  hp: number;
  maxHp: number;
  atk: number;
  softDef: number; // VIT-based flat reduction
  hardDefPercent: number; // Equipment-based percentage reduction (0-100)
  softMdef: number; // INT-based flat magic reduction
  hardMdefPercent: number; // Equipment-based percentage magic reduction (0-100)
  attackSpeed: number; // Attacks per second (independent from player)
  count: number; // Number of enemies in this group (1 = single, 2+ = group)
  flee: number; // Evasion stat (Level + AGI*0.8)
  isBoss?: boolean; // Flag for boss-specific mechanics (armor pen, etc.)
}

export interface Zone {
  id: number;
  name: string;
  minLevel: number;
  enemies: Enemy[];
}
