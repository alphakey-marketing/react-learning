import { Zone, Enemy } from "../types/enemy";

function createEnemy(
  name: string,
  level: number,
  atk: number,
  softDef: number,
  hp: number,
  flee: number, // NEW: Enemy evasion stat
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
    flee, // NEW: Flee stat determines dodge chance
    count: 1,
  };
}

// Phase 4 Rebalance: Enemy stats reduced by ~40% to match quadratic player scaling
// ATK: -40%, HP: -35%, Soft DEF: -35%, Hard DEF capped at 25% (endgame 35%)
// Phase 5 Rebalance: Zone 7-8 Soft DEF reduced by ~20% to improve gear accessibility
// Phase 6: Added Flee stat for hit/flee accuracy system
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
      // Zone 1: Tutorial enemies (very weak, low evasion: 8-12 flee)
      createEnemy("Poring", 1, 5, 1, 35, 8, 0.4, 0),        // Slow blob
      createEnemy("Lunatic", 2, 7, 2, 40, 12, 0.45, 0),     // Agile rabbit
      createEnemy("Fabre", 2, 6, 3, 38, 10, 0.4, 0),        // Moderate insect
      createEnemy("Willow", 3, 9, 3, 48, 11, 0.5, 0),       // Plant enemy
    ],
  },
  {
    id: 2,
    name: "Dark Forest",
    minLevel: 5,
    enemies: [
      // Zone 2: Forest creatures (moderate agility: 15-22 flee)
      createEnemy("Spore", 5, 15, 5, 80, 15, 0.5, 3),       // Slow plant
      createEnemy("Rocker", 6, 18, 7, 92, 18, 0.55, 3),     // Mobile grasshopper
      createEnemy("Wolf", 7, 21, 6, 98, 22, 0.6, 3),        // Fast predator
      createEnemy("Snake", 8, 24, 8, 105, 20, 0.5, 3),      // Quick reptile
    ],
  },
  {
    id: 3,
    name: "Mountain Path",
    minLevel: 10,
    enemies: [
      // Zone 3: Mountain enemies (varied mobility: 28-38 flee)
      createEnemy("Orc Warrior", 10, 36, 13, 185, 30, 0.6, 7),  // Moderate warrior
      createEnemy("Golem", 12, 33, 20, 230, 28, 0.5, 10),       // Slow tank
      createEnemy("Hill Wind", 11, 39, 12, 165, 38, 0.65, 7),   // Aerial entity
      createEnemy("Harpy", 13, 42, 14, 198, 36, 0.7, 7),        // Flying enemy
    ],
  },
  {
    id: 4,
    name: "Desert Ruins",
    minLevel: 15,
    enemies: [
      // Zone 4: Desert creatures (high evasion: 40-52 flee)
      createEnemy("Sand Man", 15, 54, 23, 295, 42, 0.65, 10),   // Earth elemental
      createEnemy("Scorpion", 16, 60, 20, 275, 52, 0.7, 10),    // Very agile predator
      createEnemy("Mummy", 17, 57, 26, 328, 40, 0.6, 10),       // Slow undead
      createEnemy("Horus", 18, 66, 25, 315, 48, 0.75, 10),      // Bird enemy
    ],
  },
  {
    id: 5,
    name: "Frozen Cavern",
    minLevel: 20,
    enemies: [
      // Zone 5: Ice enemies (moderate to high flee: 52-68 flee)
      createEnemy("Ice Titan", 20, 78, 33, 425, 52, 0.65, 15),  // Slow giant
      createEnemy("Frost Diver", 22, 84, 29, 405, 68, 0.75, 15), // Agile water enemy
      createEnemy("Siroma", 21, 75, 31, 393, 60, 0.7, 15),      // Ice sprite
      createEnemy("Gazeti", 23, 90, 34, 445, 64, 0.7, 15),      // Ice beast
    ],
  },
  {
    id: 6,
    name: "Volcanic Depths",
    minLevel: 25,
    enemies: [
      // Zone 6: Volcanic enemies (varied evasion: 70-88 flee)
      createEnemy("Lava Golem", 25, 138, 55, 685, 70, 0.75, 20),  // Slow elemental
      createEnemy("Fire Imp", 27, 156, 49, 640, 88, 0.9, 20),     // Very agile demon
      createEnemy("Kaho", 26, 147, 52, 653, 78, 0.85, 20),        // Fire spirit
      createEnemy("Blazer", 28, 165, 57, 718, 82, 0.85, 20),      // Fire elemental
    ],
  },
  {
    id: 7,
    name: "Ancient Castle",
    minLevel: 30,
    enemies: [
      // Zone 7: Castle enemies (high combat skill: 88-105 flee)
      createEnemy("Dark Knight", 30, 210, 55, 980, 92, 0.85, 25),  // Skilled warrior
      createEnemy("Evil Druid", 32, 228, 50, 915, 95, 0.95, 25),   // Caster with evasion
      createEnemy("Wraith", 31, 219, 52, 883, 105, 0.9, 25),       // Ethereal ghost
      createEnemy("Chimera", 33, 240, 58, 1045, 88, 0.9, 25),      // Multi-headed beast
    ],
  },
  {
    id: 8,
    name: "Void Dimension",
    minLevel: 35,
    enemies: [
      // Zone 8: Void enemies (maximum evasion: 105-125 flee)
      createEnemy("Void Stalker", 35, 312, 70, 1435, 112, 1.0, 35),  // Dimensional hunter
      createEnemy("Dark Illusion", 37, 336, 65, 1305, 125, 1.2, 35), // Illusion entity (highest flee)
      createEnemy("Nightmare", 36, 324, 68, 1370, 118, 1.1, 35),     // Dream demon
      createEnemy("Thanatos", 38, 360, 75, 1630, 105, 1.1, 35),      // Death incarnate
    ],
  },
];

export function getRandomEnemyForZone(zoneId: number, playerLevel: number): Enemy {
  const zone = ZONES.find((z) => z.id === zoneId);
  if (!zone || zone.enemies.length === 0) {
    return createEnemy("Training Dummy", 1, 3, 1, 20, 5, 0.3, 0);
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
  
  // NEW: Scale flee with level difference (but less than other stats)
  // Flee only scales at 3% per level to keep it meaningful
  const fleeScaling = 1 + (levelDiff * 0.03);
  const scaledFlee = Math.floor(baseEnemy.flee * Math.max(0.9, Math.min(1.1, fleeScaling)));
  
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
    flee: scaledFlee, // NEW: Flee scales with level
    count,
  };
}
