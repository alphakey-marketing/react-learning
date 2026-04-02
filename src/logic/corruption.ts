// Corruption tier system — enemy scaling and drop rarity bias

export interface CorruptionModifiers {
  enemyHpMult: number;
  enemyAtkMult: number;
  enemyDefMult: number;
  rarityBias: { uncommon?: number; rare?: number; epic?: number; legendary?: number };
  tierName: string;
}

export function getCorruptionModifiers(corruptionLevel: number): CorruptionModifiers {
  if (corruptionLevel >= 100) {
    return {
      enemyHpMult: 1.65,
      enemyAtkMult: 1.80,
      enemyDefMult: 1.50,
      rarityBias: { epic: 25, legendary: 8 },
      tierName: "Devoured",
    };
  }
  if (corruptionLevel >= 80) {
    return {
      enemyHpMult: 1.45,
      enemyAtkMult: 1.58,
      enemyDefMult: 1.35,
      rarityBias: { epic: 18, legendary: 3 },
      tierName: "Unravelling",
    };
  }
  if (corruptionLevel >= 60) {
    return {
      enemyHpMult: 1.30,
      enemyAtkMult: 1.38,
      enemyDefMult: 1.22,
      rarityBias: { epic: 12 },
      tierName: "Bleeding",
    };
  }
  if (corruptionLevel >= 40) {
    return {
      enemyHpMult: 1.18,
      enemyAtkMult: 1.22,
      enemyDefMult: 1.12,
      rarityBias: { rare: 8 },
      tierName: "Marked",
    };
  }
  if (corruptionLevel >= 20) {
    return {
      enemyHpMult: 1.08,
      enemyAtkMult: 1.10,
      enemyDefMult: 1.05,
      rarityBias: { uncommon: 5 },
      tierName: "Stirring",
    };
  }
  return {
    enemyHpMult: 1.0,
    enemyAtkMult: 1.0,
    enemyDefMult: 1.0,
    rarityBias: {},
    tierName: "Untouched",
  };
}
