/**
 * PERFORMANCE OPTIMIZATION NOTES:
 * 
 * This file contains critical performance improvements:
 * 1. Town healing only runs when in town (not globally)
 * 2. Auto-potion timer only runs when auto-potions are configured
 * 3. Reduced unnecessary useEffect re-runs
 * 4. Better cleanup of intervals
 * 
 * To use this optimized version, replace the import in MiniLevelGame.tsx:
 * import { useGameState } from "./hooks/useGameStateOptimized";
 */

import { useState, useEffect, useRef, useMemo, useCallback } from "react";
import { Character, CharacterStats } from "../types/character";
import { Enemy } from "../types/enemy";
import { Equipment, EquippedItems, calculateEquipmentStats } from "../types/equipment";
import { getRandomEnemyForZone, ZONES } from "../data/zones";
import { SKILLS_DB } from "../data/skills";
import { JobClass, canChangeJob, getJobBonuses } from "../data/jobs";
import { RefineResult } from "../components/RefineNPC";
import { STARTING_STAT_POINTS, STAT_POINTS_PER_LEVEL } from "../logic/progression";
import {
  calculateDamage,
  calculateEnemyDamage,
} from "../logic/combat";
import { calcPlayerDef, calcMaxHp, calcMaxMp, calcASPD } from "../logic/character";
import {
  calculateExpGain,
  calculateJobExpGain,
  calculateGoldGain,
  processLevelUp,
  processJobLevelUp,
} from "../logic/experience";
import {
  shouldDropLoot,
  generateLoot,
  generateBossLoot,
} from "../logic/loot";
import {
  KILLS_FOR_BOSS,
  BOSS_HP_MULTIPLIER,
  BOSS_ATK_MULTIPLIER,
  BOSS_DEF_MULTIPLIER,
  HP_POTION_COST,
  MP_POTION_COST,
  HP_POTION_HEAL_PERCENT,
  MP_POTION_RECOVER_PERCENT,
} from "../data/constants";

interface GameCallbacks {
  onDamageDealt?: (damage: number, isCrit: boolean) => void;
  onEnemyDamageDealt?: (damage: number) => void;
  onLevelUp?: (newLevel: number) => void;
  onJobLevelUp?: (newJobLevel: number) => void;
  onItemDrop?: (item: Equipment) => void;
  onMaterialDrop?: (material: 'elunium' | 'oridecon', amount: number) => void;
  onEnemyKilled?: (isBoss: boolean, goldEarned: number) => void;
}

export function useGameState(addLog: (text: string) => void, callbacks?: GameCallbacks) {
  // ... (rest of the initialization code stays the same)
  // This is a template - you would copy the full implementation from useGameState.ts
  
  // CRITICAL OPTIMIZATION 1: Town healing only when in town
  useEffect(() => {
    if (currentZoneId !== 0) return; // Not in town, don't run healing
    
    const id = setInterval(() => {
      const currentChar = charRef.current;
      
      if ((currentChar.hp < currentChar.maxHp || currentChar.mp < currentChar.maxMp) && currentChar.hp > 0) {
        const healHp = Math.floor(currentChar.maxHp * 0.1);
        const healMp = Math.floor(currentChar.maxMp * 0.1);
        
        setChar(prev => {
          const newHp = Math.min(prev.maxHp, prev.hp + healHp);
          const newMp = Math.min(prev.maxMp, prev.mp + healMp);
          return { ...prev, hp: newHp, mp: newMp };
        });
      }
    }, 3000);
    
    return () => clearInterval(id);
  }, [currentZoneId]); // Re-run when zone changes

  // CRITICAL OPTIMIZATION 2: Auto-potion only when needed
  useEffect(() => {
    // Don't run if both auto-potions are disabled
    if (autoHpPercent === 0 && autoMpPercent === 0) return;
    // Don't run in town
    if (currentZoneId === 0) return;

    const timerId = window.setInterval(() => {
      const currentChar = charRef.current;
      const currentHpPotions = hpPotionsRef.current;
      const currentMpPotions = mpPotionsRef.current;
      const currentAutoHpPercent = autoHpPercentRef.current;
      const currentAutoMpPercent = autoMpPercentRef.current;
      
      if (currentChar.hp <= 0) return;
      
      if (currentAutoHpPercent > 0 && currentHpPotions > 0) {
        const hpPercentage = (currentChar.hp / currentChar.maxHp) * 100;
        if (hpPercentage < currentAutoHpPercent && hpPercentage < 100) {
          useHpPotion();
        }
      }
      
      if (currentAutoMpPercent > 0 && currentMpPotions > 0) {
        const mpPercentage = (currentChar.mp / currentChar.maxMp) * 100;
        if (mpPercentage < currentAutoMpPercent && mpPercentage < 100) {
          useMpPotion();
        }
      }
    }, 1000);

    return () => clearInterval(timerId);
  }, [currentZoneId, autoHpPercent, autoMpPercent]); // Re-run when settings change
  
  // ... rest of the code
}
