import { Zone, Enemy } from "../types/enemy";

function createEnemy(
  name: string,
  level: number,
  atk: number,
  softDef: number,
  hp: number,
  attackSpeed: number = 0.5,
  hardDefPercent: number = 0
): Enemy {
  return {
    name,
    level,
    hp,
    maxHp: hp,
    atk,
    softDef,
    hardDefPercent,
    attackSpeed,
    count: 1, // Default to single enemy
  };
}

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
      createEnemy("Poring", 1, 8, 2, 50, 0.4, 0),
      createEnemy("Lunatic", 2, 12, 3, 60, 0.45, 0),
      createEnemy("Fabre", 2, 10, 4, 55, 0.4, 0),
      createEnemy("Willow", 3, 15, 4, 70, 0.5, 0),
    ],
  },
  {
    id: 2,
    name: "Dark Forest",
    minLevel: 5,
    enemies: [
      createEnemy("Spore", 5, 25, 8, 120, 0.5, 5),
      createEnemy("Rocker", 6, 30, 10, 140, 0.55, 5),
      createEnemy("Wolf", 7, 35, 9, 150, 0.6, 5),
      createEnemy("Snake", 8, 40, 12, 160, 0.5, 5),
    ],
  },
  {
    id: 3,
    name: "Mountain Path",
    minLevel: 10,
    enemies: [
      createEnemy("Orc Warrior", 10, 60, 20, 280, 0.6, 10),
      createEnemy("Golem", 12, 55, 30, 350, 0.5, 15),
      createEnemy("Hill Wind", 11, 65, 18, 250, 0.65, 10),
      createEnemy("Harpy", 13, 70, 22, 300, 0.7, 10),
    ],
  },
  {
    id: 4,
    name: "Desert Ruins",
    minLevel: 15,
    enemies: [
      createEnemy("Sand Man", 15, 90, 35, 450, 0.65, 15),
      createEnemy("Scorpion", 16, 100, 30, 420, 0.7, 15),
      createEnemy("Mummy", 17, 95, 40, 500, 0.6, 15),
      createEnemy("Horus", 18, 110, 38, 480, 0.75, 15),
    ],
  },
  {
    id: 5,
    name: "Frozen Cavern",
    minLevel: 20,
    enemies: [
      createEnemy("Ice Titan", 20, 130, 50, 650, 0.65, 20),
      createEnemy("Frost Diver", 22, 140, 45, 620, 0.75, 20),
      createEnemy("Siroma", 21, 125, 48, 600, 0.7, 20),
      createEnemy("Gazeti", 23, 150, 52, 680, 0.7, 20),
    ],
  },
  {
    id: 6,
    name: "Volcanic Depths",
    minLevel: 25,
    enemies: [
      createEnemy("Lava Golem", 25, 180, 65, 850, 0.7, 25),
      createEnemy("Fire Imp", 27, 200, 60, 820, 0.8, 25),
      createEnemy("Kaho", 26, 190, 62, 800, 0.75, 25),
      createEnemy("Blazer", 28, 210, 68, 900, 0.75, 25),
    ],
  },
  {
    id: 7,
    name: "Ancient Castle",
    minLevel: 30,
    enemies: [
      createEnemy("Dark Knight", 30, 250, 80, 1100, 0.75, 30),
      createEnemy("Evil Druid", 32, 270, 75, 1050, 0.85, 30),
      createEnemy("Wraith", 31, 260, 78, 1000, 0.8, 30),
      createEnemy("Chimera", 33, 280, 82, 1150, 0.8, 30),
    ],
  },
  {
    id: 8,
    name: "Void Dimension",
    minLevel: 35,
    enemies: [
      createEnemy("Void Stalker", 35, 320, 95, 1400, 0.8, 35),
      createEnemy("Dark Illusion", 37, 350, 90, 1350, 0.9, 35),
      createEnemy("Nightmare", 36, 330, 92, 1300, 0.85, 35),
      createEnemy("Thanatos", 38, 370, 100, 1500, 0.85, 35),
    ],
  },
];

export function getRandomEnemyForZone(zoneId: number, playerLevel: number): Enemy {
  const zone = ZONES.find((z) => z.id === zoneId);
  if (!zone || zone.enemies.length === 0) {
    return createEnemy("Training Dummy", 1, 5, 2, 30, 0.3, 0);
  }

  const randomIndex = Math.floor(Math.random() * zone.enemies.length);
  const baseEnemy = zone.enemies[randomIndex];

  // Level scaling with slight randomness
  const levelVariance = Math.floor(Math.random() * 3) - 1;
  const scaledLevel = Math.max(1, playerLevel + levelVariance);

  // Stat scaling based on level difference
  const levelDiff = scaledLevel - baseEnemy.level;
  const scalingFactor = 1 + levelDiff * 0.15;

  const scaledHp = Math.floor(baseEnemy.maxHp * scalingFactor);
  const scaledAtk = Math.floor(baseEnemy.atk * scalingFactor);
  const scaledSoftDef = Math.floor(baseEnemy.softDef * scalingFactor);
  const scaledHardDefPercent = Math.min(90, Math.max(0, baseEnemy.hardDefPercent + Math.floor(levelDiff * 0.5)));

  // Determine group size (30% chance for groups in combat zones)
  let count = 1;
  if (zoneId > 0 && Math.random() < 0.3) {
    // 30% chance for enemy groups
    // Zone 1: max 2 enemies
    // Zone 2-3: max 3 enemies
    // Zone 4+: max 4 enemies
    const maxCount = zoneId === 1 ? 2 : (zoneId < 4 ? 3 : 4);
    count = Math.floor(Math.random() * (maxCount - 1)) + 2; // 2 to maxCount
  }

  // Revert back to Square Root HP scaling (e.g. 3 enemies = 1.73x HP)
  // This makes mobs challenging but not overly punishing
  const groupHpMultiplier = count > 1 ? Math.sqrt(count) : 1;
  const finalHp = Math.floor(scaledHp * groupHpMultiplier);

  return {
    name: baseEnemy.name,
    level: scaledLevel,
    hp: finalHp,
    maxHp: finalHp,
    atk: scaledAtk,
    softDef: scaledSoftDef,
    hardDefPercent: scaledHardDefPercent,
    attackSpeed: baseEnemy.attackSpeed,
    count,
  };
}