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
  STARTING_RESOURCES, 
  STARTING_WEAPON, 
  STARTING_ARMOR, 
  STARTING_FOOTGEAR,
  STARTING_WAND,
  NOVICE_WAND
} from "../data/startingEquipment";
import {
  calculateDamage,
  calculateEnemyDamage,
} from "../logic/combat";
import { calcPlayerDef, calcMaxHp, calcMaxMp, calcASPD, calcPlayerAtk } from "../logic/character";
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
  checkQuestItemDrop,
} from "../logic/loot";
import { getCorruptionModifiers } from "../logic/corruption";
import { QUEST_CHAINS, QuestEndingChoice, ENDING_CHOICES, isChainComplete } from "../data/questChains";
import {
  KILLS_FOR_BOSS,
  BOSS_HP_MULTIPLIER,
  BOSS_ATK_MULTIPLIER,
  BOSS_DEF_MULTIPLIER,
  HP_POTION_COST,
  MP_POTION_COST,
  HP_POTION_HEAL_PERCENT,
  HP_POTION_HEAL_FLAT,
  MP_POTION_RECOVER_PERCENT,
  REFINEMENT_MATERIAL_COSTS,
  REFINEMENT_GOLD_MULTIPLIER,
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

// Track active debuffs on the enemy (e.g. Provoke, Stone Curse)
export interface ActiveDebuff {
  id: string;
  expiresAt: number;
  skillLevel: number;
}

// Track active self-buffs (e.g. Endure, True Sight)
export interface ActiveSelfBuff {
  id: string;
  expiresAt: number;
  skillLevel: number;
}

// Helper: find the quest step that requires a given item ID.
// Pure function — operates only on static QUEST_CHAINS data.
function findQuestStepByItemId(itemId: string): {
  chainId: string;
  chainTitle: string;
  stepId: string;
  stepTitle: string;
  completionText: string;
  corruptionGain: number;
} | null {
  for (const chain of QUEST_CHAINS) {
    for (const step of chain.steps) {
      if (step.requiredItemId === itemId) {
        return {
          chainId: chain.id,
          chainTitle: chain.title,
          stepId: step.id,
          stepTitle: step.title,
          completionText: step.completionText,
          corruptionGain: step.corruptionGain,
        };
      }
    }
  }
  return null;
}

// Helper: derive the set of already-obtained quest item IDs from completed step IDs.
// Used to prevent re-dropping items whose steps are already done.
function getCollectedQuestItemIds(completedStepIds: Record<string, boolean>): string[] {
  const itemIds: string[] = [];
  for (const chain of QUEST_CHAINS) {
    for (const step of chain.steps) {
      if (completedStepIds[step.id] && step.requiredItemId) {
        itemIds.push(step.requiredItemId);
      }
    }
  }
  return itemIds;
}

// Helper: apply corruption-tier stat multipliers to a freshly spawned enemy.
// Call only at spawn time — never on every tick.
function applyCorruptionScaling(enemy: Enemy, corruptionLevel: number): Enemy {
  const mods = getCorruptionModifiers(corruptionLevel);
  if (mods.enemyHpMult === 1.0 && mods.enemyAtkMult === 1.0 && mods.enemyDefMult === 1.0) {
    return enemy;
  }
  return {
    ...enemy,
    hp: Math.floor(enemy.hp * mods.enemyHpMult),
    maxHp: Math.floor(enemy.maxHp * mods.enemyHpMult),
    atk: Math.floor(enemy.atk * mods.enemyAtkMult),
    softDef: Math.floor(enemy.softDef * mods.enemyDefMult),
    hardDefPercent: Math.min(80, Math.floor(enemy.hardDefPercent * mods.enemyDefMult)),
  };
}

export function useGameState(addLog: (text: string) => void, callbacks?: GameCallbacks) {
  const initialLevel = 1;
  const initialStats = { str: 1, agi: 1, vit: 1, int: 1, dex: 1, luk: 1 };
  const initialJobClass = "Novice";
  const initialMaxHp = calcMaxHp(initialLevel, initialStats.vit, initialJobClass);
  const initialMaxMp = calcMaxMp(initialLevel, initialStats.int, initialJobClass);

  const [char, setChar] = useState<Character>({
    level: initialLevel,
    exp: 0,
    expToNext: 100,
    hp: initialMaxHp,
    maxHp: initialMaxHp,
    mp: initialMaxMp,
    maxMp: initialMaxMp,
    gold: STARTING_RESOURCES.gold,
    stats: initialStats,
    statPoints: STARTING_STAT_POINTS,
    jobClass: initialJobClass,
    jobLevel: 1,
    jobExp: 0,
    jobExpToNext: 50,
    skillPoints: 3,
    learnedSkills: { basic_attack: 1 },
    autoAttackSkillId: "basic_attack",
    elunium: STARTING_RESOURCES.elunium,
    oridecon: STARTING_RESOURCES.oridecon,
    corruptionLevel: 0,
    completedStepIds: {},
    questEnding: null,
  });

  const [enemy, setEnemy] = useState<Enemy>(() =>
    getRandomEnemyForZone(0, 1)
  );

  // BALANCE: Start with both weapons in inventory - player chooses their path
  const [inventory, setInventory] = useState<Equipment[]>([STARTING_WEAPON, NOVICE_WAND]);

  // BALANCE: Start with no weapon equipped - player must choose
  const [equipped, setEquipped] = useState<EquippedItems>({
    weapon: null,
    armor: STARTING_ARMOR,
    head: null,
    garment: null,
    footgear: STARTING_FOOTGEAR,
    accessory1: null,
    accessory2: null,
  });

  const [currentZoneId, setCurrentZoneId] = useState<number>(0);
  const [unlockedZoneIds, setUnlockedZoneIds] = useState<number[]>([0, 1]);
  const [killCount, setKillCount] = useState<number>(0);
  const [bossAvailable, setBossAvailable] = useState<boolean>(false);
  const [bossDefeated, setBossDefeated] = useState<boolean>(false);
  const [isBossFight, setIsBossFight] = useState<boolean>(false);

  const [hpPotions, setHpPotions] = useState<number>(STARTING_RESOURCES.hpPotions);
  const [mpPotions, setMpPotions] = useState<number>(STARTING_RESOURCES.mpPotions);
  const [autoHpPercent, setAutoHpPercent] = useState<number>(0);
  const [autoMpPercent, setAutoMpPercent] = useState<number>(0);

  const [showSkillWindow, setShowSkillWindow] = useState<boolean>(false);
  const [showJobChangeNPC, setShowJobChangeNPC] = useState<boolean>(false);
  const [showDeathModal, setShowDeathModal] = useState<boolean>(false);
  
  // Advanced Combat tracking
  const [skillCooldowns, setSkillCooldowns] = useState<Record<string, number>>({});
  const [activeDebuffs, setActiveDebuffs] = useState<ActiveDebuff[]>([]);
  const [activeSelfBuffs, setActiveSelfBuffs] = useState<ActiveSelfBuff[]>([]);

  const [lastAttackTime, setLastAttackTime] = useState<number>(0);
  const [canAttack, setCanAttack] = useState<boolean>(true);
  const [attackCooldownPercent, setAttackCooldownPercent] = useState<number>(100);
  
  const [autoAttackEnabled, setAutoAttackEnabled] = useState<boolean>(false);

  // ── Quest modal state ─────────────────────────────────────────────────────
  const [questStepCompleted, setQuestStepCompleted] = useState<{
    chainTitle: string;
    stepTitle: string;
    completionText: string;
    corruptionGain: number;
  } | null>(null);
  const [showEndingChoice, setShowEndingChoice] = useState<boolean>(false);
  // Tracks whether we have already auto-shown the ending modal this session
  const endingChoiceShownRef = useRef<boolean>(false);

  const enemyAttackTimerRef = useRef<number | null>(null);
  const autoPotionTimerRef = useRef<number | null>(null);
  const debuffCleanupTimerRef = useRef<number | null>(null);
  const isMountedRef = useRef<boolean>(true);
  const lastAutoPotionTimeRef = useRef<number>(0);
  const lastEnemyAttackTimeRef = useRef<number>(0);
  
  // STABILITY FIX: Prevent concurrent battleAction executions
  const battleActionInProgressRef = useRef<boolean>(false);
  const skillCooldownsRef = useRef<Record<string, number>>({});

  const townHealingRef = useRef<() => void>(() => {});
  
  const callbacksRef = useRef<GameCallbacks | undefined>(callbacks);
  const charRef = useRef<Character>(char);
  const equippedRef = useRef<EquippedItems>(equipped);
  const enemyRef = useRef<Enemy>(enemy);
  const currentZoneIdRef = useRef<number>(currentZoneId);
  const hpPotionsRef = useRef<number>(hpPotions);
  const mpPotionsRef = useRef<number>(mpPotions);
  const autoHpPercentRef = useRef<number>(autoHpPercent);
  const autoMpPercentRef = useRef<number>(autoMpPercent);
  const autoAttackEnabledRef = useRef<boolean>(autoAttackEnabled);
  const activeSelfBuffsRef = useRef<ActiveSelfBuff[]>(activeSelfBuffs);
  const activeDebuffsRef = useRef<ActiveDebuff[]>(activeDebuffs);
  const equipStatsRef = useRef<ReturnType<typeof calculateEquipmentStats>>(calculateEquipmentStats(equipped));
  const killCountRef = useRef<number>(killCount);
  const isBossFightRef = useRef<boolean>(isBossFight);
  const inventoryRef = useRef<Equipment[]>(inventory);
  
  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
    };
  }, []);
  
  // PERF FIX: Consolidated all ref updates into ONE useEffect instead of 11 separate ones
  useEffect(() => {
    callbacksRef.current = callbacks;
    charRef.current = char;
    equippedRef.current = equipped;
    enemyRef.current = enemy;
    currentZoneIdRef.current = currentZoneId;
    hpPotionsRef.current = hpPotions;
    mpPotionsRef.current = mpPotions;
    autoHpPercentRef.current = autoHpPercent;
    autoMpPercentRef.current = autoMpPercent;
    autoAttackEnabledRef.current = autoAttackEnabled;
    activeSelfBuffsRef.current = activeSelfBuffs;
    activeDebuffsRef.current = activeDebuffs;
    skillCooldownsRef.current = skillCooldowns;
    killCountRef.current = killCount;
    isBossFightRef.current = isBossFight;
    inventoryRef.current = inventory;
  }, [callbacks, char, equipped, enemy, currentZoneId, hpPotions, mpPotions, autoHpPercent, autoMpPercent, autoAttackEnabled, activeSelfBuffs, activeDebuffs, skillCooldowns, killCount, isBossFight, inventory]);

  // PERF FIX: Only recalculate equipStats when equipment actually changes
  const equipStats = useMemo(() => {
    const stats = calculateEquipmentStats(equipped);
    equipStatsRef.current = stats;
    return stats;
  }, [equipped]);
  
  const armorBonus = equipStats.totalDef;
  const mdefBonus = equipStats.totalMdef;
  
  // PERF FIX: Only recalculate ASPD when AGI, DEX, or equipStats change (not entire char object)
  const attacksPerSecond = useMemo(() => {
    const { passives } = calcPlayerAtk(
      char,
      equipStats.weaponAtk,
      equipStats.weaponLevel,
      equipStats.weaponRefine,
      equipStats.equipBonusAtk,
      equipStats.weaponType
    );
    return calcASPD(char, passives.aspdBonus);
  }, [char.stats.agi, char.stats.dex, char.jobClass, char.learnedSkills, equipStats]);

  function devAddBaseLevel() {
    const currentExp = char.expToNext;
    const levelUpResult = processLevelUp(char, currentExp);
    
    setChar(prev => ({
      ...prev,
      level: levelUpResult.newLevel,
      exp: levelUpResult.newExp,
      expToNext: levelUpResult.newExpToNext,
      statPoints: levelUpResult.newStatPoints,
      hp: levelUpResult.newHp,
      maxHp: calcMaxHp(levelUpResult.newLevel, prev.stats.vit, prev.jobClass),
      mp: levelUpResult.newMp,
      maxMp: calcMaxMp(levelUpResult.newLevel, prev.stats.int, prev.jobClass),
    }));
    
    callbacks?.onLevelUp?.(levelUpResult.newLevel);
    addLog(`🔧 [DEV] Base Level +1! Now Lv.${levelUpResult.newLevel}`);
  }

  function devAddJobLevel() {
    const currentJobExp = char.jobExpToNext;
    const jobLevelUpResult = processJobLevelUp(char, currentJobExp);
    
    setChar(prev => ({
      ...prev,
      jobLevel: jobLevelUpResult.newJobLevel,
      jobExp: jobLevelUpResult.newJobExp,
      jobExpToNext: jobLevelUpResult.newJobExpToNext,
      skillPoints: jobLevelUpResult.newSkillPoints,
    }));
    
    callbacks?.onJobLevelUp?.(jobLevelUpResult.newJobLevel);
    addLog(`🔧 [DEV] Job Level +1! Now Job Lv.${jobLevelUpResult.newJobLevel}`);
    
    if (canChangeJob(char.jobClass, jobLevelUpResult.newJobLevel) && (jobLevelUpResult.newJobLevel === 10 || jobLevelUpResult.newJobLevel === 15)) {
      addLog(`🎊 You can now change your job!`);
    }
  }

  function devAddGold(amount: number) {
    setChar(prev => ({
      ...prev,
      gold: prev.gold + amount,
    }));
    addLog(`🔧 [DEV] Added ${amount} gold!`);
  }

  function devAddPotions(hp: number, mp: number) {
    setHpPotions(prev => prev + hp);
    setMpPotions(prev => prev + mp);
    addLog(`🔧 [DEV] Added ${hp} HP potions and ${mp} MP potions!`);
  }

  function devFullHeal() {
    setChar(prev => ({
      ...prev,
      hp: prev.maxHp,
      mp: prev.maxMp,
    }));
    addLog(`🔧 [DEV] Full heal!`);
  }

  function devAddGear() {
    const randomGear = generateLoot(char.level + 10);
    setInventory(prev => [...prev, randomGear]);
    addLog(`🔧 [DEV] Added ${randomGear.name}!`);
  }

  function devUnlockAllZones() {
    const allZoneIds = ZONES.map(z => z.id);
    setUnlockedZoneIds(allZoneIds);
    addLog(`🔧 [DEV] Unlocked all zones!`);
  }

  function addStat(stat: keyof CharacterStats) {
    if (char.statPoints <= 0) {
      addLog("❌ No stat points!");
      return;
    }
    setChar((prev) => {
      const newStats = { ...prev.stats, [stat]: prev.stats[stat] + 1 };
      return {
        ...prev,
        stats: newStats,
        statPoints: prev.statPoints - 1,
        maxHp: stat === 'vit' ? calcMaxHp(prev.level, newStats.vit, prev.jobClass) : prev.maxHp,
        maxMp: stat === 'int' ? calcMaxMp(prev.level, newStats.int, prev.jobClass) : prev.maxMp,
      };
    });
  }

  function learnSkill(skillId: string) {
    const currentLevel = char.learnedSkills[skillId] || 0;
    const skill = SKILLS_DB[char.jobClass].find((s) => s.id === skillId);

    if (!skill) {
      addLog("❌ Skill not found!");
      return;
    }

    if (currentLevel >= skill.maxLevel) {
      addLog(`❌ ${skill.nameZh} already MAX!`);
      return;
    }

    if (char.skillPoints <= 0) {
      addLog("❌ No Skill Points!");
      return;
    }

    setChar((prev) => ({
      ...prev,
      learnedSkills: {
        ...prev.learnedSkills,
        [skillId]: currentLevel + 1,
      },
      skillPoints: prev.skillPoints - 1,
    }));

    addLog(`📖 Learned ${skill.nameZh} Lv.${currentLevel + 1}!`);
  }

  function setAutoAttackSkill(skillId: string) {
    const skillLevel = char.learnedSkills[skillId] || 0;
    if (skillLevel === 0) {
      addLog("❌ You haven't learned this skill yet!");
      return;
    }
    
    const skill = SKILLS_DB[char.jobClass].find((s) => s.id === skillId);
    if (!skill) {
      addLog("❌ Skill not found!");
      return;
    }

    if (skill.effect === "buff" || skill.effect === "passive" || skill.effect === "debuff") {
      addLog("❌ Cannot set passive/buff/debuff skill as top priority!");
      return;
    }

    setChar((prev) => ({
      ...prev,
      autoAttackSkillId: skillId,
    }));

    addLog(`⭐ Top priority skill set to: ${skill.nameZh}`);
  }

  function toggleAutoAttack() {
    setAutoAttackEnabled(prev => !prev);
    if (!autoAttackEnabled) {
      addLog("🤖 Auto-Battle enabled!");
    } else {
      addLog("✋ Auto-Battle disabled!");
    }
  }

  function handleJobChange(newJob: JobClass) {
    const jobBonuses = getJobBonuses(newJob);
    
    const newJobSkills = SKILLS_DB[newJob];
    const initialSkills: Record<string, number> = { basic_attack: 1 };
    
    const firstJobSkill = newJobSkills.find(s => s.id !== "basic_attack");
    if (firstJobSkill) {
      initialSkills[firstJobSkill.id] = 1;
    }

    if (newJob === "Wizard") {
      initialSkills["energy_coat"] = 1;
    }

    const firstAttackSkill = newJobSkills.find(s => s.id !== "basic_attack" && s.effect !== "buff" && s.effect !== "passive" && s.effect !== "debuff");

    const newMaxHp = calcMaxHp(char.level, char.stats.vit, newJob);
    const newMaxMp = calcMaxMp(char.level, char.stats.int, newJob);

    let currentWeapon = equipped.weapon;
    let newInventory = [...inventory];
    
    if ((newJob === "Mage" || newJob === "Wizard")) {
      if (currentWeapon && currentWeapon.weaponType !== "wand") {
        newInventory.push(currentWeapon);
        currentWeapon = { ...STARTING_WAND };
        addLog(`🪄 Received and equipped an Apprentice Wand!`);
      }
    }

    setChar({
      ...char,
      hp: newMaxHp,
      maxHp: newMaxHp,
      mp: newMaxMp,
      maxMp: newMaxMp,
      jobClass: newJob,
      jobLevel: 1,
      jobExp: 0,
      jobExpToNext: 50,
      skillPoints: 3,
      learnedSkills: initialSkills,
      autoAttackSkillId: firstAttackSkill ? firstAttackSkill.id : "basic_attack",
    });

    setEquipped(prev => ({ ...prev, weapon: currentWeapon }));
    setInventory(newInventory);

    setCurrentZoneId(0);
    setEnemy(getRandomEnemyForZone(0, char.level));
    setKillCount(0);
    setIsBossFight(false);
    setBossAvailable(false);
    setActiveDebuffs([]);
    setActiveSelfBuffs([]);
    setSkillCooldowns({});

    addLog(`🎉 Congratulations! You are now a ${newJob}!`);
    addLog(`🏛️ Teleported to Town for safety!`);
    addLog(`💫 You received 3 Skill Points to learn new skills!`);
    if (firstJobSkill) {
      addLog(`📖 You learned ${firstJobSkill.nameZh}!`);
    }
    if (newJob === "Wizard") {
      addLog(`🛡️ You learned Energy Coat (passive)!`);
    }
    if (firstAttackSkill && firstAttackSkill.id === firstJobSkill?.id) {
      addLog(`⭐ ${firstAttackSkill.nameZh} is now your priority skill.`);
    }
    addLog(`🛡️ Job Bonuses: HP ${Math.floor((jobBonuses.hpMultiplier - 1) * 100)}%, MP ${Math.floor((jobBonuses.mpMultiplier - 1) * 100)}%, +${jobBonuses.atkBonus} ATK, +${jobBonuses.defBonus} DEF`);
    setShowJobChangeNPC(false);
  }

  function openJobChangeNPC() {
    setShowJobChangeNPC(true);
  }

  function handleRespawn() {
    const respawnHp = Math.floor(char.maxHp * 0.5);
    const respawnMp = Math.floor(char.maxMp * 0.5);
    
    setChar((prev) => ({
      ...prev,
      hp: respawnHp,
      mp: respawnMp,
    }));
    
    setKillCount(0);
    setIsBossFight(false);
    setBossAvailable(false);
    setShowDeathModal(false);
    setCurrentZoneId(0);
    setEnemy(getRandomEnemyForZone(0, char.level));
    setActiveDebuffs([]);
    setActiveSelfBuffs([]);
    setSkillCooldowns({});
    
    addLog("❤️‍🩹 Respawned in Town!");
  }

  function escapeToTown() {
    if (currentZoneId === 0) {
      addLog("ℹ️ You are already in town!");
      return;
    }
    
    setKillCount(0);
    setIsBossFight(false);
    setBossAvailable(false);
    setCurrentZoneId(0);
    setEnemy(getRandomEnemyForZone(0, char.level));
    setActiveDebuffs([]);
    setActiveSelfBuffs([]);
    setSkillCooldowns({});
    
    addLog("🏛️ Escaped to Town safely!");
  }

  function processTownHealing() {
    const currentChar = charRef.current;
    const currentZone = currentZoneIdRef.current;
    
    if (currentZone === 0 && (currentChar.hp < currentChar.maxHp || currentChar.mp < currentChar.maxMp) && currentChar.hp > 0) {
      const healHp = Math.floor(currentChar.maxHp * 0.1);
      const healMp = Math.floor(currentChar.maxMp * 0.1);
      
      setChar(prev => {
        const newHp = Math.min(prev.maxHp, prev.hp + healHp);
        const newMp = Math.min(prev.maxMp, prev.mp + healMp);
        return { ...prev, hp: newHp, mp: newMp };
      });
    }
  }
  
  townHealingRef.current = processTownHealing;

  const useHpPotion = useCallback(() => {
    setHpPotions((prevPotions) => {
      if (prevPotions <= 0) {
        addLog("❌ No HP Pots!");
        return prevPotions;
      }
      
      setChar((prevChar) => {
        if (prevChar.hp >= prevChar.maxHp) {
          addLog("❤️ HP Full!");
          return prevChar;
        }
        
        const heal = Math.floor(prevChar.maxHp * HP_POTION_HEAL_PERCENT) + HP_POTION_HEAL_FLAT;
        const newHp = Math.min(prevChar.maxHp, prevChar.hp + heal);
        addLog(`🍖 +${heal} HP.`);
        return { ...prevChar, hp: newHp };
      });
      
      return prevPotions - 1;
    });
  }, [addLog]);

  const useMpPotion = useCallback(() => {
    setMpPotions((prevPotions) => {
      if (prevPotions <= 0) {
        addLog("❌ No MP Pots!");
        return prevPotions;
      }
      
      setChar((prevChar) => {
        if (prevChar.mp >= prevChar.maxMp) {
          addLog("💙 MP Full!");
          return prevChar;
        }
        
        const recover = Math.floor(prevChar.maxMp * MP_POTION_RECOVER_PERCENT);
        const newMp = Math.min(prevChar.maxMp, prevChar.mp + recover);
        addLog(`🧪 +${recover} MP.`);
        return { ...prevChar, mp: newMp };
      });
      
      return prevPotions - 1;
    });
  }, [addLog]);

  useEffect(() => {
    if (debuffCleanupTimerRef.current !== null) {
      clearInterval(debuffCleanupTimerRef.current);
      debuffCleanupTimerRef.current = null;
    }

    debuffCleanupTimerRef.current = window.setInterval(() => {
      const now = Date.now();
      
      setActiveDebuffs(prev => {
        if (prev.length === 0) return prev;
        const filtered = prev.filter(d => now <= d.expiresAt);
        return filtered.length === prev.length ? prev : filtered;
      });
      
      setActiveSelfBuffs(prev => {
        if (prev.length === 0) return prev;
        const filtered = prev.filter(b => now <= b.expiresAt);
        return filtered.length === prev.length ? prev : filtered;
      });
    }, 1000) as unknown as number;

    return () => {
      if (debuffCleanupTimerRef.current !== null) {
        clearInterval(debuffCleanupTimerRef.current);
      }
    };
  }, []);

  // ── Quest System ─────────────────────────────────────────────────────────

  // Log a message when corruption crosses a new tier threshold
  const prevCorruptionLevelRef = useRef<number>(char.corruptionLevel);
  useEffect(() => {
    const prev = prevCorruptionLevelRef.current;
    const curr = char.corruptionLevel;
    prevCorruptionLevelRef.current = curr;
    const thresholds = [20, 40, 60, 80, 100];
    for (const t of thresholds) {
      if (prev < t && curr >= t) {
        const tier = getCorruptionModifiers(curr).tierName;
        addLog(`🩸 Corruption: ${tier} — enemies grow stronger. Drops grow stranger.`);
        break;
      }
    }
  }, [char.corruptionLevel]);

  // Auto-show the ending choice modal when all quest chains are complete
  useEffect(() => {
    if (char.questEnding !== null || endingChoiceShownRef.current) return;
    const chainIds = ["chain_birthmark", "chain_mountain", "chain_rite"];
    const allComplete = chainIds.every(id => isChainComplete(id, char.completedStepIds));
    if (allComplete) {
      endingChoiceShownRef.current = true;
      setShowEndingChoice(true);
    }
  }, [char.completedStepIds, char.questEnding]);

  // Player chooses to seal the bloodline (ending A)
  function sealBloodline() {
    if (char.questEnding !== null) return;
    setChar(prev => ({
      ...prev,
      questEnding: "seal",
      corruptionLevel: Math.max(0, prev.corruptionLevel + ENDING_CHOICES.seal.corruptionChange),
    }));
    addLog(`🔒 You sealed the bloodline. The pass goes quiet.`);
  }

  // Player chooses to remain unbound (ending B)
  function remainUnbound() {
    if (char.questEnding !== null) return;
    setChar(prev => ({
      ...prev,
      questEnding: "unbound",
      corruptionLevel: Math.min(100, prev.corruptionLevel + ENDING_CHOICES.unbound.corruptionChange),
    }));
    addLog(`🌑 You walked through the pass. You are still writing.`);
  }

  // STABILITY FIX: battleAction no longer depends on state that changes during execution
  // Instead it uses refs for real-time values
  const battleAction = useCallback((skillId?: string) => {
    // GUARD: Prevent concurrent executions
    if (battleActionInProgressRef.current) {
      return;
    }
    battleActionInProgressRef.current = true;
    
    try {
      if (!isMountedRef.current) return;
      const currentChar = charRef.current;
      const currentEnemy = enemyRef.current;
      const currentEquipped = equippedRef.current;
      const currentZone = currentZoneIdRef.current;
      const currentActiveDebuffs = activeDebuffsRef.current;
      const currentActiveSelfBuffs = activeSelfBuffsRef.current;
      const currentSkillCooldowns = skillCooldownsRef.current;
      
      if (currentChar.hp <= 0) return;
      if (currentZone === 0) return;
      
      if (!canAttack) return;

      const now = Date.now();

      // Collect all state updates to batch them
      const stateUpdates: {
        charUpdates?: Partial<Character>;
        cooldownUpdates?: Record<string, number>;
        debuffUpdates?: ActiveDebuff[];
        buffUpdates?: ActiveSelfBuff[];
        logMessages: string[];
      } = {
        logMessages: []
      };

      // 1. DEBUFF PHASE
      const debuffSkills = ["provoke", "stone_curse"];
      for (const debuffId of debuffSkills) {
        if (currentChar.learnedSkills[debuffId] > 0) {
          const debuffSkill = SKILLS_DB[currentChar.jobClass].find(s => s.id === debuffId);
          if (!debuffSkill) continue;
          
          const debuffCD = debuffSkill.cooldown;
          const debuffLastUsed = currentSkillCooldowns[debuffId] || 0;
          const debuffReady = (now - debuffLastUsed) / 1000 >= debuffCD;
          
          const hasDebuff = currentActiveDebuffs.some(d => d.id === debuffId && now <= d.expiresAt);
          
          const mpCost = debuffSkill.mpCost(currentChar.learnedSkills[debuffId]);
          if (debuffReady && !hasDebuff && currentChar.mp >= mpCost) {
            setChar(prev => ({ ...prev, mp: prev.mp - mpCost }));
            setSkillCooldowns(prev => ({ ...prev, [debuffId]: now }));
            const duration = (debuffSkill.debuffDuration || 10) * 1000;
            setActiveDebuffs(prev => [...prev, { id: debuffId, expiresAt: now + duration, skillLevel: currentChar.learnedSkills[debuffId] }]);
            
            addLog(`📢 Used ${debuffSkill.nameZh}! Enemy weakened for ${debuffSkill.debuffDuration}s.`);
            setLastAttackTime(now);
            setCanAttack(false);
            setAttackCooldownPercent(0);
            return;
          }
        }
      }

      // 2. SELF-BUFF PHASE
      // TRUE SIGHT FIX: Added true_sight to buff skills array
      // Offensive buffs (true_sight) are cast proactively, defensive buffs (endure) only when HP < 60%
      const offensiveBuffSkills = ["true_sight"];
      const defensiveBuffSkills = ["endure"];
      
      // Cast offensive buffs proactively (always when off CD)
      for (const buffId of offensiveBuffSkills) {
        if (currentChar.learnedSkills[buffId] > 0) {
          const buffSkill = SKILLS_DB[currentChar.jobClass].find(s => s.id === buffId);
          if (!buffSkill) continue;
          
          const buffCD = buffSkill.cooldown;
          const buffLastUsed = currentSkillCooldowns[buffId] || 0;
          const buffReady = (now - buffLastUsed) / 1000 >= buffCD;
          
          const hasBuff = currentActiveSelfBuffs.some(b => b.id === buffId && now <= b.expiresAt);
          
          const mpCost = buffSkill.mpCost(currentChar.learnedSkills[buffId]);
          if (buffReady && !hasBuff && currentChar.mp >= mpCost) {
            setChar(prev => ({ ...prev, mp: prev.mp - mpCost }));
            setSkillCooldowns(prev => ({ ...prev, [buffId]: now }));
            const duration = (buffSkill.buffDuration || 25) * 1000;
            setActiveSelfBuffs(prev => [...prev, { id: buffId, expiresAt: now + duration, skillLevel: currentChar.learnedSkills[buffId] }]);
            
            addLog(`👁️ Used ${buffSkill.nameZh}! Crit power increased for ${buffSkill.buffDuration}s.`);
            setLastAttackTime(now);
            setCanAttack(false);
            setAttackCooldownPercent(0);
            return;
          }
        }
      }
      
      // Cast defensive buffs only when HP < 60%
      const hpPercent = (currentChar.hp / currentChar.maxHp) * 100;
      if (hpPercent < 60) {
        for (const buffId of defensiveBuffSkills) {
          if (currentChar.learnedSkills[buffId] > 0) {
            const buffSkill = SKILLS_DB[currentChar.jobClass].find(s => s.id === buffId);
            if (!buffSkill) continue;
            
            const buffCD = buffSkill.cooldown;
            const buffLastUsed = currentSkillCooldowns[buffId] || 0;
            const buffReady = (now - buffLastUsed) / 1000 >= buffCD;
            
            const hasBuff = currentActiveSelfBuffs.some(b => b.id === buffId && now <= b.expiresAt);
            
            const mpCost = buffSkill.mpCost(currentChar.learnedSkills[buffId]);
            if (buffReady && !hasBuff && currentChar.mp >= mpCost) {
              setChar(prev => ({ ...prev, mp: prev.mp - mpCost }));
              setSkillCooldowns(prev => ({ ...prev, [buffId]: now }));
              const duration = (buffSkill.buffDuration || 8) * 1000;
              setActiveSelfBuffs(prev => [...prev, { id: buffId, expiresAt: now + duration, skillLevel: currentChar.learnedSkills[buffId] }]);
              
              addLog(`🛡️ Used ${buffSkill.nameZh}! Damage reduction active for ${buffSkill.buffDuration}s.`);
              setLastAttackTime(now);
              setCanAttack(false);
              setAttackCooldownPercent(0);
              return;
            }
          }
        }
      }

      // 3. SMART SKILL ROTATION PHASE
      let actualSkillId = skillId || currentChar.autoAttackSkillId;
      let skillLevel = currentChar.learnedSkills[actualSkillId] || 0;
      let skill = SKILLS_DB[currentChar.jobClass].find((s) => s.id === actualSkillId);

      if (!skill || skillLevel === 0 || skill.effect === "buff" || skill.effect === "passive" || skill.effect === "debuff") {
        actualSkillId = "basic_attack";
        skillLevel = currentChar.learnedSkills["basic_attack"] || 1;
        skill = SKILLS_DB[currentChar.jobClass].find((s) => s.id === "basic_attack")!;
      }
      
      let isSkillOnCooldown = false;
      if (skill.cooldown > 0) {
        const lastUsed = currentSkillCooldowns[actualSkillId] || 0;
        if ((now - lastUsed) / 1000 < skill.cooldown) {
          isSkillOnCooldown = true;
        }
      }

      let mpCost = skill.mpCost(skillLevel);
      let isMpInsufficient = currentChar.mp < mpCost;

      if ((isSkillOnCooldown || isMpInsufficient) && actualSkillId !== "basic_attack") {
        const availableSkills = SKILLS_DB[currentChar.jobClass]
          .filter(s => s.id !== "basic_attack" && s.id !== actualSkillId && s.effect !== "buff" && s.effect !== "passive" && s.effect !== "debuff")
          .filter(s => {
            const lvl = currentChar.learnedSkills[s.id] || 0;
            if (lvl === 0) return false;
            
            if (s.cooldown > 0) {
              const lu = currentSkillCooldowns[s.id] || 0;
              if ((now - lu) / 1000 < s.cooldown) return false;
            }
            
            if (currentChar.mp < s.mpCost(lvl)) return false;
            
            return true;
          })
          .sort((a, b) => {
            const lvlA = currentChar.learnedSkills[a.id];
            const lvlB = currentChar.learnedSkills[b.id];
            return b.damageMultiplier(lvlB) - a.damageMultiplier(lvlA);
          });

        if (availableSkills.length > 0) {
          skill = availableSkills[0];
          actualSkillId = skill.id;
          skillLevel = currentChar.learnedSkills[skill.id];
          mpCost = skill.mpCost(skillLevel);
        } else {
          actualSkillId = "basic_attack";
          skillLevel = currentChar.learnedSkills["basic_attack"] || 1;
          skill = SKILLS_DB[currentChar.jobClass].find((s) => s.id === "basic_attack")!;
          mpCost = skill.mpCost(skillLevel);
          isMpInsufficient = currentChar.mp < mpCost;
        }
      }

      if (isMpInsufficient) {
        setLastAttackTime(now);
        setCanAttack(false);
        setAttackCooldownPercent(0);
        
        const mpRegen = Math.floor(currentChar.maxMp * 0.05) + 1;
        const newMp = Math.min(currentChar.maxMp, currentChar.mp + mpRegen);
        if (newMp > currentChar.mp) {
          setChar((prev) => ({ ...prev, mp: newMp }));
        }
        return;
      }

      if (skill.cooldown > 0 && actualSkillId !== "basic_attack") {
        setSkillCooldowns((prev) => ({ ...prev, [actualSkillId]: now }));
      }

      setLastAttackTime(now);
      setCanAttack(false);
      setAttackCooldownPercent(0);

      let nextCharHp = currentChar.hp;
      let nextCharMp = currentChar.mp - mpCost;
      let nextCharExp = currentChar.exp;
      let nextCharLevel = currentChar.level;
      let nextCharExpToNext = currentChar.expToNext;
      let nextCharGold = currentChar.gold;
      let nextStatPoints = currentChar.statPoints;
      
      let nextCharElunium = currentChar.elunium;
      let nextCharOridecon = currentChar.oridecon;
      let nextCompletedStepIds = currentChar.completedStepIds;
      
      let didLevelUp = false;

      let nextEnemyHp = currentEnemy.hp;
      let nextEnemy = currentEnemy;

      let combatEnemy = { ...currentEnemy };
      
      const provokeDebuff = currentActiveDebuffs.find(d => d.id === "provoke" && now <= d.expiresAt);
      if (provokeDebuff) {
        const defReduction = 0.20 + (provokeDebuff.skillLevel * 0.05);
        combatEnemy.softDef = Math.floor(combatEnemy.softDef * (1 - defReduction));
        combatEnemy.hardDefPercent = Math.floor(combatEnemy.hardDefPercent * (1 - defReduction));
      }

      // HIT/FLEE FIX: Destructure isMiss and handle miss before damage processing
      const { damage, isCrit, isAOE, isMiss } = calculateDamage(
        currentChar,
        combatEnemy,
        skill,
        skillLevel,
        currentEquipped,
        currentActiveSelfBuffs
      );
      
      // HIT/FLEE FIX: Handle miss - consume MP, show feedback, exit early
      if (isMiss) {
        addLog(`⚪ ${skill.nameZh} Lv.${skillLevel}: MISS! (MP-${mpCost})`);
        setLastAttackTime(now);
        setCanAttack(false);
        setAttackCooldownPercent(0);
        
        // Update MP after miss
        setChar((prev) => ({ ...prev, mp: nextCharMp }));
        return;
      }
      
      nextEnemyHp = currentEnemy.hp - damage;

      callbacksRef.current?.onDamageDealt?.(damage, isCrit);

      const critText = isCrit ? " ❗CRIT!" : "";
      const aoeText = isAOE ? " 🔥 AOE BONUS!" : "";
      addLog(
        `🎯 ${skill.nameZh} Lv.${skillLevel}: Hit ${currentEnemy.name} for ${damage} dmg.${critText}${aoeText} (MP-${mpCost})`
      );

      let nextJobLevel = currentChar.jobLevel;
      let nextJobExp = currentChar.jobExp;
      let nextJobExpToNext = currentChar.jobExpToNext;
      let nextSkillPoints = currentChar.skillPoints;
      let nextCorruptionLevel = currentChar.corruptionLevel;

      if (nextEnemyHp <= 0) {
        const enemyCount = currentEnemy.count || 1;
        const isGroup = enemyCount > 1;
        
        if (isGroup) {
          addLog(`💀 Defeated ${enemyCount}x ${currentEnemy.name}!`);
        } else {
          addLog(`💀 ${currentEnemy.name} defeated!`);
        }

        const baseGoldGain = calculateGoldGain(currentEnemy);
        const goldGain = baseGoldGain * enemyCount;
        nextCharGold += goldGain;
        addLog(`💰 Gained ${goldGain} Gold${isGroup ? ` (${baseGoldGain} × ${enemyCount})` : ''}.`);

        const currentKillCount = killCountRef.current;
        const currentIsBossFight = isBossFightRef.current;
        
        callbacksRef.current?.onEnemyKilled?.(currentIsBossFight, goldGain);

        const baseExpGain = calculateExpGain(currentEnemy);
        const expGain = baseExpGain * enemyCount;
        const levelUpResult = processLevelUp(currentChar, expGain);
        nextCharExp = levelUpResult.newExp;
        nextCharLevel = levelUpResult.newLevel;
        nextCharExpToNext = levelUpResult.newExpToNext;
        nextStatPoints = levelUpResult.newStatPoints;

        addLog(`✨ Gained ${expGain} Base EXP${isGroup ? ` (${baseExpGain} × ${enemyCount})` : ''}.`);

        if (levelUpResult.leveledUp) {
          nextCharHp = levelUpResult.newHp;
          nextCharMp = levelUpResult.newMp;
          didLevelUp = true;
          addLog(`🌟 LEVEL UP! Now Lv.${nextCharLevel} (Stat Points +${STAT_POINTS_PER_LEVEL})`);
          callbacksRef.current?.onLevelUp?.(nextCharLevel);
        }

        const baseJobExpGain = calculateJobExpGain(currentEnemy, currentChar.jobLevel);
        const jobExpGain = baseJobExpGain * enemyCount;
        const jobLevelUpResult = processJobLevelUp(currentChar, jobExpGain);
        nextJobExp = jobLevelUpResult.newJobExp;
        nextJobLevel = jobLevelUpResult.newJobLevel;
        nextJobExpToNext = jobLevelUpResult.newJobExpToNext;
        nextSkillPoints = jobLevelUpResult.newSkillPoints;

        addLog(`✨ Gained ${jobExpGain} Job EXP${isGroup ? ` (${baseJobExpGain} × ${enemyCount})` : ''}.`);

        if (jobLevelUpResult.leveledUp) {
          addLog(
            `📘 JOB LEVEL UP! Job Lv.${nextJobLevel} (Skill Points +1)`
          );
          callbacksRef.current?.onJobLevelUp?.(nextJobLevel);
          
          if (canChangeJob(currentChar.jobClass, nextJobLevel) && (nextJobLevel === 10 || nextJobLevel === 15)) {
            addLog(`🎊 You can now change your job! Talk to the Job Change Master!`);
          }
        }

        setActiveDebuffs([]);

        // Sprint 4: derive collected quest item IDs from completedStepIds (not inventory)
        const collectedQuestItemIds = getCollectedQuestItemIds(currentChar.completedStepIds);

        if (currentIsBossFight) {
          addLog(`🎉 BOSS DEFEATED! Next area unlocked!`);
          setBossDefeated(true);
          setKillCount(0);
          setIsBossFight(false);

          const currentZoneIndex = ZONES.findIndex((z) => z.id === currentZone);
          if (currentZoneIndex < ZONES.length - 1) {
            const nextZone = ZONES[currentZoneIndex + 1];
            setUnlockedZoneIds((prev) => {
              if (!prev.includes(nextZone.id)) {
                addLog(`🔓 UNLOCKED: ${nextZone.name}!`);
                return [...prev, nextZone.id];
              }
              return prev;
            });
          } else {
            addLog(`🏆 You cleared all zones!`);
          }

          const bossGear = generateBossLoot(nextCharLevel, nextCorruptionLevel);
          setInventory((prev) => [...prev, bossGear]);
          addLog(`🎁 Boss Drop: ${bossGear.name}!`);
          callbacksRef.current?.onItemDrop?.(bossGear);

          const numElu = Math.floor(Math.random() * 2) + 1;
          const numOri = Math.floor(Math.random() * 2) + 1;
          nextCharElunium += numElu;
          nextCharOridecon += numOri;
          addLog(`💎 Boss Drop: ${numElu}x Elunium, ${numOri}x Oridecon!`);
          callbacksRef.current?.onMaterialDrop?.('elunium', numElu);
          callbacksRef.current?.onMaterialDrop?.('oridecon', numOri);

          // Sprint 4: quest item auto-completes the step — item is consumed, not added to inventory
          const questDrop = checkQuestItemDrop(currentEnemy.name, currentZone, true, collectedQuestItemIds);
          if (questDrop && questDrop.questItemId) {
            const stepInfo = findQuestStepByItemId(questDrop.questItemId);
            if (stepInfo) {
              nextCompletedStepIds = { ...nextCompletedStepIds, [stepInfo.stepId]: true };
              addLog(`📜 Quest Item obtained: ${questDrop.name}!`);
              if (stepInfo.corruptionGain > 0) {
                nextCorruptionLevel = Math.min(100, nextCorruptionLevel + stepInfo.corruptionGain);
                addLog(`🌑 Corruption rises... (+${stepInfo.corruptionGain})`);
              }
              setQuestStepCompleted({
                chainTitle: stepInfo.chainTitle,
                stepTitle: stepInfo.stepTitle,
                completionText: stepInfo.completionText,
                corruptionGain: stepInfo.corruptionGain,
              });
            }
          }

          // Boss kill corruption: +1.0 per boss
          nextCorruptionLevel = Math.min(100, nextCorruptionLevel + 1.0);

          nextEnemy = applyCorruptionScaling(
            getRandomEnemyForZone(currentZone, nextCharLevel),
            nextCorruptionLevel
          );
          addLog(`👾 A wild ${nextEnemy.name} appeared!`);
        } else {
          const nextKillCount = currentKillCount + 1;
          setKillCount(nextKillCount);

          if (nextKillCount % KILLS_FOR_BOSS === 0) {
            setBossAvailable(true);
            addLog(`⚔️ Boss is ready! Click the button to challenge!`);
          }

          if (isGroup) {
            for (let i = 0; i < enemyCount; i++) {
              if (shouldDropLoot()) {
                const newGear = generateLoot(nextCharLevel, nextCorruptionLevel);
                setInventory((prev) => [...prev, newGear]);
                addLog(`🎁 Looted: ${newGear.name}!`);
                callbacksRef.current?.onItemDrop?.(newGear);
              }
            }
          } else {
            if (shouldDropLoot()) {
              const newGear = generateLoot(nextCharLevel, nextCorruptionLevel);
              setInventory((prev) => [...prev, newGear]);
              addLog(`🎁 Looted: ${newGear.name}!`);
              callbacksRef.current?.onItemDrop?.(newGear);
            }
          }

          for (let i = 0; i < enemyCount; i++) {
            const matRoll = Math.random();
            if (matRoll < 0.08) {
              nextCharElunium += 1;
              addLog(`💎 Looted: 1x Elunium!`);
              callbacksRef.current?.onMaterialDrop?.('elunium', 1);
            } else if (matRoll < 0.14) {
              nextCharOridecon += 1;
              addLog(`💎 Looted: 1x Oridecon!`);
              callbacksRef.current?.onMaterialDrop?.('oridecon', 1);
            }
          }

          // Sprint 4: quest item auto-completes the step — item is consumed, not added to inventory
          const questDrop = checkQuestItemDrop(currentEnemy.name, currentZone, false, collectedQuestItemIds);
          if (questDrop && questDrop.questItemId) {
            const stepInfo = findQuestStepByItemId(questDrop.questItemId);
            if (stepInfo) {
              nextCompletedStepIds = { ...nextCompletedStepIds, [stepInfo.stepId]: true };
              addLog(`📜 Quest Item obtained: ${questDrop.name}!`);
              if (stepInfo.corruptionGain > 0) {
                nextCorruptionLevel = Math.min(100, nextCorruptionLevel + stepInfo.corruptionGain);
                addLog(`🌑 Corruption rises... (+${stepInfo.corruptionGain})`);
              }
              setQuestStepCompleted({
                chainTitle: stepInfo.chainTitle,
                stepTitle: stepInfo.stepTitle,
                completionText: stepInfo.completionText,
                corruptionGain: stepInfo.corruptionGain,
              });
            }
          }

          // Normal kill corruption: +0.2 per kill (fractional, visible only after many kills)
          nextCorruptionLevel = Math.min(100, nextCorruptionLevel + 0.2 * enemyCount);

          nextEnemy = applyCorruptionScaling(
            getRandomEnemyForZone(currentZone, nextCharLevel),
            nextCorruptionLevel
          );
          const nextEnemyCount = nextEnemy.count || 1;
          if (nextEnemyCount > 1) {
            addLog(`👾 A group of ${nextEnemyCount}x ${nextEnemy.name} appeared!`);
          } else {
            addLog(`👾 A wild ${nextEnemy.name} appeared!`);
          }
        }
      } else {
        nextEnemy = { ...currentEnemy, hp: nextEnemyHp };
      }

      const finalMaxHp = didLevelUp 
        ? calcMaxHp(nextCharLevel, currentChar.stats.vit, currentChar.jobClass)
        : currentChar.maxHp;
      const finalMaxMp = didLevelUp
        ? calcMaxMp(nextCharLevel, currentChar.stats.int, currentChar.jobClass)
        : currentChar.maxMp;

      if (!isMountedRef.current) return;

      setChar({
        hp: nextCharHp,
        maxHp: finalMaxHp,
        mp: nextCharMp,
        maxMp: finalMaxMp,
        level: nextCharLevel,
        exp: nextCharExp,
        expToNext: nextCharExpToNext,
        gold: nextCharGold,
        stats: currentChar.stats,
        statPoints: nextStatPoints,
        jobClass: currentChar.jobClass,
        jobLevel: nextJobLevel,
        jobExp: nextJobExp,
        jobExpToNext: nextJobExpToNext,
        skillPoints: nextSkillPoints,
        learnedSkills: currentChar.learnedSkills,
        autoAttackSkillId: currentChar.autoAttackSkillId,
        elunium: nextCharElunium,
        oridecon: nextCharOridecon,
        corruptionLevel: nextCorruptionLevel,
        completedStepIds: nextCompletedStepIds,
        questEnding: currentChar.questEnding,
      });

      setEnemy(nextEnemy);
    } finally {
      // GUARD: Always release the lock
      battleActionInProgressRef.current = false;
    }
  }, [canAttack, addLog]);

  useEffect(() => {
    if (canAttack || currentZoneId === 0) return;

    const attackDelayMs = 1000 / attacksPerSecond;

    const interval = setInterval(() => {
      if (charRef.current.hp <= 0) {
        return;
      }
      
      const now = Date.now();
      const timePassed = now - lastAttackTime;
      
      if (timePassed >= attackDelayMs) {
        setCanAttack(true);
        setAttackCooldownPercent(100);
      } else {
        setAttackCooldownPercent(Math.floor((timePassed / attackDelayMs) * 100));
      }
    }, 150);

    return () => clearInterval(interval);
  }, [canAttack, lastAttackTime, attacksPerSecond, currentZoneId]);

  // STABILITY FIX: Auto-attack trigger no longer depends on battleAction
  // Uses a stable function that calls battleAction directly
  useEffect(() => {
    if (!autoAttackEnabled || !canAttack || currentZoneId === 0) {
      return;
    }
    
    if (charRef.current.hp <= 0) {
      return;
    }
    
    // STABILITY FIX: Removed battleAction from dependencies
    // Instead, we call it directly without depending on its reference
    const timer = setTimeout(() => {
      if (autoAttackEnabledRef.current && charRef.current.hp > 0 && currentZoneIdRef.current !== 0) {
        battleAction();
      }
    }, 50);
    
    return () => clearTimeout(timer);
  }, [autoAttackEnabled, canAttack, currentZoneId]);

  // BUG FIX: Removed char, hpPotions, mpPotions dependencies to prevent 
  // interval destruction/recreation on every damage taken
  useEffect(() => {
    if (autoPotionTimerRef.current !== null) {
      clearInterval(autoPotionTimerRef.current);
      autoPotionTimerRef.current = null;
    }

    if (autoHpPercent === 0 && autoMpPercent === 0) return;
    if (currentZoneId === 0) return;

    autoPotionTimerRef.current = window.setInterval(() => {
      // Use refs to check state instead of depending on state changes
      const currentChar = charRef.current;
      const currentHpPots = hpPotionsRef.current;
      const currentMpPots = mpPotionsRef.current;
      
      if (currentChar.hp <= 0) return;
      
      const now = Date.now();
      const timeSinceLastPotion = (now - lastAutoPotionTimeRef.current) / 1000;
      
      if (timeSinceLastPotion < 0.5) return;
      
      if (autoHpPercent > 0 && currentHpPots > 0) {
        const hpPercentage = (currentChar.hp / currentChar.maxHp) * 100;
        if (hpPercentage <= autoHpPercent && hpPercentage < 100) {
          useHpPotion();
          lastAutoPotionTimeRef.current = now;
          return;
        }
      }
      
      if (autoMpPercent > 0 && currentMpPots > 0) {
        const mpPercentage = (currentChar.mp / currentChar.maxMp) * 100;
        if (mpPercentage <= autoMpPercent && mpPercentage < 100) {
          useMpPotion();
          lastAutoPotionTimeRef.current = now;
        }
      }
    }, 1000) as unknown as number;

    return () => {
      if (autoPotionTimerRef.current !== null) {
        clearInterval(autoPotionTimerRef.current);
      }
    };
  }, [currentZoneId, autoHpPercent, autoMpPercent, useHpPotion, useMpPotion]);

  // FIX: Enemy attack timer now uses heartbeat approach with attackSpeed calculation
  // This syncs perfectly with the visual timer in EnemyDisplay.tsx
  useEffect(() => {
    if (enemyAttackTimerRef.current !== null) {
      clearInterval(enemyAttackTimerRef.current);
      enemyAttackTimerRef.current = null;
    }

    if (currentZoneId === 0) {
      return;
    }

    // Initialize the last attack time
    lastEnemyAttackTimeRef.current = Date.now();

    // Heartbeat timer: checks every 50ms if it's time to attack
    enemyAttackTimerRef.current = window.setInterval(() => {
      const currentChar = charRef.current;
      const currentEnemy = enemyRef.current;
      const currentEquipped = equippedRef.current;
      const currentZone = currentZoneIdRef.current;
      const currentCallbacks = callbacksRef.current;
      const currentSelfBuffs = activeSelfBuffsRef.current;
      const currentDebuffs = activeDebuffsRef.current;
      
      if (currentChar.hp <= 0 || currentZone === 0 || currentEnemy.attackSpeed <= 0) return;

      const now = Date.now();
      const attackDelayMs = 1000 / currentEnemy.attackSpeed;
      const elapsed = now - lastEnemyAttackTimeRef.current;

      // Only attack when enough time has passed based on enemy's attackSpeed
      if (elapsed < attackDelayMs) return;

      // Reset timer for next attack
      lastEnemyAttackTimeRef.current = now;

      const equipStats = equipStatsRef.current;
      const playerDef = calcPlayerDef(currentChar, equipStats.totalDef, equipStats.totalMdef);
      
      let modifiedEnemy = { ...currentEnemy };
      const stoneCurse = currentDebuffs.find(d => d.id === "stone_curse" && now <= d.expiresAt);
      if (stoneCurse) {
        const atkReduction = 0.10 + (stoneCurse.skillLevel * 0.05);
        modifiedEnemy.atk = Math.floor(modifiedEnemy.atk * (1 - atkReduction));
      }
      
      let { hpDamage, mpDamage, counterDamage } = calculateEnemyDamage(modifiedEnemy, playerDef, currentChar);

      const endureBuff = currentSelfBuffs.find(b => b.id === "endure" && now <= b.expiresAt);
      if (endureBuff) {
        const damageReduction = 0.10 + (endureBuff.skillLevel * 0.05);
        hpDamage = Math.floor(hpDamage * (1 - damageReduction));
      }

      currentCallbacks?.onEnemyDamageDealt?.(hpDamage);

      if (!isMountedRef.current) return;

      setChar((prev) => {
        if (prev.hp <= 0) return prev;
        
        const newHp = Math.max(0, prev.hp - hpDamage);
        const newMp = Math.max(0, prev.mp - mpDamage);
        
        if (newHp > 0) {
          if (mpDamage > 0) {
            addLog(`💥 ${currentEnemy.name} attacks! You take ${hpDamage} dmg (Energy Coat absorbed ${mpDamage} into MP).`);
          } else {
            addLog(`💥 ${currentEnemy.name} attacks! You take ${hpDamage} dmg.`);
          }

          if (counterDamage > 0) {
            addLog(`🛡️ Counter Strike activates! ${currentEnemy.name} takes ${counterDamage} reflected damage.`);
          }
        } else {
          addLog(`💀 You were defeated by ${currentEnemy.name}!`);
        }
        
        return { ...prev, hp: newHp, mp: newMp };
      });

      if (counterDamage > 0) {
        setEnemy(prevEnemy => ({
          ...prevEnemy,
          hp: Math.max(0, prevEnemy.hp - counterDamage),
        }));
      }

      setChar(prev => {
        if (prev.hp <= 0 && !showDeathModal) {
          setShowDeathModal(true);
        }
        return prev;
      });
    }, 50) as unknown as number; // Heartbeat: check every 50ms

    return () => {
      if (enemyAttackTimerRef.current !== null) {
        clearInterval(enemyAttackTimerRef.current);
      }
    };
  }, [currentZoneId, addLog, showDeathModal]);

  useEffect(() => {
    if (currentZoneId !== 0) return;
    
    const id = setInterval(() => {
      townHealingRef.current();
    }, 3000);
    return () => clearInterval(id);
  }, [currentZoneId]);

  function travelToZone(zoneId: number) {
    const targetZone = ZONES.find((z) => z.id === zoneId);
    if (!targetZone || !unlockedZoneIds.includes(zoneId)) {
      addLog("❌ Zone locked!");
      return;
    }
    setCurrentZoneId(zoneId);
    setEnemy(applyCorruptionScaling(getRandomEnemyForZone(zoneId, char.level), char.corruptionLevel));
    setActiveDebuffs([]);
    setActiveSelfBuffs([]);
    setSkillCooldowns({});
    addLog(`🚀 Traveled to: ${targetZone.name}!`);
  }

  function challengeBoss() {
    setIsBossFight(true);
    const bossTemplate = applyCorruptionScaling(
      getRandomEnemyForZone(currentZoneId, char.level),
      char.corruptionLevel
    );
    const bossEnemy: Enemy = {
      ...bossTemplate,
      name: `👹 Boss: ${bossTemplate.name}`,
      hp: bossTemplate.maxHp * BOSS_HP_MULTIPLIER,
      maxHp: bossTemplate.maxHp * BOSS_HP_MULTIPLIER,
      atk: bossTemplate.atk * BOSS_ATK_MULTIPLIER,
      softDef: bossTemplate.softDef * BOSS_DEF_MULTIPLIER,
      hardDefPercent: Math.min(90, Math.floor(bossTemplate.hardDefPercent * 1.5)), 
      softMdef: bossTemplate.softMdef * BOSS_DEF_MULTIPLIER,
      hardMdefPercent: Math.min(90, Math.floor(bossTemplate.hardMdefPercent * 1.5)),
      attackSpeed: bossTemplate.attackSpeed * 1.5,
      count: 1,
      isBoss: true,
    };
    setEnemy(bossEnemy);
    setBossAvailable(false);
    setActiveDebuffs([]);
    setActiveSelfBuffs([]);
    setSkillCooldowns({});
    addLog(`⚔️ CHALLENGE: ${bossEnemy.name} appeared!`);
  }

  function equipItem(itemObj: Equipment & { targetSlot?: keyof EquippedItems }) {
    const { targetSlot, ...item } = itemObj;
    
    if (item.type === "weapon") {
      const weaponType = item.weaponType || "sword";
      
      if (char.jobClass === "Mage" || char.jobClass === "Wizard") {
        if (weaponType !== "wand") {
          addLog(`❌ ${char.jobClass}s can only equip Wands!`);
          return;
        }
      } else if (char.jobClass === "Archer" || char.jobClass === "Hunter") {
        if (weaponType !== "bow") {
          addLog(`❌ ${char.jobClass}s can only equip Bows!`);
          return;
        }
      } else if (char.jobClass === "Swordsman" || char.jobClass === "Knight") {
        if (weaponType !== "sword") {
          addLog(`❌ ${char.jobClass}s can only equip Swords!`);
          return;
        }
      }
    }

    if (item.type === "accessory") {
      if (targetSlot && (targetSlot === "accessory1" || targetSlot === "accessory2")) {
        const oldItem = equipped[targetSlot];
        setEquipped((prev) => ({ ...prev, [targetSlot]: item }));
        if (oldItem) {
          setInventory((prev) => [...prev, oldItem]);
        }
      } else if (!equipped.accessory1) {
        setEquipped((prev) => ({ ...prev, accessory1: item }));
      } else if (!equipped.accessory2) {
        setEquipped((prev) => ({ ...prev, accessory2: item }));
      } else {
        const oldItem = equipped.accessory1;
        setEquipped((prev) => ({ ...prev, accessory1: item }));
        if (oldItem) {
          setInventory((prev) => [...prev, oldItem]);
        }
      }
    } else {
      const oldItem = equipped[item.type as keyof EquippedItems];
      setEquipped((prev) => ({ ...prev, [item.type]: item }));
      if (oldItem) {
        setInventory((prev) => [...prev, oldItem]);
      }
    }
    
    setInventory((prev) => prev.filter((i) => i.id !== item.id));
    addLog(`⚔️ Equipped ${item.name}!`);
  }

  function unequipItem(slotKey: keyof EquippedItems) {
    const item = equipped[slotKey];
    if (!item) {
      addLog("❌ No item equipped in this slot!");
      return;
    }
    
    setEquipped((prev) => ({ ...prev, [slotKey]: null }));
    setInventory((prev) => [...prev, item]);
    addLog(`📦 Unequipped ${item.name}!`);
  }

  function sellItem(item: Equipment) {
    if (!inventory.find(i => i.id === item.id)) {
      addLog("❌ Item not found in inventory!");
      return;
    }
    
    const sellPrice = Math.floor((item.atk || item.matk || item.def || item.stat || 1) * 2);
    setInventory((prev) => prev.filter(i => i.id !== item.id));
    setChar((prev) => ({ ...prev, gold: prev.gold + sellPrice }));
    addLog(`💰 Sold ${item.name} for ${sellPrice}g.`);
  }

  function refineItem(item: Equipment, isEquipped: boolean, slotKey?: keyof EquippedItems): RefineResult | void {
    if (currentZoneId !== 0) {
      addLog("❌ You can only refine in Town!");
      return { success: false, broken: false, message: "Must be in town!" };
    }
    
    if (item.type === "accessory") {
      addLog("❌ Accessories cannot be refined.");
      return { success: false, broken: false, message: "Cannot refine accessories!" };
    }

    const isWeapon = item.type === "weapon";
    const currentRefine = item.refinement || 0;
    
    if (currentRefine >= 10) {
      addLog("❌ Item is already at maximum refinement (+10)!");
      return { success: false, broken: false, message: "Item is MAX level!" };
    }

    const materialCost = REFINEMENT_MATERIAL_COSTS[currentRefine] || 1;
    const hasMaterial = isWeapon ? char.oridecon >= materialCost : char.elunium >= materialCost;
    
    if (!hasMaterial) {
      addLog(`❌ Need ${materialCost}x ${isWeapon ? "Oridecon" : "Elunium"}!`);
      return { success: false, broken: false, message: `Need ${materialCost}x ${isWeapon ? "Oridecon" : "Elunium"}!` };
    }

    const goldCost = REFINEMENT_GOLD_MULTIPLIER * (currentRefine + 1);
    if (char.gold < goldCost) {
      addLog(`❌ Need ${goldCost}g to refine!`);
      return { success: false, broken: false, message: `Need ${goldCost}g!` };
    }

    let successChance = 100;
    if (currentRefine >= 4) {
      const rates: Record<number, number> = {
        4: 55, 5: 45, 6: 35, 7: 25, 8: 15, 9: 10
      };
      successChance = rates[currentRefine];
    }

    setChar(prev => ({
      ...prev,
      gold: prev.gold - goldCost,
      elunium: isWeapon ? prev.elunium : prev.elunium - materialCost,
      oridecon: isWeapon ? prev.oridecon - materialCost : prev.oridecon,
    }));

    const roll = Math.random() * 100;
    const success = roll < successChance;

    if (success) {
      const newItem = { ...item, refinement: currentRefine + 1 };
      
      if (isEquipped && slotKey) {
        setEquipped(prev => ({ ...prev, [slotKey]: newItem }));
      } else {
        setInventory(prev => prev.map(i => i.id === item.id ? newItem : i));
      }
      
      addLog(`✨ SUCCESS! ${item.name} is now +${currentRefine + 1}!`);
      return { success: true, broken: false, message: `✨ SUCCESS! ${item.name} is now +${currentRefine + 1}!` };
    } else {
      if (currentRefine >= 4) {
        const penaltyLevels = 1;
        const newRefinement = Math.max(0, currentRefine - penaltyLevels);
        const newItem = { ...item, refinement: newRefinement };
        
        if (isEquipped && slotKey) {
          setEquipped(prev => ({ ...prev, [slotKey]: newItem }));
        } else {
          setInventory(prev => prev.map(i => i.id === item.id ? newItem : i));
        }
        
        addLog(`💥 FAILED! ${item.name} dropped from +${currentRefine} to +${newRefinement}.`);
        return { success: false, broken: true, message: `💥 FAILED! Level reduced by ${penaltyLevels}!` };
      } else {
        addLog(`❌ FAILED! Refinement unsuccessful.`);
        return { success: false, broken: false, message: `❌ FAILED! Refinement unsuccessful.` };
      }
    }
  }

  function buyHpPotion(amount: number = 1) {
    if (currentZoneId !== 0) {
      addLog("❌ You can only buy potions in Town!");
      return;
    }
    
    const totalCost = HP_POTION_COST * amount;
    if (char.gold >= totalCost) {
      setChar((prev) => ({ ...prev, gold: prev.gold - totalCost }));
      setHpPotions((prev) => prev + amount);
      addLog(`🍖 +${amount} HP Pot${amount > 1 ? 's' : ''} (${totalCost}g)`);
    } else {
      addLog(`❌ Need ${totalCost}g!`);
    }
  }

  function buyMpPotion(amount: number = 1) {
    if (currentZoneId !== 0) {
      addLog("❌ You can only buy potions in Town!");
      return;
    }
    
    const totalCost = MP_POTION_COST * amount;
    if (char.gold >= totalCost) {
      setChar((prev) => ({ ...prev, gold: prev.gold - totalCost }));
      setMpPotions((prev) => prev + amount);
      addLog(`🧪 +${amount} MP Pot${amount > 1 ? 's' : ''} (${totalCost}g)`);
    } else {
      addLog(`❌ Need ${totalCost}g!`);
    }
  }

  return {
    char,
    enemy,
    inventory,
    equipped,
    currentZoneId,
    unlockedZoneIds,
    killCount,
    bossAvailable,
    bossDefeated,
    isBossFight,
    hpPotions,
    mpPotions,
    autoHpPercent,
    autoMpPercent,
    showSkillWindow,
    showJobChangeNPC,
    showDeathModal,
    skillCooldowns,
    activeDebuffs,
    activeSelfBuffs,
    canAttack,
    attackCooldownPercent,
    autoAttackEnabled,
    // Quest system — now stored inside char
    completedStepIds: char.completedStepIds,
    questEnding: char.questEnding,
    // Quest modals
    questStepCompleted,
    clearQuestStepCompleted: () => setQuestStepCompleted(null),
    showEndingChoice,
    clearShowEndingChoice: () => setShowEndingChoice(false),
    setShowSkillWindow,
    setShowJobChangeNPC,
    setAutoHpPercent,
    setAutoMpPercent,
    addStat,
    learnSkill,
    setAutoAttackSkill,
    toggleAutoAttack,
    battleAction,
    travelToZone,
    challengeBoss,
    equipItem,
    unequipItem,
    sellItem,
    refineItem,
    buyHpPotion,
    buyMpPotion,
    useHpPotion,
    useMpPotion,
    handleJobChange,
    openJobChangeNPC,
    handleRespawn,
    escapeToTown,
    sealBloodline,
    remainUnbound,
    devAddBaseLevel,
    devAddJobLevel,
    devAddGold,
    devAddPotions,
    devFullHeal,
    devAddGear,
    devUnlockAllZones,
  };
}
