import { useState, useEffect, useRef, useMemo } from "react";
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
  STARTING_WAND
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
} from "../logic/loot";
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

// Track active debuffs on the enemy (e.g. Provoke)
interface ActiveDebuff {
  id: string;
  expiresAt: number;
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
  });

  const [enemy, setEnemy] = useState<Enemy>(() =>
    getRandomEnemyForZone(0, 1)
  );

  const [inventory, setInventory] = useState<Equipment[]>([]);
  
  const [equipped, setEquipped] = useState<EquippedItems>({
    weapon: STARTING_WEAPON,
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

  const [lastAttackTime, setLastAttackTime] = useState<number>(0);
  const [canAttack, setCanAttack] = useState<boolean>(true);
  const [attackCooldownPercent, setAttackCooldownPercent] = useState<number>(100);
  
  const [autoAttackEnabled, setAutoAttackEnabled] = useState<boolean>(false);

  const enemyAttackTimerRef = useRef<number | null>(null);
  const autoPotionTimerRef = useRef<number | null>(null);
  const isMountedRef = useRef<boolean>(true);
  const lastPotionCheckRef = useRef<number>(0);
  const lastAutoPotionTimeRef = useRef<number>(0);

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

  const equipStats = useMemo(() => calculateEquipmentStats(equipped), [equipped]);
  const armorBonus = equipStats.totalDef;
  const mdefBonus = equipStats.totalMdef;
  
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
  }, [char.stats.agi, char.stats.dex, char.level, char.learnedSkills, equipStats]);

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
    
    if (canChangeJob(char.jobClass, jobLevelUpResult.newJobLevel) && (jobLevelUpResult.newJobLevel === 10 || jobLevelUpResult.newJobLevel === 20)) {
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

    if (skill.effect === "buff") {
      addLog("❌ Cannot set passive/buff skill as default attack!");
      return;
    }

    setChar((prev) => ({
      ...prev,
      autoAttackSkillId: skillId,
    }));

    addLog(`⭐ Primary skill set to: ${skill.nameZh}`);
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

    // FIX: Wizard-specific - auto-learn Energy Coat passive
    if (newJob === "Wizard") {
      initialSkills["energy_coat"] = 1;
    }

    const firstAttackSkill = newJobSkills.find(s => s.id !== "basic_attack" && s.effect !== "buff");

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
      addLog(`⭐ ${firstAttackSkill.nameZh} is now your default skill.`);
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

  function processAutoPotion() {
    const currentChar = charRef.current;
    const currentHpPotions = hpPotionsRef.current;
    const currentMpPotions = mpPotionsRef.current;
    const currentAutoHpPercent = autoHpPercentRef.current;
    const currentAutoMpPercent = autoMpPercentRef.current;
    
    if (currentChar.hp <= 0) return;
    
    // FIX: Add 3-second cooldown between auto-potion uses
    const now = Date.now();
    const timeSinceLastPotion = (now - lastAutoPotionTimeRef.current) / 1000;
    
    if (timeSinceLastPotion < 3) return;
    
    if (currentAutoHpPercent > 0 && currentHpPotions > 0) {
      const hpPercentage = (currentChar.hp / currentChar.maxHp) * 100;
      if (hpPercentage < currentAutoHpPercent && hpPercentage < 100) {
        useHpPotion();
        lastAutoPotionTimeRef.current = now;
        return;
      }
    }
    
    if (currentAutoMpPercent > 0 && currentMpPotions > 0) {
      const mpPercentage = (currentChar.mp / currentChar.maxMp) * 100;
      if (mpPercentage < currentAutoMpPercent && mpPercentage < 100) {
        useMpPotion();
        lastAutoPotionTimeRef.current = now;
      }
    }
  }
  
  autoPotionRef.current = processAutoPotion;

  // Cleanup expired debuffs
  useEffect(() => {
    if (activeDebuffs.length === 0) return;
    const now = Date.now();
    if (activeDebuffs.some(d => now > d.expiresAt)) {
      setActiveDebuffs(prev => prev.filter(d => now <= d.expiresAt));
    }
  }, [lastAttackTime, activeDebuffs]);

  function battleAction(skillId?: string) {
    if (!isMountedRef.current) return;
    if (char.hp <= 0) return;
    if (currentZoneId === 0) return;
    
    if (!canAttack) return;

    const now = Date.now();

    // 1. BUFF/DEBUFF PHASE (e.g. Provoke)
    // Check if we have an active debuff skill that isn't on cooldown and the enemy doesn't already have it
    if (char.learnedSkills["provoke"] > 0) {
      const provokeCD = SKILLS_DB[char.jobClass].find(s => s.id === "provoke")?.cooldown || 2;
      const provokeLastUsed = skillCooldowns["provoke"] || 0;
      const provokeReady = (now - provokeLastUsed) / 1000 >= provokeCD;
      
      // Check if enemy already has provoke debuff active
      const hasProvoke = activeDebuffs.some(d => d.id === "provoke" && now <= d.expiresAt);
      
      if (provokeReady && !hasProvoke && char.mp >= 5) { // Provoke MP cost is 5
        setChar(prev => ({ ...prev, mp: prev.mp - 5 }));
        setSkillCooldowns(prev => ({ ...prev, ["provoke"]: now }));
        setActiveDebuffs(prev => [...prev, { id: "provoke", expiresAt: now + 10000 }]); // 10s duration
        
        addLog(`📢 Used Provoke! Enemy DEF reduced for 10s.`);
        setLastAttackTime(now);
        setCanAttack(false);
        setAttackCooldownPercent(0);
        return; // Spend this turn applying the debuff
      }
    }

    // 2. SMART SKILL ROTATION PHASE
    let actualSkillId = skillId || char.autoAttackSkillId;
    let skillLevel = char.learnedSkills[actualSkillId] || 0;
    let skill = SKILLS_DB[char.jobClass].find((s) => s.id === actualSkillId);

    // Initial validation
    if (!skill || skillLevel === 0 || skill.effect === "buff") {
      actualSkillId = "basic_attack";
      skillLevel = char.learnedSkills["basic_attack"] || 1;
      skill = SKILLS_DB[char.jobClass].find((s) => s.id === "basic_attack")!;
    }
    
    let isSkillOnCooldown = false;
    if (skill.cooldown > 0) {
      const lastUsed = skillCooldowns[actualSkillId] || 0;
      if ((now - lastUsed) / 1000 < skill.cooldown) {
        isSkillOnCooldown = true;
      }
    }

    let mpCost = skill.mpCost(skillLevel);
    let isMpInsufficient = char.mp < mpCost;

    // Smart Rotation: If primary is unavailable, look for the next best skill
    if ((isSkillOnCooldown || isMpInsufficient) && actualSkillId !== "basic_attack") {
      // Find all learned active skills (not buff, not basic attack, not primary)
      const availableSkills = SKILLS_DB[char.jobClass]
        .filter(s => s.id !== "basic_attack" && s.id !== actualSkillId && s.effect !== "buff")
        .filter(s => {
          const lvl = char.learnedSkills[s.id] || 0;
          if (lvl === 0) return false;
          
          // Check CD
          if (s.cooldown > 0) {
            const lu = skillCooldowns[s.id] || 0;
            if ((now - lu) / 1000 < s.cooldown) return false;
          }
          
          // Check MP
          if (char.mp < s.mpCost(lvl)) return false;
          
          return true;
        })
        // Sort by highest damage multiplier (greedy prioritization)
        .sort((a, b) => {
          const lvlA = char.learnedSkills[a.id];
          const lvlB = char.learnedSkills[b.id];
          return b.damageMultiplier(lvlB) - a.damageMultiplier(lvlA);
        });

      if (availableSkills.length > 0) {
        // Use the next best skill in rotation!
        skill = availableSkills[0];
        actualSkillId = skill.id;
        skillLevel = char.learnedSkills[skill.id];
        mpCost = skill.mpCost(skillLevel);
      } else {
        // Fallback to basic attack if all skills are on CD/Out of MP
        actualSkillId = "basic_attack";
        skillLevel = char.learnedSkills["basic_attack"] || 1;
        skill = SKILLS_DB[char.jobClass].find((s) => s.id === "basic_attack")!;
        mpCost = skill.mpCost(skillLevel);
        isMpInsufficient = char.mp < mpCost;
      }
    }

    // If even basic attack can't be used (e.g. somehow out of MP for it), regenerate MP
    if (isMpInsufficient) {
      setLastAttackTime(now);
      setCanAttack(false);
      setAttackCooldownPercent(0);
      
      const mpRegen = Math.floor(char.maxMp * 0.05) + 1;
      const newMp = Math.min(char.maxMp, char.mp + mpRegen);
      if (newMp > char.mp) {
        setChar((prev) => ({ ...prev, mp: newMp }));
      }
      return;
    }

    // Proceed with attack
    if (skill.cooldown > 0 && actualSkillId !== "basic_attack") {
      setSkillCooldowns((prev) => ({ ...prev, [actualSkillId]: now }));
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
    
    let nextCharElunium = char.elunium;
    let nextCharOridecon = char.oridecon;
    
    let didLevelUp = false;

    let nextEnemyHp = enemy.hp;
    let nextEnemy = enemy;

    // Apply Provoke Debuff logic temporarily to enemy
    const hasProvoke = activeDebuffs.some(d => d.id === "provoke" && now <= d.expiresAt);
    let combatEnemy = enemy;
    if (hasProvoke) {
      const provokeLvl = char.learnedSkills["provoke"] || 1;
      const defReduction = 0.20 + (provokeLvl * 0.05); // 25% - 45% DEF reduction
      combatEnemy = {
        ...enemy,
        softDef: Math.floor(enemy.softDef * (1 - defReduction)),
        hardDefPercent: Math.floor(enemy.hardDefPercent * (1 - defReduction))
      };
    }

    const { damage, isCrit, isAOE } = calculateDamage(
      char,
      combatEnemy, // Use the potentially debuffed enemy
      skill,
      skillLevel,
      equipped
    );
    nextEnemyHp = enemy.hp - damage;

    callbacks?.onDamageDealt?.(damage, isCrit);

    const critText = isCrit ? " ❗CRIT!" : "";
    const aoeText = isAOE ? " 🔥 AOE BONUS!" : "";
    addLog(
      `🎯 ${skill.nameZh} Lv.${skillLevel}: Hit ${enemy.name} for ${damage} dmg.${critText}${aoeText} (MP-${mpCost})`
    );

    let nextJobLevel = char.jobLevel;
    let nextJobExp = char.jobExp;
    let nextJobExpToNext = char.jobExpToNext;
    let nextSkillPoints = char.skillPoints;

    if (nextEnemyHp <= 0) {
      const enemyCount = enemy.count || 1;
      const isGroup = enemyCount > 1;
      
      if (isGroup) {
        addLog(`💀 Defeated ${enemyCount}x ${enemy.name}!`);
      } else {
        addLog(`💀 ${enemy.name} defeated!`);
      }

      const baseGoldGain = calculateGoldGain(enemy);
      const goldGain = baseGoldGain * enemyCount;
      nextCharGold += goldGain;
      addLog(`💰 Gained ${goldGain} Gold${isGroup ? ` (${baseGoldGain} × ${enemyCount})` : ''}.`);

      callbacks?.onEnemyKilled?.(isBossFight, goldGain);

      const baseExpGain = calculateExpGain(enemy);
      const expGain = baseExpGain * enemyCount;
      const levelUpResult = processLevelUp(char, expGain);
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
        callbacks?.onLevelUp?.(nextCharLevel);
      }

      const baseJobExpGain = calculateJobExpGain(enemy, char.jobLevel);
      const jobExpGain = baseJobExpGain * enemyCount;
      const jobLevelUpResult = processJobLevelUp(char, jobExpGain);
      nextJobExp = jobLevelUpResult.newJobExp;
      nextJobLevel = jobLevelUpResult.newJobLevel;
      nextJobExpToNext = jobLevelUpResult.newJobExpToNext;
      nextSkillPoints = jobLevelUpResult.newSkillPoints;

      addLog(`✨ Gained ${jobExpGain} Job EXP${isGroup ? ` (${baseJobExpGain} × ${enemyCount})` : ''}.`);

      if (jobLevelUpResult.leveledUp) {
        addLog(
          `📘 JOB LEVEL UP! Job Lv.${nextJobLevel} (Skill Points +1)`
        );
        callbacks?.onJobLevelUp?.(nextJobLevel);
        
        if (canChangeJob(char.jobClass, nextJobLevel) && (nextJobLevel === 10 || nextJobLevel === 20)) {
          addLog(`🎊 You can now change your job! Talk to the Job Change Master!`);
        }
      }

      // Reset debuffs on new enemy
      setActiveDebuffs([]);

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

        const numElu = Math.floor(Math.random() * 2) + 1;
        const numOri = Math.floor(Math.random() * 2) + 1;
        nextCharElunium += numElu;
        nextCharOridecon += numOri;
        addLog(`💎 Boss Drop: ${numElu}x Elunium, ${numOri}x Oridecon!`);
        callbacks?.onMaterialDrop?.('elunium', numElu);
        callbacks?.onMaterialDrop?.('oridecon', numOri);

        nextEnemy = getRandomEnemyForZone(currentZoneId, nextCharLevel);
        addLog(`👾 A wild ${nextEnemy.name} appeared!`);
      } else {
        const nextKillCount = killCount + 1;
        setKillCount(nextKillCount);

        if (nextKillCount % KILLS_FOR_BOSS === 0) {
          setBossAvailable(true);
          addLog(`⚔️ Boss is ready! Click the button to challenge!`);
        }

        if (isGroup) {
          for (let i = 0; i < enemyCount; i++) {
            if (shouldDropLoot()) {
              const newGear = generateLoot(nextCharLevel);
              setInventory((prev) => [...prev, newGear]);
              addLog(`🎁 Looted: ${newGear.name}!`);
              callbacks?.onItemDrop?.(newGear);
            }
          }
        } else {
          if (shouldDropLoot()) {
            const newGear = generateLoot(nextCharLevel);
            setInventory((prev) => [...prev, newGear]);
            addLog(`🎁 Looted: ${newGear.name}!`);
            callbacks?.onItemDrop?.(newGear);
          }
        }

        for (let i = 0; i < enemyCount; i++) {
          const matRoll = Math.random();
          if (matRoll < 0.08) {
            nextCharElunium += 1;
            addLog(`💎 Looted: 1x Elunium!`);
            callbacks?.onMaterialDrop?.('elunium', 1);
          } else if (matRoll < 0.14) {
            nextCharOridecon += 1;
            addLog(`💎 Looted: 1x Oridecon!`);
            callbacks?.onMaterialDrop?.('oridecon', 1);
          }
        }

        nextEnemy = getRandomEnemyForZone(currentZoneId, nextCharLevel);
        const nextEnemyCount = nextEnemy.count || 1;
        if (nextEnemyCount > 1) {
          addLog(`👾 A group of ${nextEnemyCount}x ${nextEnemy.name} appeared!`);
        } else {
          addLog(`👾 A wild ${nextEnemy.name} appeared!`);
        }
      }
    } else {
      nextEnemy = { ...enemy, hp: nextEnemyHp };
    }

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
      elunium: nextCharElunium,
      oridecon: nextCharOridecon,
    });

    setEnemy(nextEnemy);
  }

  const battleActionRef = useRef(battleAction);
  
  useEffect(() => {
    battleActionRef.current = battleAction;
  }, [char, enemy, equipped, currentZoneId, canAttack, skillCooldowns, activeDebuffs, killCount, isBossFight]);

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

    if (autoHpPercent === 0 && autoMpPercent === 0) return;
    if (currentZoneId === 0) return;

    autoPotionTimerRef.current = window.setInterval(() => {
      autoPotionRef.current();
    }, 1000) as unknown as number;

    return () => {
      if (autoPotionTimerRef.current !== null) {
        clearInterval(autoPotionTimerRef.current);
      }
    };
  }, [currentZoneId, autoHpPercent, autoMpPercent]);

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

      const equipStats = calculateEquipmentStats(currentEquipped);
      const playerDef = calcPlayerDef(currentChar, equipStats.totalDef, equipStats.totalMdef);
      const { hpDamage, mpDamage } = calculateEnemyDamage(currentEnemy, playerDef, currentChar);

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
        } else {
          addLog(`💀 You were defeated by ${currentEnemy.name}!`);
          setShowDeathModal(true);
        }
        
        return { ...prev, hp: newHp, mp: newMp };
      });
    }, enemyAttackDelayMs) as unknown as number;

    return () => {
      if (enemyAttackTimerRef.current !== null) {
        clearInterval(enemyAttackTimerRef.current);
      }
    };
  }, [enemy.attackSpeed, enemy.name, currentZoneId, armorBonus, mdefBonus]);

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
    setEnemy(getRandomEnemyForZone(zoneId, char.level));
    setActiveDebuffs([]);
    addLog(`🚀 Traveled to: ${targetZone.name}!`);
  }

  function challengeBoss() {
    setIsBossFight(true);
    const bossTemplate = getRandomEnemyForZone(currentZoneId, char.level);
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
      isBoss: true, // FIX: Set explicit boss flag
    };
    setEnemy(bossEnemy);
    setBossAvailable(false);
    setActiveDebuffs([]);
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
        
        const heal = Math.floor(prevChar.maxHp * HP_POTION_HEAL_PERCENT) + HP_POTION_HEAL_FLAT;
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
    devAddBaseLevel,
    devAddJobLevel,
    devAddGold,
    devAddPotions,
    devFullHeal,
    devAddGear,
    devUnlockAllZones,
  };
}
