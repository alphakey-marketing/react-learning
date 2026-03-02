import { useState, useEffect, useRef, useCallback } from "react";
import { Achievement, PlayerAchievements } from "../types/achievement";
import { ACHIEVEMENTS_DB } from "../data/achievements";
import { Character } from "../types/character";
import { Equipment } from "../types/equipment";

interface AchievementStats {
  total_kills: number;
  boss_kills: number;
  max_damage: number;
  base_level: number;
  job_level: number;
  max_stat: number;
  skills_learned: number;
  job_changes: number;
  total_gold_earned: number;
  unique_items_owned: number;
  items_sold: number;
  potions_used: number;
  zones_visited: number;
  combat_time: number;
  deaths: number;
}

interface UseAchievementsReturn {
  playerAchievements: PlayerAchievements;
  stats: AchievementStats;
  newlyUnlocked: Achievement[];
  clearNewlyUnlocked: () => void;
  trackKill: (isBoss: boolean) => void;
  trackDamage: (damage: number) => void;
  trackGoldEarned: (gold: number) => void;
  trackItemSold: () => void;
  trackPotionUsed: () => void;
  trackZoneVisit: (zoneId: number) => void;
  trackDeath: () => void;
  trackJobChange: () => void;
  updateCharacterStats: (char: Character, inventory: Equipment[]) => void;
}

export function useAchievements(): UseAchievementsReturn {
  const [stats, setStats] = useState<AchievementStats>({
    total_kills: 0,
    boss_kills: 0,
    max_damage: 0,
    base_level: 1,
    job_level: 1,
    max_stat: 1,
    skills_learned: 1,
    job_changes: 0,
    total_gold_earned: 0,
    unique_items_owned: 0,
    items_sold: 0,
    potions_used: 0,
    zones_visited: 1,
    combat_time: 0,
    deaths: 0,
  });

  const [playerAchievements, setPlayerAchievements] = useState<PlayerAchievements>({
    unlocked: new Set<string>(),
    progress: {},
    titles: [],
    selectedTitle: undefined,
  });

  const [newlyUnlocked, setNewlyUnlocked] = useState<Achievement[]>([]);
  const visitedZones = useRef<Set<number>>(new Set([0]));
  const uniqueItemsOwned = useRef<Set<string>>(new Set());
  const combatStartTime = useRef<number>(0);

  // Check for newly unlocked achievements
  const checkAchievements = useCallback(() => {
    const newUnlocks: Achievement[] = [];

    ACHIEVEMENTS_DB.forEach((achievement) => {
      if (playerAchievements.unlocked.has(achievement.id)) return;

      const reqType = achievement.requirement.type;
      const reqTarget = achievement.requirement.target;
      const currentValue = stats[reqType as keyof AchievementStats] || 0;

      if (currentValue >= reqTarget) {
        newUnlocks.push(achievement);
      }
    });

    if (newUnlocks.length > 0) {
      setPlayerAchievements((prev) => {
        const newUnlockedSet = new Set(prev.unlocked);
        const newTitles = [...prev.titles];

        newUnlocks.forEach((ach) => {
          newUnlockedSet.add(ach.id);
          if (ach.rewardTitle && !newTitles.includes(ach.rewardTitle)) {
            newTitles.push(ach.rewardTitle);
          }
        });

        return {
          ...prev,
          unlocked: newUnlockedSet,
          titles: newTitles,
          selectedTitle: prev.selectedTitle || newTitles[0],
        };
      });

      setNewlyUnlocked((prev) => [...prev, ...newUnlocks]);
    }
  }, [stats, playerAchievements.unlocked]);

  useEffect(() => {
    checkAchievements();
  }, [checkAchievements]);

  // Update progress for all achievements
  useEffect(() => {
    const newProgress: Record<string, number> = {};
    Object.keys(stats).forEach((key) => {
      newProgress[key] = stats[key as keyof AchievementStats];
    });
    setPlayerAchievements((prev) => ({ ...prev, progress: newProgress }));
  }, [stats]);

  const trackKill = useCallback((isBoss: boolean) => {
    setStats((prev) => ({
      ...prev,
      total_kills: prev.total_kills + 1,
      boss_kills: isBoss ? prev.boss_kills + 1 : prev.boss_kills,
    }));
  }, []);

  const trackDamage = useCallback((damage: number) => {
    setStats((prev) => ({
      ...prev,
      max_damage: Math.max(prev.max_damage, damage),
    }));
  }, []);

  const trackGoldEarned = useCallback((gold: number) => {
    setStats((prev) => ({
      ...prev,
      total_gold_earned: prev.total_gold_earned + gold,
    }));
  }, []);

  const trackItemSold = useCallback(() => {
    setStats((prev) => ({ ...prev, items_sold: prev.items_sold + 1 }));
  }, []);

  const trackPotionUsed = useCallback(() => {
    setStats((prev) => ({ ...prev, potions_used: prev.potions_used + 1 }));
  }, []);

  const trackZoneVisit = useCallback((zoneId: number) => {
    if (!visitedZones.current.has(zoneId)) {
      visitedZones.current.add(zoneId);
      setStats((prev) => ({ ...prev, zones_visited: visitedZones.current.size }));
    }
  }, []);

  const trackDeath = useCallback(() => {
    setStats((prev) => ({ ...prev, deaths: prev.deaths + 1 }));
  }, []);

  const trackJobChange = useCallback(() => {
    setStats((prev) => ({ ...prev, job_changes: prev.job_changes + 1 }));
  }, []);

  const updateCharacterStats = useCallback((char: Character, inventory: Equipment[]) => {
    // Update character-related stats
    const maxStat = Math.max(
      char.stats.str,
      char.stats.agi,
      char.stats.vit,
      char.stats.int,
      char.stats.dex,
      char.stats.luk
    );

    const skillsLearned = Object.keys(char.learnedSkills).length;

    // Track unique items
    inventory.forEach((item) => {
      uniqueItemsOwned.current.add(item.id);
    });

    setStats((prev) => ({
      ...prev,
      base_level: char.level,
      job_level: char.jobLevel,
      max_stat: maxStat,
      skills_learned: skillsLearned,
      unique_items_owned: uniqueItemsOwned.current.size,
    }));
  }, []);

  const clearNewlyUnlocked = useCallback(() => {
    setNewlyUnlocked([]);
  }, []);

  return {
    playerAchievements,
    stats,
    newlyUnlocked,
    clearNewlyUnlocked,
    trackKill,
    trackDamage,
    trackGoldEarned,
    trackItemSold,
    trackPotionUsed,
    trackZoneVisit,
    trackDeath,
    trackJobChange,
    updateCharacterStats,
  };
}
