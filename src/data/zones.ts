import { Zone, Enemy } from "../types/enemy";
import { ElementType, ElementLevel } from "../types/element";

function createEnemy(
  name: string,
  level: number,
  atk: number,
  softDef: number,
  hp: number,
  attackSpeed: number = 0.5,
  hardDefPercent: number = 0,
  elementType: ElementType = "Neutral",
  elementLevel: ElementLevel = 1
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
    count: 1,
    element: { type: elementType, level: elementLevel },
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
      createEnemy("Poring", 1, 5, 1, 35, 0.4, 0, "Water", 1),
      createEnemy("Lunatic", 2, 7, 2, 40, 0.45, 0, "Neutral", 1),
      createEnemy("Fabre", 2, 6, 3, 38, 0.4, 0, "Earth", 1),
      createEnemy("Willow", 3, 9, 3, 48, 0.5, 0, "Earth", 1),
    ],
  },
  {
    id: 2,
    name: "Dark Forest",
    minLevel: 5,
    enemies: [
      createEnemy("Spore", 5, 15, 5, 80, 0.5, 3, "Water", 1),
      createEnemy("Rocker", 6, 18, 7, 92, 0.55, 3, "Earth", 1),
      createEnemy("Wolf", 7, 21, 6, 98, 0.6, 3, "Earth", 1),
      createEnemy("Snake", 8, 24, 8, 105, 0.5, 3, "Poison", 1),
    ],
  },
  {
    id: 3,
    name: "Mountain Path",
    minLevel: 10,
    enemies: [
      createEnemy("Orc Warrior", 10, 36, 13, 185, 0.6, 7, "Earth", 1),
      createEnemy("Golem", 12, 33, 20, 230, 0.5, 10, "Neutral", 3),
      createEnemy("Hill Wind", 11, 39, 12, 165, 0.65, 7, "Wind", 2),
      createEnemy("Harpy", 13, 42, 14, 198, 0.7, 7, "Wind", 2),
    ],
  },
  {
    id: 4,
    name: "Desert Ruins",
    minLevel: 15,
    enemies: [
      createEnemy("Sand Man", 15, 54, 23, 295, 0.65, 10, "Earth", 2),
      createEnemy("Scorpion", 16, 60, 20, 275, 0.7, 10, "Fire", 1),
      createEnemy("Mummy", 17, 57, 26, 328, 0.6, 10, "Undead", 1),
      createEnemy("Horus", 18, 66, 25, 315, 0.75, 10, "Holy", 2),
    ],
  },
  {
    id: 5,
    name: "Frozen Cavern",
    minLevel: 20,
    enemies: [
      createEnemy("Ice Titan", 20, 78, 33, 425, 0.65, 15, "Water", 3),
      createEnemy("Frost Diver", 22, 84, 29, 405, 0.75, 15, "Water", 2),
      createEnemy("Siroma", 21, 75, 31, 393, 0.7, 15, "Water", 2),
      createEnemy("Gazeti", 23, 90, 34, 445, 0.7, 15, "Water", 2),
    ],
  },
  {
    id: 6,
    name: "Volcanic Depths",
    minLevel: 25,
    enemies: [
      createEnemy("Lava Golem", 25, 138, 55, 685, 0.75, 20, "Fire", 3),
      createEnemy("Fire Imp", 27, 156, 49, 640, 0.9, 20, "Fire", 2),
      createEnemy("Kaho", 26, 147, 52, 653, 0.85, 20, "Fire", 2),
      createEnemy("Blazer", 28, 165, 57, 718, 0.85, 20, "Fire", 2),
    ],
  },
  {
    id: 7,
    name: "Ancient Castle",
    minLevel: 30,
    enemies: [
      createEnemy("Dark Knight", 30, 210, 72, 980, 0.85, 25, "Shadow", 2),
      createEnemy("Evil Druid", 32, 228, 65, 915, 0.95, 25, "Undead", 2),
      createEnemy("Wraith", 31, 219, 68, 883, 0.9, 25, "Undead", 2),
      createEnemy("Chimera", 33, 240, 75, 1045, 0.9, 25, "Fire", 3),
    ],
  },
  {
    id: 8,
    name: "Void Dimension",
    minLevel: 35,
    enemies: [
      createEnemy("Void Stalker", 35, 312, 91, 1435, 1.0, 35, "Ghost", 3),
      createEnemy("Dark Illusion", 37, 336, 85, 1305, 1.2, 35, "Ghost", 3),
      createEnemy("Nightmare", 36, 324, 88, 1370, 1.1, 35, "Ghost", 3),
      createEnemy("Thanatos", 38, 360, 98, 1630, 1.1, 35, "Ghost", 4),
    ],
  },
];

export function getRandomEnemyForZone(zoneId: number, playerLevel: number): Enemy {
  const zone = ZONES.find((z) => z.id === zoneId);
  if (!zone || zone.enemies.length === 0) {
    return createEnemy("Training Dummy", 1, 3, 1, 20, 0.3, 0, "Neutral", 1);
  }

  const randomIndex = Math.floor(Math.random() * zone.enemies.length);
  const baseEnemy = zone.enemies[randomIndex];

  const levelDiff = playerLevel - zone.minLevel;
  
  let scalingFactor = 1 + (levelDiff * 0.05);
  scalingFactor = Math.max(0.8, Math.min(1.2, scalingFactor));

  const scaledHp = Math.floor(baseEnemy.maxHp * scalingFactor);
  const scaledAtk = Math.floor(baseEnemy.atk * scalingFactor);
  const scaledSoftDef = Math.floor(baseEnemy.softDef * scalingFactor);
  
  const hardDefCap = zoneId >= 8 ? 35 : (zoneId >= 6 ? 25 : (zoneId >= 4 ? 15 : 10));
  const scaledHardDefPercent = Math.min(
    hardDefCap,
    Math.max(0, baseEnemy.hardDefPercent + Math.floor(levelDiff * 0.3))
  );

  let count = 1;
  if (zoneId > 0 && Math.random() < 0.3) {
    const maxCount = zoneId === 1 ? 2 : (zoneId < 4 ? 3 : 4);
    count = Math.floor(Math.random() * (maxCount - 1)) + 2;
  }

  const groupHpMultiplier = count > 1 ? (1 + (count - 1) * 0.7) : 1;
  const finalHp = Math.floor(scaledHp * groupHpMultiplier);

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
    attackSpeed: baseEnemy.attackSpeed,
    count,
    element: baseEnemy.element,
  };
}