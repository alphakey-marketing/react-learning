import { useState, useEffect, useRef, useMemo, useCallback } from "react";
import { Character, CharacterStats } from "../types/character";
import { Enemy } from "../types/enemy";
import { Equipment, EquippedItems } from "../types/equipment";
import { getRandomEnemyForZone, ZONES } from "../data/zones";
import { SKILLS_DB } from "../data/skills";
import { JobClass, canChangeJob, getJobBonuses } from "../data/jobs";
import { RefineResult } from "../components/RefineNPC";
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
  onMaterialDrop?: (material: 'elunium' | 'oridecon', amount: number) => void;
  onEnemyKilled?: (isBoss: boolean, goldEarned: number) => void;
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
    elunium: 0,
    oridecon: 0,
  });

  const [enemy, setEnemy] = useState<Enemy>(() =>
    getRandomEnemyForZone(0, 1)
  );

  const [inventory, setInventory] = useState<Equipment[]>([]);
  const [equipped, setEquipped] = useState<EquippedItems>({
    weapon: null,
    armor: null,
    head: null,
    garment: null,
    footgear: null,
    accessory1: null,
    accessory2: null,
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
  
  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
    };
  }, []);
  
  useEffect(() => { callbacksRef.current = callbacks; }, [callbacks]);
  useEffect(() => { charRef.current = char; }, [char]);
  useEffect(() => { equippedRef.current = equipped; }, [equipped]);
  useEffect(() => { enemyRef.current = enemy; }, [enemy]);
  useEffect(() => { currentZoneIdRef.current = currentZoneId; }, [currentZoneId]);
  useEffect(() => { hpPotionsRef.current = hpPotions; }, [hpPotions]);
  useEffect(() => { mpPotionsRef.current = mpPotions; }, [mpPotions]);
  useEffect(() => { autoHpPercentRef.current = autoHpPercent; }, [autoHpPercent]);
  useEffect(() => { autoMpPercentRef.current = autoMpPercent; }, [autoMpPercent]);
  useEffect(() => { autoAttackEnabledRef.current = autoAttackEnabled; }, [autoAttackEnabled]);

  const weaponBonus = useMemo(() => {
    if (!equipped.weapon) return 0;
    const baseAtk = equipped.weapon.atk || equipped.weapon.stat || 0;
    const refineBonus = (equipped.weapon.refinement || 0) * 3;
    return baseAtk + refineBonus;
  }, [equipped.weapon]);

  const armorBonus = useMemo(() => {
    let totalDef = 0;
    const armorTypes = ['armor', 'head', 'garment', 'footgear'] as const;
    armorTypes.forEach(type => {
      const item = equipped[type];
      if (item) {
        totalDef += (item.def || (item.type === 'armor' ? item.stat || 0 : 0)) + (item.refinement || 0) * 1;
      }
    });
    return totalDef;
  }, [equipped.armor, equipped.head, equipped.garment, equipped.footgear]);
  
  const attacksPerSecond = useMemo(() => 
    calcASPD(char), 
    [char.stats.agi, char.stats.dex, char.level]
  );

  const devAddBaseLevel = useCallback(() => {
    setChar(prev => {
      const levelUpResult = processLevelUp(prev, prev.expToNext);
      
      callbacks?.onLevelUp?.(levelUpResult.newLevel);
      addLog(`🔧 [DEV] Base Level +1! Now Lv.${levelUpResult.newLevel}`);
      
      return {
        ...prev,
        level: levelUpResult.newLevel,
        exp: levelUpResult.newExp,
        expToNext: levelUpResult.newExpToNext,
        statPoints: levelUpResult.newStatPoints,
        hp: levelUpResult.newHp,
        maxHp: calcMaxHp(levelUpResult.newLevel, prev.stats.vit, prev.jobClass),
        mp: levelUpResult.newMp,
        maxMp: calcMaxMp(levelUpResult.newLevel, prev.stats.int, prev.jobClass),
      };
    });
  }, [addLog, callbacks]);

  const devAddJobLevel = useCallback(() => {
    setChar(prev => {
      const jobLevelUpResult = processJobLevelUp(prev, prev.jobExpToNext);
      
      addLog(`🔧 [DEV] Job Level +1! Now Job Lv.${jobLevelUpResult.newJobLevel}`);
      
      if (canChangeJob(prev.jobClass, jobLevelUpResult.newJobLevel) && jobLevelUpResult.newJobLevel === 10) {
        addLog(`🎊 You can now change your job!`);
      }
      
      return {
        ...prev,
        jobLevel: jobLevelUpResult.newJobLevel,
        jobExp: jobLevelUpResult.newJobExp,
        jobExpToNext: jobLevelUpResult.newJobExpToNext,
        skillPoints: jobLevelUpResult.newSkillPoints,
      };
    });
  }, [addLog]);

  const devAddGold = useCallback((amount: number) => {
    setChar(prev => ({ ...prev, gold: prev.gold + amount }));
    addLog(`🔧 [DEV] Added ${amount} gold!`);
  }, [addLog]);

  const devAddPotions = useCallback((hp: number, mp: number) => {
    setHpPotions(prev => prev + hp);
    setMpPotions(prev => prev + mp);
    addLog(`🔧 [DEV] Added ${hp} HP potions and ${mp} MP potions!`);
  }, [addLog]);

  const devFullHeal = useCallback(() => {
    setChar(prev => ({ ...prev, hp: prev.maxHp, mp: prev.maxMp }));
    addLog(`🔧 [DEV] Full heal!`);
  }, [addLog]);

  const devAddGear = useCallback(() => {
    setChar(prev => {
      const randomGear = generateLoot(prev.level + 10);
      setInventory(inv => [...inv, randomGear]);
      addLog(`🔧 [DEV] Added ${randomGear.name}!`);
      return prev;
    });
  }, [addLog]);

  const devUnlockAllZones = useCallback(() => {
    const allZoneIds = ZONES.map(z => z.id);
    setUnlockedZoneIds(allZoneIds);
    addLog(`🔧 [DEV] Unlocked all zones!`);
  }, [addLog]);

  const addStat = useCallback((stat: keyof CharacterStats) => {
    setChar((prev) => {
      if (prev.statPoints <= 0) {
        addLog("❌ No stat points!");
        return prev;
      }
      
      const newStats = { ...prev.stats, [stat]: prev.stats[stat] + 1 };
      return {
        ...prev,
        stats: newStats,
        statPoints: prev.statPoints - 1,
        maxHp: stat === 'vit' ? calcMaxHp(prev.level, newStats.vit, prev.jobClass) : prev.maxHp,
        maxMp: stat === 'int' ? calcMaxMp(prev.level, newStats.int, prev.jobClass) : prev.maxMp,
      };
    });
  }, [addLog]);

  const learnSkill = useCallback((skillId: string) => {
    setChar(prev => {
      const currentLevel = prev.learnedSkills[skillId] || 0;
      const skill = SKILLS_DB[prev.jobClass].find((s) => s.id === skillId);

      if (!skill) {
        addLog("❌ Skill not found!");
        return prev;
      }

      if (currentLevel >= skill.maxLevel) {
        addLog(`❌ ${skill.nameZh} already MAX!`);
        return prev;
      }

      if (prev.skillPoints <= 0) {
        addLog("❌ No Skill Points!");
        return prev;
      }

      addLog(`📖 Learned ${skill.nameZh} Lv.${currentLevel + 1}!`);
      
      return {
        ...prev,
        learnedSkills: {
          ...prev.learnedSkills,
          [skillId]: currentLevel + 1,
        },
        skillPoints: prev.skillPoints - 1,
      };
    });
  }, [addLog]);

  const setAutoAttackSkill = useCallback((skillId: string) => {
    setChar(prev => {
      const skillLevel = prev.learnedSkills[skillId] || 0;
      if (skillLevel === 0) {
        addLog("❌ You haven't learned this skill yet!");
        return prev;
      }
      
      const skill = SKILLS_DB[prev.jobClass].find((s) => s.id === skillId);
      if (!skill) {
        addLog("❌ Skill not found!");
        return prev;
      }

      if (skill.effect === "buff") {
        addLog("❌ Cannot set passive/buff skill as default attack!");
        return prev;
      }

      addLog(`⭐ Default skill set to: ${skill.nameZh}`);
      return { ...prev, autoAttackSkillId: skillId };
    });
  }, [addLog]);

  const toggleAutoAttack = useCallback(() => {
    setAutoAttackEnabled(prev => {
      const newValue = !prev;
      addLog(newValue ? "🤖 Auto-Attack enabled!" : "✋ Auto-Attack disabled!");
      return newValue;
    });
  }, [addLog]);

  const handleJobChange = useCallback((newJob: JobClass) => {
    const jobBonuses = getJobBonuses(newJob);
    
    const newJobSkills = SKILLS_DB[newJob];
    const initialSkills: Record<string, number> = { basic_attack: 1 };
    
    const firstJobSkill = newJobSkills.find(s => s.id !== "basic_attack");
    if (firstJobSkill) {
      initialSkills[firstJobSkill.id] = 1;
    }

    const firstAttackSkill = newJobSkills.find(s => s.id !== "basic_attack" && s.effect !== "buff");

    setChar(prev => {
      const newMaxHp = calcMaxHp(prev.level, prev.stats.vit, newJob);
      const newMaxMp = calcMaxMp(prev.level, prev.stats.int, newJob);
      
      return {
        ...prev,
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
      };
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
      addLog(`📖 You learned ${firstJobSkill.nameZh}!`);
    }
    if (firstAttackSkill && firstAttackSkill.id === firstJobSkill?.id) {
      addLog(`⭐ ${firstAttackSkill.nameZh} is now your default skill.`);
    }
    addLog(`🛡️ Job Bonuses: HP ${Math.floor((jobBonuses.hpMultiplier - 1) * 100)}%, MP ${Math.floor((jobBonuses.mpMultiplier - 1) * 100)}%, +${jobBonuses.atkBonus} ATK, +${jobBonuses.defBonus} DEF`);
    setShowJobChangeNPC(false);
  }, [addLog, char.level]);

  const openJobChangeNPC = useCallback(() => {
    setShowJobChangeNPC(true);
  }, []);

  const handleRespawn = useCallback(() => {
    setChar((prev) => ({
      ...prev,
      hp: Math.floor(prev.maxHp * 0.5),
      mp: Math.floor(prev.maxMp * 0.5),
    }));
    
    setKillCount(0);
    setIsBossFight(false);
    setBossAvailable(false);
    setShowDeathModal(false);
    setCurrentZoneId(0);
    setEnemy(getRandomEnemyForZone(0, char.level));
    
    addLog("❤️‍🩹 Respawned in Town!");
  }, [addLog, char.level]);

  const escapeToTown = useCallback(() => {
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
  }, [addLog, char.level, currentZoneId]);

  const processTownHealing = useCallback(() => {
    const currentChar = charRef.current;
    const currentZone = currentZoneIdRef.current;
    
    if (currentZone === 0 && (currentChar.hp < currentChar.maxHp || currentChar.mp < currentChar.maxMp) && currentChar.hp > 0) {
      const healHp = Math.floor(currentChar.maxHp * 0.1);
      const healMp = Math.floor(currentChar.maxMp * 0.1);
      
      setChar(prev => ({
        ...prev,
        hp: Math.min(prev.maxHp, prev.hp + healHp),
        mp: Math.min(prev.maxMp, prev.mp + healMp),
      }));
    }
  }, []);
  
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
        
        const heal = Math.floor(prevChar.maxHp * HP_POTION_HEAL_PERCENT);
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

  const processAutoPotion = useCallback(() => {
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
  }, [useHpPotion, useMpPotion]);
  
  autoPotionRef.current = processAutoPotion;

  const battleAction = useCallback((skillId?: string) => {
    if (!isMountedRef.current) return;
    
    const currentChar = charRef.current;
    const currentEnemy = enemyRef.current;
    const currentZone = currentZoneIdRef.current;
    const currentEquipped = equippedRef.current;
    
    if (currentChar.hp <= 0) return;
    if (currentZone === 0) return;
    if (!canAttack) return;

    // Calculate weapon bonus from refs
    let currentWeaponBonus = 0;
    if (currentEquipped.weapon) {
      const baseAtk = currentEquipped.weapon.atk || currentEquipped.weapon.stat || 0;
      const refineBonus = (currentEquipped.weapon.refinement || 0) * 3;
      currentWeaponBonus = baseAtk + refineBonus;
    }

    let actualSkillId = skillId || currentChar.autoAttackSkillId;
    let skillLevel = currentChar.learnedSkills[actualSkillId] || 0;
    let skill = SKILLS_DB[currentChar.jobClass].find((s) => s.id === actualSkillId);

    if (!skill || skillLevel === 0 || skill.effect === "buff") {
      actualSkillId = "basic_attack";
      skillLevel = currentChar.learnedSkills["basic_attack"] || 1;
      skill = SKILLS_DB[currentChar.jobClass].find((s) => s.id === "basic_attack")!;
    }
    
    const now = Date.now();
    let isSkillOnCooldown = false;
    
    if (skill.cooldown > 0) {
      setSkillCooldowns(prev => {
        const lastUsed = prev[actualSkillId] || 0;
        const timePassed = (now - lastUsed) / 1000;
        if (timePassed < skill!.cooldown) {
          isSkillOnCooldown = true;
        }
        return prev;
      });
    }

    let mpCost = skill.mpCost(skillLevel);
    let isMpInsufficient = currentChar.mp < mpCost;

    if ((isSkillOnCooldown || isMpInsufficient) && actualSkillId !== "basic_attack") {
      actualSkillId = "basic_attack";
      skillLevel = currentChar.learnedSkills["basic_attack"] || 1;
      skill = SKILLS_DB[currentChar.jobClass].find((s) => s.id === "basic_attack")!;
      mpCost = skill.mpCost(skillLevel);
      isMpInsufficient = currentChar.mp < mpCost;
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

    const { damage, isCrit } = calculateDamage(
      currentChar,
      currentEnemy,
      skill,
      skillLevel,
      currentWeaponBonus
    );
    
    const nextEnemyHp = currentEnemy.hp - damage;

    callbacksRef.current?.onDamageDealt?.(damage, isCrit);

    const critText = isCrit ? " ❗CRIT!" : "";
    addLog(`🎯 ${skill.nameZh} Lv.${skillLevel}: Hit ${currentEnemy.name} for ${damage} dmg.${critText} (MP-${mpCost})`);

    if (nextEnemyHp <= 0) {
      addLog(`💀 ${currentEnemy.name} defeated!`);

      const goldGain = calculateGoldGain(currentEnemy);
      addLog(`💰 Gained ${goldGain} Gold.`);

      callbacksRef.current?.onEnemyKilled?.(isBossFight, goldGain);

      const expGain = calculateExpGain(currentEnemy);
      addLog(`✨ Gained ${expGain} Base EXP.`);

      const jobExpGain = calculateJobExpGain(currentEnemy, currentChar.jobLevel);
      addLog(`✨ Gained ${jobExpGain} Job EXP.`);

      setChar(prev => {
        const levelUpResult = processLevelUp(prev, expGain);
        const jobLevelUpResult = processJobLevelUp(prev, jobExpGain);
        
        const finalMaxHp = levelUpResult.leveledUp 
          ? calcMaxHp(levelUpResult.newLevel, prev.stats.vit, prev.jobClass)
          : prev.maxHp;
        const finalMaxMp = levelUpResult.leveledUp
          ? calcMaxMp(levelUpResult.newLevel, prev.stats.int, prev.jobClass)
          : prev.maxMp;
        
        if (levelUpResult.leveledUp) {
          addLog(`🌟 LEVEL UP! Now Lv.${levelUpResult.newLevel} (Stat Points +3)`);
          callbacksRef.current?.onLevelUp?.(levelUpResult.newLevel);
        }
        
        if (jobLevelUpResult.leveledUp) {
          addLog(`📘 JOB LEVEL UP! Job Lv.${jobLevelUpResult.newJobLevel} (Skill Points +1)`);
          
          if (canChangeJob(prev.jobClass, jobLevelUpResult.newJobLevel) && jobLevelUpResult.newJobLevel === 10) {
            addLog(`🎊 You can now change your job! Talk to the Job Change Master!`);
          }
        }
        
        let newElunium = prev.elunium;
        let newOridecon = prev.oridecon;
        
        if (isBossFight) {
          const numElu = Math.floor(Math.random() * 2) + 1;
          const numOri = Math.floor(Math.random() * 2) + 1;
          newElunium += numElu;
          newOridecon += numOri;
          addLog(`💎 Boss Drop: ${numElu}x Elunium, ${numOri}x Oridecon!`);
          callbacksRef.current?.onMaterialDrop?.('elunium', numElu);
          callbacksRef.current?.onMaterialDrop?.('oridecon', numOri);
        } else {
          const matRoll = Math.random();
          if (matRoll < 0.05) {
            newElunium += 1;
            addLog(`💎 Looted: 1x Elunium!`);
            callbacksRef.current?.onMaterialDrop?.('elunium', 1);
          } else if (matRoll < 0.08) {
            newOridecon += 1;
            addLog(`💎 Looted: 1x Oridecon!`);
            callbacksRef.current?.onMaterialDrop?.('oridecon', 1);
          }
        }
        
        return {
          ...prev,
          hp: levelUpResult.leveledUp ? levelUpResult.newHp : prev.hp,
          maxHp: finalMaxHp,
          mp: levelUpResult.leveledUp ? (prev.mp - mpCost + levelUpResult.newMp - prev.mp) : prev.mp - mpCost,
          maxMp: finalMaxMp,
          level: levelUpResult.newLevel,
          exp: levelUpResult.newExp,
          expToNext: levelUpResult.newExpToNext,
          gold: prev.gold + goldGain,
          statPoints: levelUpResult.newStatPoints,
          jobLevel: jobLevelUpResult.newJobLevel,
          jobExp: jobLevelUpResult.newJobExp,
          jobExpToNext: jobLevelUpResult.newJobExpToNext,
          skillPoints: jobLevelUpResult.newSkillPoints,
          elunium: newElunium,
          oridecon: newOridecon,
        };
      });

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

        const bossGear = generateBossLoot(currentChar.level);
        setInventory((prev) => [...prev, bossGear]);
        addLog(`🎁 Boss Drop: ${bossGear.name}!`);
        callbacksRef.current?.onItemDrop?.(bossGear);

        const nextEnemy = getRandomEnemyForZone(currentZoneId, currentChar.level);
        setEnemy(nextEnemy);
        addLog(`👾 A wild ${nextEnemy.name} appeared!`);
      } else {
        setKillCount(prev => {
          const nextKillCount = prev + 1;
          if (nextKillCount % KILLS_FOR_BOSS === 0) {
            setBossAvailable(true);
            addLog(`⚔️ Boss is ready! Click the button to challenge!`);
          }
          return nextKillCount;
        });

        if (shouldDropLoot()) {
          const newGear = generateLoot(currentChar.level);
          setInventory((prev) => [...prev, newGear]);
          addLog(`🎁 Looted: ${newGear.name}!`);
          callbacksRef.current?.onItemDrop?.(newGear);
        }

        const nextEnemy = getRandomEnemyForZone(currentZoneId, currentChar.level);
        setEnemy(nextEnemy);
        addLog(`👾 A wild ${nextEnemy.name} appeared!`);
      }
    } else {
      setEnemy({ ...currentEnemy, hp: nextEnemyHp });
      setChar(prev => ({ ...prev, mp: prev.mp - mpCost }));
    }
  }, [addLog, canAttack, currentZoneId, isBossFight]);

  const battleActionRef = useRef(battleAction);
  
  // Reduced dependencies - only update when combat mechanics fundamentally change
  useEffect(() => {
    battleActionRef.current = battleAction;
  }, [battleAction]);

  // Optimized cooldown animation - reduced from 50ms to 100ms
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
    }, 100); // Reduced from 50ms to 100ms for better performance

    return () => clearInterval(interval);
  }, [canAttack, lastAttackTime, attacksPerSecond, currentZoneId, char.hp]);

  useEffect(() => {
    if (!autoAttackEnabled || !canAttack || currentZoneId === 0) {
      return;
    }
    
    if (charRef.current.hp <= 0) {
      return;
    }
    
    const timer = setTimeout(() => {
      battleActionRef.current();
    }, 10);
    
    return () => clearTimeout(timer);
  }, [autoAttackEnabled, canAttack, currentZoneId, char.hp]);

  useEffect(() => {
    if (autoPotionTimerRef.current !== null) {
      clearInterval(autoPotionTimerRef.current);
      autoPotionTimerRef.current = null;
    }

    if (currentZoneId === 0) {
      return;
    }

    autoPotionTimerRef.current = window.setInterval(() => {
      autoPotionRef.current();
    }, 1000) as unknown as number;

    return () => {
      if (autoPotionTimerRef.current !== null) {
        clearInterval(autoPotionTimerRef.current);
      }
    };
  }, [currentZoneId]);

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

      let totalDef = 0;
      const armorTypes = ['armor', 'head', 'garment', 'footgear'] as const;
      armorTypes.forEach(type => {
        const item = currentEquipped[type];
        if (item) {
          totalDef += (item.def || (item.type === 'armor' ? item.stat || 0 : 0)) + (item.refinement || 0) * 1;
        }
      });
      const playerDef = calcPlayerDef(currentChar, totalDef);
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
  }, [enemy.attackSpeed, enemy.name, currentZoneId, addLog]);

  useEffect(() => {
    const id = setInterval(() => {
      townHealingRef.current();
    }, 3000);
    return () => clearInterval(id);
  }, []);

  const travelToZone = useCallback((zoneId: number) => {
    const targetZone = ZONES.find((z) => z.id === zoneId);
    if (!targetZone || !unlockedZoneIds.includes(zoneId)) {
      addLog("❌ Zone locked!");
      return;
    }
    setCurrentZoneId(zoneId);
    setEnemy(getRandomEnemyForZone(zoneId, char.level));
    addLog(`🚀 Traveled to: ${targetZone.name}!`);
  }, [addLog, char.level, unlockedZoneIds]);

  const challengeBoss = useCallback(() => {
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
  }, [addLog, char.level, currentZoneId]);

  const equipItem = useCallback((item: Equipment) => {
    if (item.type === "accessory") {
      setEquipped((prev) => {
        if (!prev.accessory1) {
          setInventory(inv => inv.filter((i) => i.id !== item.id));
          return { ...prev, accessory1: item };
        } else if (!prev.accessory2) {
          setInventory(inv => inv.filter((i) => i.id !== item.id));
          return { ...prev, accessory2: item };
        } else {
          const oldItem = prev.accessory1;
          setInventory(inv => [...inv.filter((i) => i.id !== item.id), oldItem]);
          return { ...prev, accessory1: item };
        }
      });
    } else {
      setEquipped((prev) => {
        const oldItem = prev[item.type as keyof EquippedItems];
        if (oldItem) {
          setInventory(inv => [...inv.filter((i) => i.id !== item.id), oldItem]);
        } else {
          setInventory(inv => inv.filter((i) => i.id !== item.id));
        }
        return { ...prev, [item.type]: item };
      });
    }
    
    addLog(`⚔️ Equipped ${item.name}!`);
  }, [addLog]);

  const sellItem = useCallback(() => {
    setInventory(prev => {
      if (prev.length === 0) {
        addLog("❌ Inventory empty!");
        return prev;
      }
      const item = prev[0];
      const sellPrice = (item.atk || item.def || item.stat || 1) * 2;
      setChar(c => ({ ...c, gold: c.gold + sellPrice }));
      addLog(`💰 Sold ${item.name} for ${sellPrice}g.`);
      return prev.slice(1);
    });
  }, [addLog]);

  const refineItem = useCallback((item: Equipment, isEquipped: boolean, slotKey?: keyof EquippedItems): RefineResult | void => {
    if (currentZoneId !== 0) {
      addLog("❌ You can only refine in Town!");
      return { success: false, broken: false, message: "Must be in town!" };
    }
    
    if (item.type === "accessory") {
      addLog("❌ Accessories cannot be refined.");
      return { success: false, broken: false, message: "Cannot refine accessories!" };
    }

    const isWeapon = item.type === "weapon";
    const materialCost = 1;
    const hasMaterial = isWeapon ? char.oridecon >= materialCost : char.elunium >= materialCost;
    
    if (!hasMaterial) {
      addLog(`❌ Not enough ${isWeapon ? "Oridecon" : "Elunium"}!`);
      return { success: false, broken: false, message: `Need ${isWeapon ? "Oridecon" : "Elunium"}!` };
    }

    const currentRefine = item.refinement || 0;
    if (currentRefine >= 10) {
      addLog("❌ Item is already at maximum refinement (+10)!");
      return { success: false, broken: false, message: "Item is MAX level!" };
    }

    const goldCost = 500 * (currentRefine + 1);
    if (char.gold < goldCost) {
      addLog(`❌ Need ${goldCost}g to refine!`);
      return { success: false, broken: false, message: `Need ${goldCost}g!` };
    }

    let successChance = 100;
    if (currentRefine >= 4) {
      const rates: Record<number, number> = {
        4: 60,
        5: 50,
        6: 40,
        7: 30,
        8: 20,
        9: 10
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
        if (isEquipped && slotKey) {
          setEquipped(prev => ({ ...prev, [slotKey]: null }));
        } else {
          setInventory(prev => prev.filter(i => i.id !== item.id));
        }
        addLog(`💥 FAILED! ${item.name} broke into pieces...`);
        return { success: false, broken: true, message: `💥 FAILED! ${item.name} was destroyed!` };
      } else {
        addLog(`❌ FAILED! Refinement unsuccessful.`);
        return { success: false, broken: false, message: `❌ FAILED! Refinement unsuccessful.` };
      }
    }
  }, [addLog, char.elunium, char.gold, char.oridecon, currentZoneId]);

  const buyHpPotion = useCallback((amount: number = 1) => {
    if (currentZoneId !== 0) {
      addLog("❌ You can only buy potions in Town!");
      return;
    }
    
    const totalCost = HP_POTION_COST * amount;
    setChar(prev => {
      if (prev.gold >= totalCost) {
        setHpPotions(p => p + amount);
        addLog(`🍖 +${amount} HP Pot${amount > 1 ? 's' : ''} (${totalCost}g)`);
        return { ...prev, gold: prev.gold - totalCost };
      } else {
        addLog(`❌ Need ${totalCost}g!`);
        return prev;
      }
    });
  }, [addLog, currentZoneId]);

  const buyMpPotion = useCallback((amount: number = 1) => {
    if (currentZoneId !== 0) {
      addLog("❌ You can only buy potions in Town!");
      return;
    }
    
    const totalCost = MP_POTION_COST * amount;
    setChar(prev => {
      if (prev.gold >= totalCost) {
        setMpPotions(p => p + amount);
        addLog(`🧪 +${amount} MP Pot${amount > 1 ? 's' : ''} (${totalCost}g)`);
        return { ...prev, gold: prev.gold - totalCost };
      } else {
        addLog(`❌ Need ${totalCost}g!`);
        return prev;
      }
    });
  }, [addLog, currentZoneId]);

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
    refineItem,
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
