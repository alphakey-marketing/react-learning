export interface Skill {
  id: string;
  name: string;
  nameZh: string;
  maxLevel: number;
  mpCost: (level: number) => number;
  description: string;
  damageMultiplier: (level: number) => number;
  cooldown: number;
  
  // Effect types:
  // - undefined: damage skill (normal)
  // - "passive": permanent stat bonus, no casting needed (e.g., Owl's Eye, Peco Peco Ride)
  // - "debuff": temporary enemy weakening (e.g., Provoke)
  // - "stun", "dot", "heal": future effects
  effect?: "stun" | "dot" | "heal" | "buff" | "passive" | "debuff";
  
  // NEW: For debuff skills, how long they last on the enemy
  debuffDuration?: number; // seconds
  
  targetCount?: number; // Number of targets this skill can hit (1 = single, 2+ = AOE)
}
