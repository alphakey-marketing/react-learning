// Quest chains for "You Are the Monster" — moral inversion narrative
// Step completion text is the emotional payload — a journal entry about the player that gets increasingly disturbing

export type QuestEndingChoice = "seal" | "unbound" | null;

export interface QuestStep {
  id: string;
  title: string;
  description: string;  // shown before completion — what you are tasked to find
  requiredItemId: string;
  completionText: string;  // emotional payload on completing the step (journal entry tone)
  corruptionGain: number;  // corruption gained when this step is completed
}

export interface QuestChain {
  id: string;
  title: string;
  subtitle: string;
  steps: QuestStep[];
  isComplete: boolean; // derived, not stored
}

export const QUEST_CHAINS: Omit<QuestChain, "isComplete">[] = [
  // ── Chain 1: "The Birthmark Bleeds" ─────────────────────────────────────
  {
    id: "chain_birthmark",
    title: "The Birthmark Bleeds",
    subtitle: "Something in the Plains knows what you are.",
    steps: [
      {
        id: "step_poring_core",
        title: "Something Wrong in the Core",
        description:
          "The creatures in the Beginner Plains flee from most adventurers. They don't flee from you. Kill a Poring and take what it leaves behind.",
        requiredItemId: "strange_poring_core",
        completionText:
          "You brought it to the Elder and he went pale. 'Where did you find this?' he whispered. 'That's the mark of the Old Blood. We hoped it died with your parents.' He wouldn't say more. He kept looking at your wrist.",
        corruptionGain: 5,
      },
      {
        id: "step_wolf_fang",
        title: "The Rune You Were Born With",
        description:
          "The wolves in the Dark Forest are carving something into their own bones. Find one and take a fang.",
        requiredItemId: "wolf_fang_cursed",
        completionText:
          "You showed the fang to the hunter and watched her back away. 'I've seen this rune in two places,' she said. 'On a grave out east. And on the creature that made the grave.' She looked at your wrist. 'You have it too,' she said. 'How long have you had it?'",
        corruptionGain: 10,
      },
    ],
  },

  // ── Chain 2: "The Mountain Remembers" ───────────────────────────────────
  {
    id: "chain_mountain",
    title: "The Mountain Remembers",
    subtitle: "They prepared for you centuries before you were born.",
    steps: [
      {
        id: "step_orc_seal",
        title: "Your Face in the Metal",
        description:
          "The Orc Warriors in the Mountain Path carry command tokens from a war that ended three hundred years ago. Kill one. Look at what it's carrying.",
        requiredItemId: "orc_war_seal",
        completionText:
          "The archivist studied it for a long time without speaking. 'This is a kill-on-sight order,' she said. 'Issued three centuries ago. The face on the front is yours. The scar is yours. The name on the back is yours.' She slid it back across the table. 'The seal is real. I can't help you.'",
        corruptionGain: 10,
      },
      {
        id: "step_rune_fragment",
        title: "Do Not Speak to It. Run.",
        description:
          "The Golems here are older than the kingdom. Something is inscribed on their cores — the same inscription in every one. Break one open and take the fragment.",
        requiredItemId: "mountain_rune_fragment",
        completionText:
          "You assembled the fragments. The full inscription read: 'It killed seventeen of ours before we contained it. It did not understand what it was doing. It was crying the whole time. If you are reading this, the bloodline has woken again. We are sorry. We could not find a better way.' The translation ends there.",
        corruptionGain: 15,
      },
    ],
  },

  // ── Chain 3: "The Rite of Unmaking" ─────────────────────────────────────
  {
    id: "chain_rite",
    title: "The Rite of Unmaking",
    subtitle: "There is no version of this story where you are not the monster.",
    steps: [
      {
        id: "step_blood_sigil",
        title: "The Stain That Follows",
        description:
          "The mummies in the Desert Ruins are not dead. They are sealed. Something in the wrappings is the same thing that is in you. Find one and take what remains.",
        requiredItemId: "desert_blood_sigil",
        completionText:
          "The desert sage recognised the sigil before you had finished unwrapping it. She stepped back. 'The last person who held that came to me seeking a cure,' she said. 'There is no cure. There is only the Rite or the Seal.' She closed her eyes. 'They chose the Rite. I watched them finish it. I am the only one who saw what they became. I still can't sleep.'",
        corruptionGain: 15,
      },
      {
        id: "step_frozen_core",
        title: "It Knew You Were Coming",
        description:
          "An Ice Titan guards the mountain pass. It has not moved in forty years. Local records say it started moving the day you entered the region. Defeat it and take its core.",
        requiredItemId: "frozen_seal_core",
        completionText:
          "The sage stands between you and the pass, shoulders straight. 'You have a choice,' she says. 'You can seal it again — the fragment, the sigil, the core. Lock it back into the mountain. Live your life. You will never be fully human, but you will be close enough.' She holds out her hand. 'Or you can finish what you are.' She does not look afraid. She looks tired. 'I will not stop you either way. I stopped trying to stop it three centuries ago.'",
        corruptionGain: 0, // corruption from ending choice instead
      },
    ],
  },
];

// Lookup by chain id
export function getQuestChain(chainId: string): Omit<QuestChain, "isComplete"> | undefined {
  return QUEST_CHAINS.find((c) => c.id === chainId);
}

// Given a record of completed step IDs, determine the active step index for a chain
export function getActiveStepIndex(
  chainId: string,
  completedStepIds: Record<string, boolean>
): number {
  const chain = getQuestChain(chainId);
  if (!chain) return 0;
  for (let i = 0; i < chain.steps.length; i++) {
    if (!completedStepIds[chain.steps[i].id]) return i;
  }
  return chain.steps.length; // all complete
}

// Check if a chain is fully complete
export function isChainComplete(
  chainId: string,
  completedStepIds: Record<string, boolean>
): boolean {
  const chain = getQuestChain(chainId);
  if (!chain) return false;
  return chain.steps.every((s) => completedStepIds[s.id]);
}

// The ending choices for Chain 3
export const ENDING_CHOICES = {
  seal: {
    key: "seal" as const,
    label: "Seal the Bloodline",
    description:
      "Hand over the core, the sigil, the fang. Lock it back in. Live as close to human as you will ever get.",
    corruptionChange: -20, // corruption drops
    epilogue:
      "You handed everything over. The sage sealed the pass again without ceremony. You walked back down the mountain and tried to forget the inscription. You almost succeeded. Some nights you still hear the wolf fang hum against the glass where you keep it. You didn't give her everything.",
  },
  unbound: {
    key: "unbound" as const,
    label: "Remain Unbound",
    description:
      "Keep the core. Walk through the pass. Find out what you become on the other side.",
    corruptionChange: +30,
    epilogue:
      "The sage didn't try to stop you. She just said: 'Remember that it was crying.' You walked through the pass. Whatever is on the other side doesn't have a name yet. You are the first one to arrive and stay conscious. You are writing these notes yourself.",
  },
} as const;
