export interface Enemy {
  name: string;
  level: number;
  hp: number;
  maxHp: number;
  atk: number;
  def: number;
  attackSpeed: number; // Attacks per second (independent from player)
  count: number; // Number of enemies in this group (1 = single, 2+ = group)
}

export interface Zone {
  id: number;
  name: string;
  minLevel: number;
  enemies: Enemy[];
}
