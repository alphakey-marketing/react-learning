import { Equipment } from "../types/equipment";

export const STARTING_RESOURCES = {
  gold: 100,
  hpPotions: 5,
  mpPotions: 5,
  elunium: 0,
  oridecon: 0,
};

export const STARTING_WEAPON: Equipment = {
  id: -1,
  name: "Novice Knife",
  type: "weapon",
  weaponType: "dagger",
  rarity: "common",
  atk: 8,
  weaponLevel: 1,
  stat: 8,
  refinement: 0,
  slots: 0,
  weight: 50,
};

export const STARTING_ARMOR: Equipment = {
  id: -2,
  name: "Cotton Shirt",
  type: "armor",
  rarity: "common",
  def: 5,
  stat: 5,
  refinement: 0,
  slots: 0,
  weight: 80,
};

export const STARTING_FOOTGEAR: Equipment = {
  id: -3,
  name: "Sandals",
  type: "footgear",
  rarity: "common",
  def: 2,
  stat: 2,
  refinement: 0,
  slots: 0,
  weight: 20,
};
