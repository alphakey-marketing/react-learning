import { Zone, Enemy } from "../types/enemy";

function createEnemy(
  name: string,
  level: number,
  atk: number,
  def: number,
  hp: number,
  attackSpeed: number = 0.5
): Enemy {
  return {
    name,
    level,
    hp,
    maxHp: hp,
    atk,
    def,
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
      createEnemy("Poring", 1, 8, 2, 50, 0.4),
      createEnemy("Lunatic", 2, 12, 3, 60, 0.45),
      createEnemy("Fabre", 2, 10, 4, 55, 0.4),
      createEnemy("Willow", 3, 15, 4, 70, 0.5),
    ],
  },
  {
    id: 2,
    name: "Dark Forest",
    minLevel: 5,
    enemies: [
      createEnemy("Spore", 5, 25, 8, 120, 0.5),
      createEnemy("Rocker", 6, 30, 10, 140, 0.55),
      createEnemy("Wolf", 7, 35, 9, 150, 0.6),
      createEnemy("Snake", 8, 40, 12, 160, 0.5),
    ],
  },
  {
    id: 3,
    name: "Mountain Path",
    minLevel: 10,
    enemies: [
      createEnemy("Orc Warrior", 10, 60, 20, 280, 0.6),
      createEnemy("Golem", 12, 55, 30, 350, 0.5),
      createEnemy("Hill Wind", 11, 65, 18, 250, 0.65),
      createEnemy("Harpy", 13, 70, 22, 300, 0.7),
    ],
  },
  {
    id: 4,
    name: "Desert Ruins",
    minLevel: 15,
    enemies: [
      createEnemy("Sand Man", 15, 90, 35, 450, 0.65),
      createEnemy("Scorpion", 16, 100, 30, 420, 0.7),
      createEnemy("Mummy", 17, 95, 40, 500, 0.6),
      createEnemy("Horus", 18, 110, 38, 480, 0.75),
    ],
  },
  {
    id: 5,
    name: "Frozen Cavern",
    minLevel: 20,
    enemies: [
      createEnemy("Ice Titan", 20, 130, 50, 650, 0.65),
      createEnemy("Frost Diver", 22, 140, 45, 620, 0.75),
      createEnemy("Siroma", 21, 125, 48, 600, 0.7),
      createEnemy("Gazeti", 23, 150, 52, 680, 0.7),
    ],
  },
  {
    id: 6,
    name: "Volcanic Depths",
    minLevel: 25,
    enemies: [
      createEnemy("Lava Golem", 25, 180, 65, 850, 0.7),
      createEnemy("Fire Imp", 27, 200, 60, 820, 0.8),
      createEnemy("Kaho", 26, 190, 62, 800, 0.75),
      createEnemy("Blazer", 28, 210, 68, 900, 0.75),
    ],
  },
  {
    id: 7,
    name: "Ancient Castle",
    minLevel: 30,
    enemies: [
      createEnemy("Dark Knight", 30, 250, 80, 1100, 0.75),
      createEnemy("Evil Druid", 32, 270, 75, 1050, 0.85),
      createEnemy("Wraith", 31, 260, 78, 1000, 0.8),
      createEnemy("Chimera", 33, 280, 82, 1150, 0.8),
    ],
  },
  {
    id: 8,
    name: "Void Dimension",
    minLevel: 35,
    enemies: [
      createEnemy("Void Stalker", 35, 320, 95, 1400, 0.8),
      createEnemy("Dark Illusion", 37, 350, 90, 1350, 0.9),
      createEnemy("Nightmare", 36, 330, 92, 1300, 0.85),
      createEnemy("Thanatos", 38, 370, 100, 1500, 0.85),
    ],
  },
];

export function getRandomEnemyForZone(zoneId: number, playerLevel: number): Enemy {
  const zone = ZONES.find((z) => z.id === zoneId);
  if (!zone || zone.enemies.length === 0) {
    return createEnemy("Training Dummy", 1, 5, 2, 30, 0.3);
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
  const scaledDef = Math.floor(baseEnemy.def * scalingFactor);

  // Determine group size (30% chance for groups in combat zones)
  let count = 1;
  if (zoneId > 0 && Math.random() < 0.3) {
    // 30% chance for enemy groups
    // Early zones: 2-3 enemies, later zones: 2-4 enemies
    const maxCount = zoneId < 4 ? 3 : 4;
    count = Math.floor(Math.random() * (maxCount - 1)) + 2; // 2 to maxCount
  }

  // If it's a group, scale HP proportionally but not linearly
  // (groups are tougher but not count * HP)
  const groupHpMultiplier = count > 1 ? Math.sqrt(count) : 1;
  const finalHp = Math.floor(scaledHp * groupHpMultiplier);

  return {
    name: baseEnemy.name,
    level: scaledLevel,
    hp: finalHp,
    maxHp: finalHp,
    atk: scaledAtk,
    def: scaledDef,
    attackSpeed: baseEnemy.attackSpeed,
    count,
  };
}
