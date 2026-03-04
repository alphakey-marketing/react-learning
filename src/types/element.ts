export type ElementType = 
  | "Neutral" | "Fire" | "Water" | "Wind" | "Earth"
  | "Holy" | "Shadow" | "Ghost" | "Undead" | "Poison";

export type ElementLevel = 1 | 2 | 3 | 4;

export interface ElementalProperty {
  type: ElementType;
  level: ElementLevel;
}

// Elemental matchup table (Simplified RO Element Table Level 1/2)
// Attacker element -> Defender element -> Multiplier (0 to 2)
export const ELEMENT_MULTIPLIERS: Record<ElementType, Partial<Record<ElementType, number>>> = {
  Neutral: { Ghost: 0.25 },
  Fire: { Earth: 1.5, Undead: 1.5, Water: 0.5, Fire: 0.25 },
  Water: { Fire: 1.5, Wind: 0.5, Water: 0.25 },
  Wind: { Water: 1.5, Earth: 0.5, Wind: 0.25 },
  Earth: { Wind: 1.5, Fire: 0.5, Earth: 0.25, Poison: 1.25 },
  Holy: { Shadow: 1.5, Undead: 1.5, Holy: 0 },
  Shadow: { Holy: 1.5, Shadow: 0, Poison: 0.5 },
  Ghost: { Ghost: 1.5, Neutral: 0.25 },
  Undead: { Holy: 0, Shadow: 0.5, Poison: 0, Undead: 0 },
  Poison: { Poison: 0, Undead: 0.5 }
};

export function getElementMultiplier(attackElement: ElementType, defendElement: ElementType): number {
  if (attackElement === "Neutral" && defendElement !== "Ghost") return 1.0;
  
  const multipliers = ELEMENT_MULTIPLIERS[attackElement];
  if (multipliers && defendElement in multipliers) {
    return multipliers[defendElement]!;
  }
  
  return 1.0; // Default if not defined
}

export function getElementColor(element: ElementType): string {
  const colors: Record<ElementType, string> = {
    Neutral: "#e5e7eb", // gray
    Fire: "#ef4444",    // red
    Water: "#3b82f6",   // blue
    Wind: "#22c55e",    // green
    Earth: "#a16207",   // brown
    Holy: "#fef08a",    // bright gold
    Shadow: "#4f46e5",  // indigo
    Ghost: "#d946ef",   // fuchsia
    Undead: "#64748b",  // slate
    Poison: "#9333ea",  // purple
  };
  
  return colors[element] || "#e5e7eb";
}
