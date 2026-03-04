import { ElementType } from "./element";

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
  targetCount?: number; // Number of targets this skill can hit (1 = single, 2+ = AOE)
  element?: ElementType; // Optional elemental property
}
