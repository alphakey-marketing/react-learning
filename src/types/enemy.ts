export interface Enemy {
  name: string;
  level: number;
  hp: number;
  maxHp: number;
  atk: number;
  def: number;
  attackSpeed: number; // Attacks per second (independent from player)
}

export interface Zone {
  id: number;
  name: string;
  minLevel: number;
  enemies: Enemy[];
}
