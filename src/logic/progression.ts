import { Character } from "../types/character";

export const STARTING_STAT_POINTS = 12; // Phase 4 Rebalance: Increased from 9 to 12
export const STAT_POINTS_PER_LEVEL = 4; // Phase 4 Rebalance: Increased from 3 to 4
export const MAX_LEVEL = 50;

// Helper to calculate total available points for a level
export function calculateTotalStatPoints(level: number): number {
  return STARTING_STAT_POINTS + (level - 1) * STAT_POINTS_PER_LEVEL;
}

// Helper to calculate total points spent across all stats
export function calculateSpentPoints(stats: Character["stats"]): number {
  // Each stat starts at 1, so points spent = current value - 1
  return (
    (stats.str - 1) +
    (stats.agi - 1) +
    (stats.vit - 1) +
    (stats.int - 1) +
    (stats.dex - 1) +
    (stats.luk - 1)
  );
}

// Helper to get available unspent points
export function getAvailableStatPoints(char: Character): number {
  const total = calculateTotalStatPoints(char.level);
  const spent = calculateSpentPoints(char.stats);
  return Math.max(0, total - spent);
}

// Initialize a new character
export function createNewCharacter(name: string): Character {
  return {
    id: Date.now().toString(),
    name,
    level: 1,
    jobClass: "Novice",
    experience: 0,
    zeny: 0,
    stats: {
      str: 1,
      agi: 1,
      vit: 1,
      int: 1,
      dex: 1,
      luk: 1,
    },
    statPoints: STARTING_STAT_POINTS,
  };
}