export type ElementType = 
  | "Neutral" | "Fire" | "Water" | "Wind";

export type ElementLevel = 1 | 2 | 3 | 4;

export interface ElementalProperty {
  type: ElementType;
  level: ElementLevel;
}

// Simplified Elemental matchup table (Rock-Paper-Scissors)
// Fire beats Wind, Wind beats Water, Water beats Fire
// Attacker element -> Defender element -> Multiplier (1.0 to 1.5)
export const ELEMENT_MULTIPLIERS: Record<ElementType, Partial<Record<ElementType, number>>> = {
  Neutral: {}, // Neutral deals 1.0x to everything (handled in getElementMultiplier)
  Fire: { Wind: 1.5 },     // Fire beats Wind
  Water: { Fire: 1.5 },    // Water beats Fire
  Wind: { Water: 1.5 },    // Wind beats Water
};

export function getElementMultiplier(attackElement: ElementType, defendElement: ElementType): number {
  // Neutral always deals 1.0x damage
  if (attackElement === "Neutral" || defendElement === "Neutral") return 1.0;
  
  const multipliers = ELEMENT_MULTIPLIERS[attackElement];
  if (multipliers && defendElement in multipliers) {
    return multipliers[defendElement]!;
  }
  
  // Default: no bonus or penalty (1.0x)
  return 1.0;
}

// Get elements that are effective against the target element
export function getEffectiveElements(targetElement: ElementType): ElementType[] {
  const effective: ElementType[] = [];
  
  // Check each element to see if it has advantage against target
  const allElements: ElementType[] = ["Neutral", "Fire", "Water", "Wind"];
  
  for (const element of allElements) {
    const multiplier = getElementMultiplier(element, targetElement);
    if (multiplier > 1.0) {
      effective.push(element);
    }
  }
  
  return effective;
}

// Get skill names by element for hints
export function getSkillNamesByElement(element: ElementType): string[] {
  const skillMap: Record<ElementType, string[]> = {
    Neutral: ["普通攻擊 (Basic Attack)", "強力攻擊 (Bash)"],
    Fire: ["火焰彈 (Fire Bolt)", "隕石術 (Meteor Storm)", "爆裂波動 (Magnum Break)", "爆炎陷阱 (Claymore Trap)"],
    Water: ["冰箭術 (Cold Bolt)", "暴風雪 (Storm Gust)"],
    Wind: ["雷擊術 (Lightning Bolt)"],
  };
  
  return skillMap[element] || [];
}

export function getElementColor(element: ElementType): string {
  const colors: Record<ElementType, string> = {
    Neutral: "#e5e7eb", // gray
    Fire: "#ef4444",    // red
    Water: "#3b82f6",   // blue
    Wind: "#22c55e",    // green
  };
  
  return colors[element] || "#e5e7eb";
}

export function getElementEmoji(element: ElementType): string {
  const emojis: Record<ElementType, string> = {
    Neutral: "⚪",
    Fire: "🔥",
    Water: "💧",
    Wind: "🌪️",
  };
  
  return emojis[element] || "⚪";
}
