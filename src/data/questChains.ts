// Quest chains for "You Are the Monster" — moral inversion narrative
// Step completion text is the emotional payload — a journal entry about the player that gets increasingly disturbing

export type QuestEndingChoice = "seal" | "unbound" | null;

export interface QuestStep {
  id: string;
  title: string;
  description: string;  // shown before completion — what you are tasked to find
  requiredItemId: string;
  completionText: string;  // emotional payload on completing the step (journal entry tone)
  corruptionGain: number;  // base corruption gain (now determined by dialogue choice below)
  introDialogue: string;   // NPC dialogue shown when quest first becomes available (pre-accept)
  dialogueChoices: {       // choices shown in Quest Log after submitting the item
    label: string;         // short button label
    text: string;          // narrative response text shown after choosing
    corruptionDelta: number; // positive = more corruption, negative = less
  }[];
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
        introDialogue:
          "The Elder pulls you aside before you leave the village. His hands are shaking. 'Something is wrong with the creatures in the Plains,' he says. 'They don't run from you like they do from others. They gather. Kill one — a Poring — and bring me whatever comes out of it. I need to see this for myself.'",
        dialogueChoices: [
          {
            label: "Let the Elder keep it",
            text: "You handed it over without hesitation and answered every question. 'You are still in control,' he said quietly. 'For now.' He kept the core locked away. You felt something ease.",
            corruptionDelta: -2,
          },
          {
            label: "Keep a piece for yourself",
            text: "You gave the Elder most of it. But you kept a small fragment in your pocket. It pulsed once when your fingers closed around it. You pretended not to notice.",
            corruptionDelta: +5,
          },
        ],
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
        introDialogue:
          "A hunter stops you on the forest road. She doesn't explain how she found you. 'The wolves in the Dark Forest are carving runes into their own bones,' she says. 'I've been watching them for three weeks. Then you arrived and they started carving faster. The rune matches what's on your wrist exactly. Kill one and bring me the fang. I think I know what this means.'",
        dialogueChoices: [
          {
            label: "Study it as a warning",
            text: "You spent time with the hunter, mapping the rune — trying to understand it as a message rather than an invitation. 'Knowing it doesn't mean becoming it,' she said. You almost believed her.",
            corruptionDelta: -3,
          },
          {
            label: "Embrace what it means",
            text: "The rune on the fang and the one on your wrist are identical. You stopped pretending to be surprised. The hunter took a step back. You didn't reach for her.",
            corruptionDelta: +5,
          },
        ],
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
        introDialogue:
          "A sealed letter arrives from the city archive with a messenger who refuses to make eye contact. 'Come to me before I lose my nerve,' it reads. 'I have found something with your name on it. Literally.' The archivist is waiting, hands folded, not looking at the door.",
        dialogueChoices: [
          {
            label: "Leave it with the archivist",
            text: "'Someone should know about this,' you said. The archivist looked relieved and afraid at once. You left the seal with her. You told yourself it was the right thing to do.",
            corruptionDelta: -3,
          },
          {
            label: "Take back the seal",
            text: "You pocketed the seal before she could lock it away. 'It has my face on it,' you said. 'That makes it mine.' She didn't argue. She was afraid of what arguing might mean.",
            corruptionDelta: +5,
          },
        ],
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
        introDialogue:
          "The archivist finds you herself this time — she looks like she hasn't slept. 'The inscription is in all of the Golems. Every one. The same text. And the final section—' She stops. 'You need to read what it says about you. Break one open and bring me the fragment. I'll show you the full translation.'",
        dialogueChoices: [
          {
            label: "Treat it as history",
            text: "You read it, folded it away, and said: 'I understand it as a warning. Not instructions.' The archivist exhaled. 'Good,' she said. 'That's what I needed to hear.'",
            corruptionDelta: -4,
          },
          {
            label: "Accept what it describes",
            text: "You read the inscription three times and felt something settle. Not dread — recognition. 'They were right to be afraid,' you said quietly. The archivist pushed her chair back from the table.",
            corruptionDelta: +7,
          },
        ],
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
        introDialogue:
          "The desert sage is waiting at the ruins entrance, fire burning despite the midday heat. 'I know who you are,' she says. 'I've been waiting. The mummies sealed in these walls contain something that responds to your bloodline. Go in. Find one. Bring me what you can carry out.'",
        dialogueChoices: [
          {
            label: "Give it to the sage",
            text: "'Take it,' you said. 'You know what to do with this better than I do.' The sage didn't look grateful. She looked sad. 'That's the first wise thing anyone from your bloodline has said in three centuries,' she told you.",
            corruptionDelta: -5,
          },
          {
            label: "Hold onto it yourself",
            text: "The sigil moved toward your hand and you let it. The sage watched without speaking. You felt it settle against your palm like something returning home. 'I'll carry it myself,' you said.",
            corruptionDelta: +8,
          },
        ],
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
        introDialogue:
          "The sage wakes you before dawn, lantern in hand. 'The Titan moved last night,' she says. 'First time in forty years. It stopped — facing your camp.' She holds your gaze. 'It is waiting for you specifically. I don't know what it will give you when you defeat it, but I know it will let you defeat it. It has been preparing for this.'",
        dialogueChoices: [
          {
            label: "Give the core to the sage",
            text: "You placed it in her hands without ceremony. The Titan's remaining fragments crumbled as if released. The sage sealed the core and said nothing. You felt the weight of something ease.",
            corruptionDelta: -8,
          },
          {
            label: "Keep the core",
            text: "You closed both hands around the core. Whatever moves inside it slowed — not resisting, but settling. 'This belongs with me,' you said. No one disagreed.",
            corruptionDelta: +10,
          },
        ],
      },
    ],
  },
];

// The canonical order in which quest chains unlock
export const QUEST_CHAIN_ORDER: readonly string[] = [
  "chain_birthmark",
  "chain_mountain",
  "chain_rite",
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
    corruptionChange: -20, // reduces corruption by 20
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
