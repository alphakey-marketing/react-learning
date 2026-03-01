import { Zone } from "../types/enemy";

export const ZONES: Zone[] = [
  {
    id: 0,
    name: "🏛️ Town",
    minLevel: 1,
    enemies: [],
  },
  {
    id: 1,
    name: "🌱 Beginner Plains",
    minLevel: 1,
    enemies: [
      { name: "Slime", level: 1, hp: 30, maxHp: 30, atk: 5, def: 2, attackSpeed: 0.8 },
      { name: "Poring", level: 1, hp: 35, maxHp: 35, atk: 4, def: 1, attackSpeed: 0.7 },
      { name: "Lunatic", level: 2, hp: 45, maxHp: 45, atk: 6, def: 2, attackSpeed: 0.9 },
    ],
  },
  {
    id: 2,
    name: "🌲 Dark Forest",
    minLevel: 5,
    enemies: [
      { name: "Goblin", level: 5, hp: 100, maxHp: 100, atk: 12, def: 6, attackSpeed: 1.0 },
      { name: "Wolf", level: 6, hp: 120, maxHp: 120, atk: 15, def: 5, attackSpeed: 1.2 },
      { name: "Orc Warrior", level: 7, hp: 150, maxHp: 150, atk: 18, def: 8, attackSpeed: 0.9 },
    ],
  },
  {
    id: 3,
    name: "⛰️ Mountain Path",
    minLevel: 10,
    enemies: [
      { name: "Golem", level: 10, hp: 250, maxHp: 250, atk: 25, def: 15, attackSpeed: 0.6 },
      { name: "Giant Spider", level: 11, hp: 200, maxHp: 200, atk: 28, def: 10, attackSpeed: 1.1 },
      { name: "Harpy", level: 12, hp: 220, maxHp: 220, atk: 30, def: 12, attackSpeed: 1.3 },
    ],
  },
  {
    id: 4,
    name: "🏜️ Desert Ruins",
    minLevel: 15,
    enemies: [
      { name: "Sand Worm", level: 15, hp: 350, maxHp: 350, atk: 35, def: 18, attackSpeed: 0.8 },
      { name: "Mummy", level: 16, hp: 400, maxHp: 400, atk: 38, def: 20, attackSpeed: 0.7 },
      { name: "Scorpion King", level: 17, hp: 450, maxHp: 450, atk: 42, def: 22, attackSpeed: 1.4 },
    ],
  },
  {
    id: 5,
    name: "❄️ Frozen Cavern",
    minLevel: 20,
    enemies: [
      { name: "Ice Elemental", level: 20, hp: 500, maxHp: 500, atk: 45, def: 25, attackSpeed: 1.0 },
      { name: "Frost Giant", level: 21, hp: 600, maxHp: 600, atk: 50, def: 30, attackSpeed: 0.8 },
      { name: "Yeti", level: 22, hp: 550, maxHp: 550, atk: 48, def: 28, attackSpeed: 1.1 },
    ],
  },
  {
    id: 6,
    name: "🌋 Volcanic Depths",
    minLevel: 25,
    enemies: [
      { name: "Fire Imp", level: 25, hp: 650, maxHp: 650, atk: 55, def: 32, attackSpeed: 1.3 },
      { name: "Lava Golem", level: 26, hp: 800, maxHp: 800, atk: 60, def: 40, attackSpeed: 0.7 },
      { name: "Magma Dragon", level: 27, hp: 750, maxHp: 750, atk: 58, def: 35, attackSpeed: 1.2 },
    ],
  },
  {
    id: 7,
    name: "🏰 Ancient Castle",
    minLevel: 30,
    enemies: [
      { name: "Death Knight", level: 30, hp: 900, maxHp: 900, atk: 65, def: 45, attackSpeed: 1.0 },
      { name: "Vampire Lord", level: 31, hp: 850, maxHp: 850, atk: 70, def: 40, attackSpeed: 1.4 },
      { name: "Lich", level: 32, hp: 800, maxHp: 800, atk: 68, def: 42, attackSpeed: 0.9 },
    ],
  },
  {
    id: 8,
    name: "🌌 Void Dimension",
    minLevel: 35,
    enemies: [
      { name: "Shadow Demon", level: 35, hp: 1000, maxHp: 1000, atk: 75, def: 50, attackSpeed: 1.5 },
      { name: "Void Walker", level: 36, hp: 1100, maxHp: 1100, atk: 80, def: 52, attackSpeed: 1.3 },
      { name: "Chaos Beast", level: 37, hp: 1200, maxHp: 1200, atk: 85, def: 55, attackSpeed: 1.6 },
    ],
  },
];

export function getRandomEnemyForZone(zoneId: number, playerLevel: number) {
  const zone = ZONES.find((z) => z.id === zoneId);
  if (!zone || zone.enemies.length === 0) {
    return {
      name: "Practice Dummy",
      level: 1,
      hp: 50,
      maxHp: 50,
      atk: 0,
      def: 0,
      attackSpeed: 0,
    };
  }

  const randomEnemy = zone.enemies[Math.floor(Math.random() * zone.enemies.length)];
  const scaledHp = Math.floor(randomEnemy.maxHp * (1 + playerLevel * 0.05));
  const scaledAtk = Math.floor(randomEnemy.atk * (1 + playerLevel * 0.03));

  return {
    ...randomEnemy,
    hp: scaledHp,
    maxHp: scaledHp,
    atk: scaledAtk,
  };
}
