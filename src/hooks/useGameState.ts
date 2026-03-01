import { useState, useEffect, useRef, useMemo } from "react";
import { Character, CharacterStats } from "../types/character";
import { Enemy } from "../types/enemy";
import { Equipment, EquippedItems } from "../types/equipment";
import { getRandomEnemyForZone, ZONES } from "../data/zones";
import { SKILLS_DB } from "../data/skills";
import { JobClass, canChangeJob, getJobBonuses } from "../data/jobs";
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
  onItemDrop?: (item: Equipment) => void;
}

export function useGameState(addLog: (text: string) => void, callbacks?: GameCallbacks) {
  // Calculate initial maxHp and maxMp based on formulas
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
    gold: 0,
    stats: initialStats,
    statPoints: 9,
    jobClass: initialJobClass,
    jobLevel: 1,
    jobExp: 0,
    jobExpToNext: 50,
    skillPoints: 3,
    learnedSkills: { basic_attack: 1 },
    autoAttackSkillId: "basic_attack",
  });

  const [enemy, setEnemy] = useState<Enemy>(() =>
    getRandomEnemyForZone(0, 1)
  );

  const [inventory, setInventory] = useState<Equipment[]>([]);
  const [equipped, setEquipped] = useState<EquippedItems>({
    weapon: null,
    armor: null,
  });

  const [currentZoneId, setCurrentZoneId] = useState<number>(0);
  const [unlockedZoneIds, setUnlockedZoneIds] = useState<number[]>([0, 1]);
  const [killCount, setKillCount] = useState<number>(0);
  const [bossAvailable, setBossAvailable] = useState<boolean>(false);
  const [bossDefeated, setBossDefeated] = useState<boolean>(false);
  const [isBossFight, setIsBossFight] = useState<boolean>(false);

  const [hpPotions, setHpPotions] = useState<number>(1);
  const [mpPotions, setMpPotions] = useState<number>(1);
  const [autoHpPercent, setAutoHpPercent] = useState<number>(0);
  const [autoMpPercent, setAutoMpPercent] = useState<number>(0);

  const [showSkillWindow, setShowSkillWindow] = useState<boolean>(false);
  const [showJobChangeNPC, setShowJobChangeNPC] = useState<boolean>(false);
  const [showDeathModal, setShowDeathModal] = useState<boolean>(false);
  const [skillCooldowns, setSkillCooldowns] = useState<Record<string, number>>({});

  const [lastAttackTime, setLastAttackTime] = useState<number>(0);
  const [canAttack, setCanAttack] = useState<boolean>(true);
  const [attackCooldownPercent, setAttackCooldownPercent] = useState<number>(100);
  
  const [autoAttackEnabled, setAutoAttackEnabled] = useState<boolean>(false);

  const enemyAttackTimerRef = useRef<number | null>(null);
  const autoPotionTimerRef = useRef<number | null>(null);
  const isMountedRef = useRef<boolean>(true);
  const lastPotionCheckRef = useRef<number>(0);

  const townHealingRef = useRef<() => void>(() => {});
  const autoPotionRef = useRef<() => void>(() => {});
  
  // Store callbacks and state in refs to avoid dependency issues
  const callbacksRef = useRef<GameCallbacks | undefined>(callbacks);
  const charRef = useRef<Character>(char);
  const equippedRef = useRef<EquippedItems>(equipped);
  const enemyRef = useRef<Enemy>(enemy);
  const currentZoneIdRef = useRef<number>(currentZoneId);
  const hpPotionsRef = useRef<number>(hpPotions);
  const mpPotionsRef = useRef<number>(mpPotions);
  const autoHpPercentRef = useRef<number>(autoHpPercent);
  const autoMpPercentRef = useRef<number>(autoMpPercent);
  
  // Component mount/unmount tracking
  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
    };
  }, []);
  
  // Update refs whenever values change
  useEffect(() => {
    callbacksRef.current = callbacks;
  }, [callbacks]);
  
  useEffect(() => {
    charRef.current = char;
  }, [char]);
  
  useEffect(() => {
    equippedRef.current = equipped;
  }, [equipped]);
  
  useEffect(() => {
    enemyRef.current = enemy;
  }, [enemy]);
  
  useEffect(() => {
    currentZoneIdRef.current = currentZoneId;
  }, [currentZoneId]);
  
  useEffect(() => {
    hpPotionsRef.current = hpPotions;
  }, [hpPotions]);
  
  useEffect(() => {
    mpPotionsRef.current = mpPotions;
  }, [mpPotions]);
  
  useEffect(() => {
    autoHpPercentRef.current = autoHpPercent;
  }, [autoHpPercent]);
  
  useEffect(() => {
    autoMpPercentRef.current = autoMpPercent;
  }, [autoMpPercent]);

  // Memoize equipment bonuses for performance
  const weaponBonus = useMemo(() => equipped.weapon?.stat || 0, [equipped.weapon]);
  const armorBonus = useMemo(() => equipped.armor?.stat || 0, [equipped.armor]);
  
  // Memoize ASPD calculation for performance
  const attacksPerSecond = useMemo(() => 
    calcASPD(char), 
    [char.stats.agi, char.stats.dex, char.level]
  );

  // ========== DEV TOOLS FUNCTIONS ==========
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
    
    addLog(`🔧 [DEV] Job Level +1! Now Job Lv.${jobLevelUpResult.newJobLevel}`);
    
    if (canChangeJob(char.jobClass, jobLevelUpResult.newJobLevel) && jobLevelUpResult.newJobLevel === 10) {
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
  // ========== END DEV TOOLS ==========

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

    setChar((prev) => ({
      ...prev,
      autoAttackSkillId: skillId,
    }));

    addLog(`⭐ Default skill set to: ${skill.nameZh}`);
  }

  function toggleAutoAttack() {
    setAutoAttackEnabled(prev => !prev);
    if (!autoAttackEnabled) {
      addLog("🤖 Auto-Attack enabled!");
    } else {
      addLog("✋ Auto-Attack disabled!");
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

    const newMaxHp = calcMaxHp(char.level, char.stats.vit, newJob);
    const newMaxMp = calcMaxMp(char.level, char.stats.int, newJob);

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
      autoAttackSkillId: firstJobSkill ? firstJobSkill.id : "basic_attack",
    });

    setCurrentZoneId(0);
    setEnemy(getRandomEnemyForZone(0, char.level));
    setKillCount(0);
    setIsBossFight(false);
    setBossAvailable(false);

    addLog(`🎉 Congratulations! You are now a ${newJob}!`);
    addLog(`🏛️ Teleported to Town for safety!`);
    addLog(`💫 You received 3 Skill Points to learn new skills!`);
    if (firstJobSkill) {
      addLog(`📖 You learned ${firstJobSkill.nameZh}! It's now your default skill.`);
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
    
    addLog("❤️‍🩹 Respawned in Town! Resting will recover HP/MP.");
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
        
        if (newHp > prev.hp || newMp > prev.mp) {
          addLog(`✨ Town Healing: +${newHp - prev.hp} HP, +${newMp - prev.mp} MP`);
        }
        
        return { ...prev, hp: newHp, mp: newMp };
      });
    }
  }
  
  townHealingRef.current = processTownHealing;

  function processAutoPotion() {
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
  }
  
  autoPotionRef.current = processAutoPotion;

  function battleAction(skillId?: string) {
    if (!isMountedRef.current) return;
    if (char.hp <= 0) return;
    if (currentZoneId === 0) return;
    
    if (!canAttack) return;

    const weaponBonus = equipped.weapon?.stat || 0;

    const actualSkillId = skillId || char.autoAttackSkillId;
    const skillLevel = char.learnedSkills[actualSkillId] || 0;

    if (skillLevel === 0) return;

    const skill = SKILLS_DB[char.jobClass].find((s) => s.id === actualSkillId);
    if (!skill) return;
    
    const now = Date.now();
    
    if (skill.cooldown > 0) {
      const lastUsed = skillCooldowns[actualSkillId] || 0;
      const timePassed = (now - lastUsed) / 1000;

      if (timePassed < skill.cooldown) {
        return;
      }
      setSkillCooldowns((prev) => ({ ...prev, [actualSkillId]: now }));
    }

    const mpCost = skill.mpCost(skillLevel);
    if (char.mp < mpCost) {
      const mpRegen = Math.floor(char.maxMp * 0.1) + 5;
      const newMp = Math.min(char.maxMp, char.mp + mpRegen);
      setChar((prev) => ({ ...prev, mp: newMp }));
      addLog(`💤 Too low MP! Resting... Recovered ${mpRegen} MP.`);
      return;
    }

    setLastAttackTime(now);
    setCanAttack(false);
    setAttackCooldownPercent(0);

    let nextCharHp = char.hp;
    let nextCharMp = char.mp - mpCost;
    let nextCharExp = char.exp;
    let nextCharLevel = char.level;
    let nextCharExpToNext = char.expToNext;
    let nextCharGold = char.gold;
    let nextStatPoints = char.statPoints;
    let didLevelUp = false;

    let nextEnemyHp = enemy.hp;
    let nextEnemy = enemy;

    const { damage, isCrit } = calculateDamage(
      char,
      enemy,
      skill,
      skillLevel,
      weaponBonus
    );
    nextEnemyHp = enemy.hp - damage;

    callbacks?.onDamageDealt?.(damage, isCrit);

    const critText = isCrit ? " ❗CRIT!" : "";
    addLog(
      `🎯 ${skill.nameZh} Lv.${skillLevel}: Hit ${enemy.name} for ${damage} dmg.${critText} (MP-${mpCost})`
    );

    let nextJobLevel = char.jobLevel;
    let nextJobExp = char.jobExp;
    let nextJobExpToNext = char.jobExpToNext;
    let nextSkillPoints = char.skillPoints;

    if (nextEnemyHp <= 0) {
      addLog(`💀 ${enemy.name} defeated!`);

      const goldGain = calculateGoldGain(enemy);
      nextCharGold += goldGain;
      addLog(`💰 Gained ${goldGain} Gold.`);

      const expGain = calculateExpGain(enemy);
      const levelUpResult = processLevelUp(char, expGain);
      nextCharExp = levelUpResult.newExp;
      nextCharLevel = levelUpResult.newLevel;
      nextCharExpToNext = levelUpResult.newExpToNext;
      nextStatPoints = levelUpResult.newStatPoints;

      addLog(`✨ Gained ${expGain} Base EXP.`);

      if (levelUpResult.leveledUp) {
        nextCharHp = levelUpResult.newHp;
        nextCharMp = levelUpResult.newMp;
        didLevelUp = true;
        addLog(`🌟 LEVEL UP! Now Lv.${nextCharLevel} (Stat Points +3)`);
        callbacks?.onLevelUp?.(nextCharLevel);
      }

      const jobExpGain = calculateJobExpGain(enemy, char.jobLevel);
      const jobLevelUpResult = processJobLevelUp(char, jobExpGain);
      nextJobExp = jobLevelUpResult.newJobExp;
      nextJobLevel = jobLevelUpResult.newJobLevel;
      nextJobExpToNext = jobLevelUpResult.newJobExpToNext;
      nextSkillPoints = jobLevelUpResult.newSkillPoints;

      addLog(`✨ Gained ${jobExpGain} Job EXP.`);

      if (jobLevelUpResult.leveledUp) {
        addLog(
          `📘 JOB LEVEL UP! Job Lv.${nextJobLevel} (Skill Points +1)`
        );
        
        if (canChangeJob(char.jobClass, nextJobLevel) && nextJobLevel === 10) {
          addLog(`🎊 You can now change your job! Talk to the Job Change Master!`);
        }
      }

      if (isBossFight) {
        addLog(`🎉 BOSS DEFEATED! Next area unlocked!`);
        setBossDefeated(true);
        setKillCount(0);
        setIsBossFight(false);

        const currentZoneIndex = ZONES.findIndex((z) => z.id === currentZoneId);
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

        const bossGear = generateBossLoot(nextCharLevel);
        setInventory((prev) => [...prev, bossGear]);
        addLog(`🎁 Boss Drop: ${bossGear.name}!`);
        callbacks?.onItemDrop?.(bossGear);

        nextEnemy = getRandomEnemyForZone(currentZoneId, nextCharLevel);
        addLog(`👾 A wild ${nextEnemy.name} appeared!`);
      } else {
        const nextKillCount = killCount + 1;
        setKillCount(nextKillCount);

        if (nextKillCount % KILLS_FOR_BOSS === 0) {
          setBossAvailable(true);
          addLog(`⚔️ Boss is ready! Click the button to challenge!`);
        }

        if (shouldDropLoot()) {
          const newGear = generateLoot(nextCharLevel);
          setInventory((prev) => [...prev, newGear]);
          addLog(`🎁 Looted: ${newGear.name}!`);
          callbacks?.onItemDrop?.(newGear);
        }

        nextEnemy = getRandomEnemyForZone(currentZoneId, nextCharLevel);
        addLog(`👾 A wild ${nextEnemy.name} appeared!`);
      }
    } else {
      nextEnemy = { ...enemy, hp: nextEnemyHp };
    }

    // Preserve current stats and maxHp/maxMp unless leveling up
    const finalMaxHp = didLevelUp 
      ? calcMaxHp(nextCharLevel, char.stats.vit, char.jobClass)
      : char.maxHp;
    const finalMaxMp = didLevelUp
      ? calcMaxMp(nextCharLevel, char.stats.int, char.jobClass)
      : char.maxMp;

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
      stats: char.stats,
      statPoints: nextStatPoints,
      jobClass: char.jobClass,
      jobLevel: nextJobLevel,
      jobExp: nextJobExp,
      jobExpToNext: nextJobExpToNext,
      skillPoints: nextSkillPoints,
      learnedSkills: char.learnedSkills,
      autoAttackSkillId: char.autoAttackSkillId,
    });

    setEnemy(nextEnemy);
  }

  const battleActionRef = useRef(battleAction);
  
  // Update battleAction ref with proper dependencies
  useEffect(() => {
    battleActionRef.current = battleAction;
  }, [char, enemy, equipped, currentZoneId, canAttack, skillCooldowns, killCount, isBossFight]);

  // Player ASPD cooldown UI loop - optimized dependencies
  useEffect(() => {
    if (canAttack || currentZoneId === 0 || char.hp <= 0) return;

    const attackDelayMs = 1000 / attacksPerSecond;

    const interval = setInterval(() => {
      const now = Date.now();
      const timePassed = now - lastAttackTime;
      
      if (timePassed >= attackDelayMs) {
        setCanAttack(true);
        setAttackCooldownPercent(100);
      } else {
        setAttackCooldownPercent(Math.floor((timePassed / attackDelayMs) * 100));
      }
    }, 50);

    return () => clearInterval(interval);
  }, [canAttack, lastAttackTime, attacksPerSecond, currentZoneId, char.hp]);

  // Auto-Attack System - Fixed infinite loop by removing char.hp dependency
  useEffect(() => {
    if (autoAttackEnabled && canAttack && currentZoneId !== 0 && charRef.current.hp > 0) {
      const timer = setTimeout(() => {
        battleActionRef.current();
      }, 10);
      
      return () => clearTimeout(timer);
    }
  }, [autoAttackEnabled, canAttack, currentZoneId]);

  // CONTINUOUS AUTO-POTION CHECK - Independent of attacks
  useEffect(() => {
    // Clear previous timer
    if (autoPotionTimerRef.current !== null) {
      clearInterval(autoPotionTimerRef.current);
      autoPotionTimerRef.current = null;
    }

    // Only run auto-potion checks when NOT in town
    if (currentZoneId === 0) {
      return;
    }

    // Check auto-potion every second, independent of attack actions
    autoPotionTimerRef.current = window.setInterval(() => {
      autoPotionRef.current();
    }, 1000) as unknown as number;

    return () => {
      if (autoPotionTimerRef.current !== null) {
        clearInterval(autoPotionTimerRef.current);
      }
    };
  }, [currentZoneId]);

  // ENEMY ATTACK SYSTEM - Uses refs to avoid restarting interval
  useEffect(() => {
    if (enemyAttackTimerRef.current !== null) {
      clearInterval(enemyAttackTimerRef.current);
      enemyAttackTimerRef.current = null;
    }

    if (currentZoneId === 0 || enemy.attackSpeed <= 0) {
      return;
    }

    const enemyAttackDelayMs = 1000 / enemy.attackSpeed;
    
    enemyAttackTimerRef.current = window.setInterval(() => {
      const currentChar = charRef.current;
      const currentEnemy = enemyRef.current;
      const currentEquipped = equippedRef.current;
      const currentZone = currentZoneIdRef.current;
      const currentCallbacks = callbacksRef.current;
      
      if (currentChar.hp <= 0 || currentZone === 0) return;

      const armorBonus = currentEquipped.armor?.stat || 0;
      const playerDef = calcPlayerDef(currentChar, armorBonus);
      const enemyDmg = calculateEnemyDamage(currentEnemy, playerDef);

      currentCallbacks?.onEnemyDamageDealt?.(enemyDmg);

      if (!isMountedRef.current) return;

      setChar((prev) => {
        if (prev.hp <= 0) return prev;
        
        const newHp = Math.max(0, prev.hp - enemyDmg);
        
        if (newHp > 0) {
          addLog(`💥 ${currentEnemy.name} attacks! You take ${enemyDmg} dmg.`);
        } else {
          addLog(`💀 You were defeated by ${currentEnemy.name}!`);
          setShowDeathModal(true);
        }
        
        return { ...prev, hp: newHp };
      });
    }, enemyAttackDelayMs) as unknown as number;

    return () => {
      if (enemyAttackTimerRef.current !== null) {
        clearInterval(enemyAttackTimerRef.current);
      }
    };
  }, [enemy.attackSpeed, enemy.name, currentZoneId]);

  // Periodic town healing
  useEffect(() => {
    const id = setInterval(() => {
      townHealingRef.current();
    }, 3000);
    return () => clearInterval(id);
  }, []);

  function travelToZone(zoneId: number) {
    const targetZone = ZONES.find((z) => z.id === zoneId);
    if (!targetZone || !unlockedZoneIds.includes(zoneId)) {
      addLog("❌ 地圖未解鎖！");
      return;
    }
    setCurrentZoneId(zoneId);
    setEnemy(getRandomEnemyForZone(zoneId, char.level));
    addLog(`🚀 旅行到：${targetZone.name}！`);
  }

  function challengeBoss() {
    setIsBossFight(true);
    const bossTemplate = getRandomEnemyForZone(currentZoneId, char.level);
    const bossEnemy = {
      ...bossTemplate,
      name: `👹 Boss: ${bossTemplate.name}`,
      hp: bossTemplate.maxHp * BOSS_HP_MULTIPLIER,
      maxHp: bossTemplate.maxHp * BOSS_HP_MULTIPLIER,
      atk: bossTemplate.atk * BOSS_ATK_MULTIPLIER,
      def: bossTemplate.def * BOSS_DEF_MULTIPLIER,
      attackSpeed: bossTemplate.attackSpeed * 1.5,
    };
    setEnemy(bossEnemy);
    setBossAvailable(false);
    addLog(`⚔️ CHALLENGE: ${bossEnemy.name} appeared!`);
  }

  function equipItem(item: Equipment) {
    setEquipped((prev) => ({ ...prev, [item.type]: item }));
    addLog(`⚔️ Equipped ${item.name}!`);
  }

  function sellItem() {
    if (inventory.length === 0) {
      addLog("❌ Inventory empty!");
      return;
    }
    const item = inventory[0];
    const sellPrice = item.stat * 2;
    setInventory((prev) => prev.slice(1));
    setChar((prev) => ({ ...prev, gold: prev.gold + sellPrice }));
    addLog(`💰 Sold ${item.name} for ${sellPrice}g.`);
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

  // FIXED: Use state updater functions to get fresh values
  function useHpPotion() {
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
        
        const heal = Math.floor(prevChar.maxHp * HP_POTION_HEAL_PERCENT);
        const newHp = Math.min(prevChar.maxHp, prevChar.hp + heal);
        addLog(`🍖 +${heal} HP.`);
        return { ...prevChar, hp: newHp };
      });
      
      return prevPotions - 1;
    });
  }

  function useMpPotion() {
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
    canAttack,
    attackCooldownPercent,
    autoAttackEnabled,
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
    sellItem,
    buyHpPotion,
    buyMpPotion,
    useHpPotion,
    useMpPotion,
    handleJobChange,
    openJobChangeNPC,
    handleRespawn,
    escapeToTown,
    devAddBaseLevel,
    devAddJobLevel,
    devAddGold,
    devAddPotions,
    devFullHeal,
    devAddGear,
    devUnlockAllZones,
  };
}
