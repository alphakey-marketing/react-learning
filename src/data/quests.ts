// Quest items for "You Are the Monster" narrative system
// Each item is a discovery that unsettles the player, not a fetch quest

export interface QuestItemDrop {
  enemyName: string;
  zoneId: number;
  isBossOnly: boolean; // true = only drops from boss version
  dropChance: number;  // 0–1 probability
}

export interface QuestItem {
  id: string;
  name: string;
  description: string; // unsettling flavor text
  icon: string;
  drop: QuestItemDrop;
  chainId: string;     // which quest chain this item belongs to
  stepIndex: number;   // which step in the chain (0-based)
}

export const QUEST_ITEMS: QuestItem[] = [
  // ── Chain 1: "The Birthmark Bleeds" ─────────────────────────────────────
  {
    id: "strange_poring_core",
    name: "Strange Poring Core",
    description:
      "Turns black the moment your fingers close around it. The Elder's dog hasn't stopped barking since you walked in.",
    icon: "🫀",
    drop: { enemyName: "Poring", zoneId: 1, isBossOnly: false, dropChance: 0.18 },
    chainId: "chain_birthmark",
    stepIndex: 0,
  },
  {
    id: "wolf_fang_cursed",
    name: "Cursed Wolf Fang",
    description:
      "The runes carved here match the birthmark on your wrist exactly. You've had it your whole life.",
    icon: "🦷",
    drop: { enemyName: "Wolf", zoneId: 2, isBossOnly: false, dropChance: 0.15 },
    chainId: "chain_birthmark",
    stepIndex: 1,
  },

  // ── Chain 2: "The Mountain Remembers" ───────────────────────────────────
  {
    id: "orc_war_seal",
    name: "Orc War Seal",
    description:
      "The command token bears your face. Not a likeness — your face, with your scar, rendered in metal that predates your birth.",
    icon: "🪙",
    drop: { enemyName: "Orc Warrior", zoneId: 3, isBossOnly: false, dropChance: 0.12 },
    chainId: "chain_mountain",
    stepIndex: 0,
  },
  {
    id: "mountain_rune_fragment",
    name: "Mountain Rune Fragment",
    description:
      "Translation: 'When the bloodline wakes, seal the mountain pass. Do not fight it. Do not speak to it. Run.'",
    icon: "🪨",
    drop: { enemyName: "Golem", zoneId: 3, isBossOnly: false, dropChance: 0.10 },
    chainId: "chain_mountain",
    stepIndex: 1,
  },

  // ── Chain 3: "The Rite of Unmaking" ─────────────────────────────────────
  {
    id: "desert_blood_sigil",
    name: "Desert Blood Sigil",
    description:
      "The mummy's wrappings are stained with something that isn't quite blood. When you hold the sigil, the stain moves toward your hand.",
    icon: "🔮",
    drop: { enemyName: "Mummy", zoneId: 4, isBossOnly: false, dropChance: 0.08 },
    chainId: "chain_rite",
    stepIndex: 0,
  },
  {
    id: "frozen_seal_core",
    name: "Frozen Seal Core",
    description:
      "Inside the core, something moves. It has been waiting for you specifically. It knew you were coming.",
    icon: "❄️",
    drop: { enemyName: "Ice Titan", zoneId: 5, isBossOnly: true, dropChance: 0.35 },
    chainId: "chain_rite",
    stepIndex: 1,
  },
];

// Lookup by questItemId
export function getQuestItem(id: string): QuestItem | undefined {
  return QUEST_ITEMS.find((q) => q.id === id);
}

// Get all quest items for a given chain
export function getQuestItemsForChain(chainId: string): QuestItem[] {
  return QUEST_ITEMS.filter((q) => q.chainId === chainId);
}
