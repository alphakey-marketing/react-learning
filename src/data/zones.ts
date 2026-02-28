import { Zone } from "../types/enemy";

export const ZONES: Zone[] = [
  {
    id: 1,
    name: "🌱 新手草原",
    minLevel: 1,
    enemies: [
      { name: "Slime", level: 1, hp: 30, maxHp: 30, atk: 5, def: 2 },
      { name: "Goblin", level: 2, hp: 50, maxHp: 50, atk: 8, def: 4 },
    ],
  },
  {
    id: 2,
    name: "🌲 黑暗森林",
    minLevel: 5,
    enemies: [
      { name: "Goblin", level: 2, hp: 50, maxHp: 50, atk: 8, def: 4 },
      { name: "Orc", level: 4, hp: 80, maxHp: 80, atk: 12, def: 6 },
      { name: "Wolf", level: 5, hp: 100, maxHp: 100, atk: 15, def: 8 },
    ],
  },
  {
    id: 3,
    name: "💀 骷髏洞穴",
    minLevel: 10,
    enemies: [
      { name: "Orc", level: 4, hp: 80, maxHp: 80, atk: 12, def: 6 },
      { name: "Skeleton", level: 8, hp: 140, maxHp: 140, atk: 18, def: 10 },
      { name: "Demon", level: 10, hp: 200, maxHp: 200, atk: 25, def: 15 },
    ],
  },
];

export function getEnemyPool(zoneId: number) {
  const zone = ZONES.find((z) => z.id === zoneId);
  return zone ? zone.enemies : ZONES[0].enemies;
}

export function getRandomEnemyForZone(zoneId: number, playerLevel: number) {
  const pool = getEnemyPool(zoneId);
  if (pool.length === 0) return { ...ZONES[0].enemies[0] };
  const random = pool[Math.floor(Math.random() * pool.length)];
  return { ...random };
}
