export interface Skill {
  id: string;
  name: string;
  nameZh: string;
  maxLevel: number;
  mpCost: (level: number) => number;
  description: string;
  damageMultiplier: (level: number) => number;
  cooldown: number;
  effect?: "stun" | "dot" | "heal" | "buff";
}
