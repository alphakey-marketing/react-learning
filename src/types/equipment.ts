export interface Equipment {
  id: number;
  name: string;
  type: "weapon" | "armor";
  stat: number;
  rarity: "common" | "rare" | "epic";
}

export interface EquippedItems {
  weapon: Equipment | null;
  armor: Equipment | null;
}
