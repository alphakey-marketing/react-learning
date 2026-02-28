import { Equipment } from "../types/equipment";
import { DROP_CHANCE } from "../data/constants";

export function shouldDropLoot(): boolean {
  return Math.random() < DROP_CHANCE;
}

export function generateLoot(playerLevel: number): Equipment {
  const isWeapon = Math.random() > 0.5;
  const statValue = Math.floor(Math.random() * 5) + 1 + playerLevel * 2;

  return {
    id: Date.now(),
    name: isWeapon ? `Sword +${statValue}` : `Armor +${statValue}`,
    type: isWeapon ? "weapon" : "armor",
    stat: statValue,
    rarity: statValue > 15 ? "epic" : statValue > 8 ? "rare" : "common",
  };
}

export function generateBossLoot(playerLevel: number): Equipment {
  const isWeapon = Math.random() > 0.5;
  const statValue = Math.floor(Math.random() * 10) + 5 + playerLevel * 3;

  return {
    id: Date.now(),
    name: isWeapon ? `Boss Sword +${statValue}` : `Boss Armor +${statValue}`,
    type: isWeapon ? "weapon" : "armor",
    stat: statValue,
    rarity: "epic",
  };
}
