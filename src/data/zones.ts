import { Zone, Enemy } from "../types/enemy";

function createEnemy(
  name: string,
  level: number,
  atk: number,
  softDef: number,
  hp: number,
  attackSpeed: number = 0.5,
  hardDefPercent: number = 0,
  softMdef: number = -1,
  hardMdefPercent: number = -1
): Enemy {
  return {
    name,
    level,
    hp,
    maxHp: hp,
    atk,
    softDef,
    hardDefPercent,
    softMdef: softMdef === -1 ? Math.floor(softDef * 0.8) : softMdef, // Default MDEF is slightly lower than DEF
    hardMdefPercent: hardMdefPercent === -1 ? hardDefPercent : hardMdefPercent,
    attackSpeed,
    count: 1,
  };
}

// Phase 4 Rebalance: Enemy stats reduced by ~40% to match quadratic player scaling
// ATK: -40%, HP: -35%, Soft DEF: -35%, Hard DEF capped at 25% (endgame 35%)
// Phase 5 Rebalance: Zone 7-8 Soft DEF reduced by ~20% to improve gear accessibility
export const ZONES: Zone[] = [
  {
    id: 0,
    name: "Town",
    minLevel: 1,
    enemies: [],
  },
  {
    id: 1,
    name: "Beginner Plains",
    minLevel: 1,
    enemies: [
      // Zone 1: Tutorial enemies (very weak)
      createEnemy("Poring", 1, 5, 1, 35, 0.4, 0),        // was: 8 ATK, 2 DEF, 50 HP
      createEnemy("Lunatic", 2, 7, 2, 40, 0.45, 0),      // was: 12 ATK, 3 DEF, 60 HP
      createEnemy("Fabre", 2, 6, 3, 38, 0.4, 0),         // was: 10 ATK, 4 DEF, 55 HP
      createEnemy("Willow", 3, 9, 3, 48, 0.5, 0),        // was: 15 ATK, 4 DEF, 70 HP
    ],
  },
  {
    id: 2,
    name: "Dark Forest",
    minLevel: 5,
    enemies: [
      createEnemy("Spore", 5, 15, 5, 80, 0.5, 3),        // was: 25 ATK, 8 DEF, 120 HP, 5% Hard DEF
      createEnemy("Rocker", 6, 18, 7, 92, 0.55, 3),      // was: 30 ATK, 10 DEF, 140 HP, 5% Hard DEF
      createEnemy("Wolf", 7, 21, 6, 98, 0.6, 3),         // was: 35 ATK, 9 DEF, 150 HP, 5% Hard DEF
      createEnemy("Snake", 8, 24, 8, 105, 0.5, 3),       // was: 40 ATK, 12 DEF, 160 HP, 5% Hard DEF
    ],
  },
  {
    id: 3,
    name: "Mountain Path",
    minLevel: 10,
    enemies: [
      createEnemy("Orc Warrior", 10, 36, 13, 185, 0.6, 7),  // was: 60 ATK, 20 DEF, 280 HP, 10% Hard DEF
      createEnemy("Golem", 12, 33, 20, 230, 0.5, 10),       // was: 55 ATK, 30 DEF, 350 HP, 15% Hard DEF
      createEnemy("Hill Wind", 11, 39, 12, 165, 0.65, 7),   // was: 65 ATK, 18 DEF, 250 HP, 10% Hard DEF
      createEnemy("Harpy", 13, 42, 14, 198, 0.7, 7),        // was: 70 ATK, 22 DEF, 300 HP, 10% Hard DEF
    ],
  },
  {
    id: 4,
    name: "Desert Ruins",
    minLevel: 15,
    enemies: [
      createEnemy("Sand Man", 15, 54, 23, 295, 0.65, 10),    // was: 90 ATK, 35 DEF, 450 HP, 15% Hard DEF
      createEnemy("Scorpion", 16, 60, 20, 275, 0.7, 10),     // was: 100 ATK, 30 DEF, 420 HP, 15% Hard DEF
      createEnemy("Mummy", 17, 57, 26, 328, 0.6, 10),        // was: 95 ATK, 40 DEF, 500 HP, 15% Hard DEF
      createEnemy("Horus", 18, 66, 25, 315, 0.75, 10),       // was: 110 ATK, 38 DEF, 480 HP, 15% Hard DEF
    ],
  },
  {
    id: 5,
    name: "Frozen Cavern",
    minLevel: 20,
    enemies: [
      createEnemy("Ice Titan", 20, 78, 33, 425, 0.65, 15),   // was: 130 ATK, 50 DEF, 650 HP, 20% Hard DEF
      createEnemy("Frost Diver", 22, 84, 29, 405, 0.75, 15), // was: 140 ATK, 45 DEF, 620 HP, 20% Hard DEF
      createEnemy("Siroma", 21, 75, 31, 393, 0.7, 15),       // was: 125 ATK, 48 DEF, 600 HP, 20% Hard DEF
      createEnemy("Gazeti", 23, 90, 34, 445, 0.7, 15),       // was: 150 ATK, 52 DEF, 680 HP, 20% Hard DEF
    ],
  },
  {
    id: 6,
    name: "Volcanic Depths",
    minLevel: 25,
    enemies: [
      createEnemy("Lava Golem", 25, 138, 55, 685, 0.75, 20),  // was: 230 ATK, 85 DEF, 1050 HP, 35% Hard DEF
      createEnemy("Fire Imp", 27, 156, 49, 640, 0.9, 20),     // was: 260 ATK, 75 DEF, 980 HP, 35% Hard DEF
      createEnemy("Kaho", 26, 147, 52, 653, 0.85, 20),        // was: 245 ATK, 80 DEF, 1000 HP, 35% Hard DEF
      createEnemy("Blazer", 28, 165, 57, 718, 0.85, 20),      // was: 275 ATK, 88 DEF, 1100 HP, 35% Hard DEF
    ],
  },
  {
    id: 7,
    name: "Ancient Castle",
    minLevel: 30,
    enemies: [
      // BALANCE: Reduced Soft DEF by ~24% (72→55, 65→50, 68→52, 75→58)
      createEnemy("Dark Knight", 30, 210, 55, 980, 0.85, 25),  // was: 72 DEF → 55 DEF
      createEnemy("Evil Druid", 32, 228, 50, 915, 0.95, 25),   // was: 65 DEF → 50 DEF
      createEnemy("Wraith", 31, 219, 52, 883, 0.9, 25),        // was: 68 DEF → 52 DEF
      createEnemy("Chimera", 33, 240, 58, 1045, 0.9, 25),      // was: 75 DEF → 58 DEF
    ],
  },
  {
    id: 8,
    name: "Void Dimension",
    minLevel: 35,
    enemies: [
      // BALANCE: Reduced Soft DEF by ~23% (91→70, 85→65, 88→68, 98→75)
      createEnemy("Void Stalker", 35, 312, 70, 1435, 1.0, 35),   // was: 91 DEF → 70 DEF
      createEnemy("Dark Illusion", 37, 336, 65, 1305, 1.2, 35),  // was: 85 DEF → 65 DEF
      createEnemy("Nightmare", 36, 324, 68, 1370, 1.1, 35),      // was: 88 DEF → 68 DEF
      createEnemy("Thanatos", 38, 360, 75, 1630, 1.1, 35),       // was: 98 DEF → 75 DEF
    ],
  },
];

export function getRandomEnemyForZone(zoneId: number, playerLevel: number): Enemy {
  const zone = ZONES.find((z) => z.id === zoneId);
  if (!zone || zone.enemies.length === 0) {
    return createEnemy("Training Dummy", 1, 3, 1, 20, 0.3, 0);
  }

  const randomIndex = Math.floor(Math.random() * zone.enemies.length);
  const baseEnemy = zone.enemies[randomIndex];

  // Phase 4: SOFT LEVEL SCALING (±20% max)
  // Instead of uncapped scaling, we cap at ±20% to maintain zone identity
  const levelDiff = playerLevel - zone.minLevel;
  
  // 5% scaling per level difference
  let scalingFactor = 1 + (levelDiff * 0.05);
  
  // Cap scaling at ±20% (so zones remain relevant for ~4 levels above/below)
  scalingFactor = Math.max(0.8, Math.min(1.2, scalingFactor));

  const scaledHp = Math.floor(baseEnemy.maxHp * scalingFactor);
  const scaledAtk = Math.floor(baseEnemy.atk * scalingFactor);
  const scaledSoftDef = Math.floor(baseEnemy.softDef * scalingFactor);
  const scaledSoftMdef = Math.floor(baseEnemy.softMdef * scalingFactor);
  
  // Hard DEF increases slightly with level, but capped
  // Early zones: max 15%, mid zones: max 25%, endgame: max 35%
  const hardDefCap = zoneId >= 8 ? 35 : (zoneId >= 6 ? 25 : (zoneId >= 4 ? 15 : 10));
  const scaledHardDefPercent = Math.min(
    hardDefCap,
    Math.max(0, baseEnemy.hardDefPercent + Math.floor(levelDiff * 0.3))
  );

  const scaledHardMdefPercent = Math.min(
    hardDefCap,
    Math.max(0, baseEnemy.hardMdefPercent + Math.floor(levelDiff * 0.3))
  );

  // Determine group size (30% chance for groups in combat zones)
  let count = 1;
  if (zoneId > 0 && Math.random() < 0.3) {
    const maxCount = zoneId === 1 ? 2 : (zoneId < 4 ? 3 : 4);
    count = Math.floor(Math.random() * (maxCount - 1)) + 2;
  }

  // Group scaling (reduced from sqrt to linear 0.7x per enemy)
  const groupHpMultiplier = count > 1 ? (1 + (count - 1) * 0.7) : 1;
  const finalHp = Math.floor(scaledHp * groupHpMultiplier);

  // Group ATK scaling (slight bump for danger)
  const groupAtkMultiplier = count > 1 ? 1 + (count * 0.08) : 1;
  const finalAtk = Math.floor(scaledAtk * groupAtkMultiplier);

  return {
    name: baseEnemy.name,
    level: playerLevel,
    hp: finalHp,
    maxHp: finalHp,
    atk: finalAtk,
    softDef: scaledSoftDef,
    hardDefPercent: scaledHardDefPercent,
    softMdef: scaledSoftMdef,
    hardMdefPercent: scaledHardMdefPercent,
    attackSpeed: baseEnemy.attackSpeed,
    count,
  };
}