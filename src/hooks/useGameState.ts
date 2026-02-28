import { useState, useEffect, useRef } from "react";
import { Character, CharacterStats } from "../types/character";
import { Enemy } from "../types/enemy";
import { Equipment, EquippedItems } from "../types/equipment";
import { getRandomEnemyForZone, ZONES } from "../data/zones";
import { SKILLS_DB } from "../data/skills";
import { JobClass, canChangeJob, getJobBonuses } from "../data/jobs";
import {
  calculateDamage,
  calculateEnemyDamage,
  isMagicSkill,
} from "../logic/combat";
import { calcPlayerDef, calcMaxHp, calcMaxMp } from "../logic/character";
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
  AUTO_ATTACK_INTERVAL,
} from "../data/constants";

export function useGameState(addLog: (text: string) => void) {
  const [char, setChar] = useState<Character>({
    level: 1,
    exp: 0,
    expToNext: 100,
    hp: 100,
    maxHp: 100,
    mp: 50,
    maxMp: 50,
    gold: 0,
    stats: { str: 5, agi: 1, vit: 1, int: 1, dex: 1, luk: 1 },
    statPoints: 5,
    jobClass: "Novice",
    jobLevel: 1,
    jobExp: 0,
    jobExpToNext: 50,
    skillPoints: 3,
    learnedSkills: { basic_attack: 1 },
    autoAttackSkillId: "basic_attack",
  });

  const [enemy, setEnemy] = useState<Enemy>(() =>
    getRandomEnemyForZone(1, 1)
  );

  const [inventory, setInventory] = useState<Equipment[]>([]);
  const [equipped, setEquipped] = useState<EquippedItems>({
    weapon: null,
    armor: null,
  });

  const [currentZoneId, setCurrentZoneId] = useState<number>(1);
  const [unlockedZoneIds, setUnlockedZoneIds] = useState<number[]>([0, 1]); // 0 is town, 1 is zone1
  const [killCount, setKillCount] = useState<number>(0);
  const [bossAvailable, setBossAvailable] = useState<boolean>(false);
  const [bossDefeated, setBossDefeated] = useState<boolean>(false);
  const [isBossFight, setIsBossFight] = useState<boolean>(false);

  const [hpPotions, setHpPotions] = useState<number>(1);
  const [mpPotions, setMpPotions] = useState<number>(1);
  const [autoHpPercent, setAutoHpPercent] = useState<number>(0); // 0 means OFF
  const [autoMpPercent, setAutoMpPercent] = useState<number>(0); // 0 means OFF

  const [showSkillWindow, setShowSkillWindow] = useState<boolean>(false);
  const [showJobChangeNPC, setShowJobChangeNPC] = useState<boolean>(false);
  const [showDeathModal, setShowDeathModal] = useState<boolean>(false);
  const [skillCooldowns, setSkillCooldowns] = useState<Record<string, number>>(
    {}
  );

  const battleActionRef = useRef<(skillId?: string) => void>(() => {});
  const townHealingRef = useRef<() => void>(() => {});
  const autoPotionRef = useRef<() => void>(() => {});

  function addStat(stat: keyof CharacterStats) {
    if (char.statPoints <= 0) {
      addLog("❌ No stat points!");
      return;
    }
    setChar((prev) => ({
      ...prev,
      stats: { ...prev.stats, [stat]: prev.stats[stat] + 1 },
      statPoints: prev.statPoints - 1,
    }));
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

    addLog(`⭐ Auto-attack set to: ${skill.nameZh}`);
  }

  function handleJobChange(newJob: JobClass) {
    const jobBonuses = getJobBonuses(newJob);
    
    // Calculate total stat points earned from previous levels
    const totalStatPoints =
      char.stats.str +
      char.stats.agi +
      char.stats.vit +
      char.stats.int +
      char.stats.dex +
      char.stats.luk +
      char.statPoints -
      10; // Minus novice starting stats (5 STR + 1 each = 10)

    // Reset to level 1 with 15 base stat points + earned points from leveling
    const newLevel = 1;
    const baseStatPoints = 15 + totalStatPoints; // Start with 15 points as per Option 2

    // Get skills for new job (always include basic_attack)
    const newJobSkills = SKILLS_DB[newJob];
    
    // Always keep basic_attack + add first job skill if it exists
    const initialSkills: Record<string, number> = { basic_attack: 1 };
    
    // Find the first actual skill (not basic_attack) for the new job
    const firstJobSkill = newJobSkills.find(s => s.id !== "basic_attack");
    if (firstJobSkill) {
      initialSkills[firstJobSkill.id] = 1;
    }

    // Calculate new HP/MP with job bonuses
    const baseHp = calcMaxHp(newLevel, 1);
    const baseMp = calcMaxMp(newLevel, 1);
    const newMaxHp = Math.floor(baseHp * jobBonuses.hpMultiplier);
    const newMaxMp = Math.floor(baseMp * jobBonuses.mpMultiplier);

    setChar({
      level: newLevel,
      exp: 0,
      expToNext: 100,
      hp: newMaxHp,
      maxHp: newMaxHp,
      mp: newMaxMp,
      maxMp: newMaxMp,
      gold: char.gold, // Keep gold
      stats: { str: 1, agi: 1, vit: 1, int: 1, dex: 1, luk: 1 },
      statPoints: baseStatPoints,
      jobClass: newJob,
      jobLevel: 1,
      jobExp: 0,
      jobExpToNext: 50,
      skillPoints: 3, // Starting skill points
      learnedSkills: initialSkills,
      autoAttackSkillId: firstJobSkill ? firstJobSkill.id : "basic_attack",
    });

    addLog(`🎉 Congratulations! You are now a ${newJob}!`);
    addLog(`📋 Stats reset. You have ${baseStatPoints} stat points to distribute!`);
    if (firstJobSkill) {
      addLog(`📖 You learned ${firstJobSkill.nameZh}! It's now your auto-attack skill.`);
    }
    addLog(`🛡️ Job Bonuses: HP ${Math.floor((jobBonuses.hpMultiplier - 1) * 100)}%, MP ${Math.floor((jobBonuses.mpMultiplier - 1) * 100)}%, +${jobBonuses.atkBonus} ATK, +${jobBonuses.defBonus} DEF`);
    setShowJobChangeNPC(false);
  }

  function openJobChangeNPC() {
    setShowJobChangeNPC(true);
  }

  function handleRespawn() {
    // Restore 50% HP and MP
    const respawnHp = Math.floor(char.maxHp * 0.5);
    const respawnMp = Math.floor(char.maxMp * 0.5);
    
    setChar((prev) => ({
      ...prev,
      hp: respawnHp,
      mp: respawnMp,
    }));
    
    // Reset combat states
    setKillCount(0);
    setIsBossFight(false);
    setBossAvailable(false);
    setShowDeathModal(false);
    
    // Teleport to town (Zone 0)
    setCurrentZoneId(0);
    setEnemy(getRandomEnemyForZone(0, char.level));
    
    addLog("❤️‍🩹 Respawned in Town! Resting will recover HP/MP.");
  }

  function escapeToTown() {
    if (currentZoneId === 0) {
      addLog("ℹ️ You are already in town!");
      return;
    }
    
    // Reset combat states
    setKillCount(0);
    setIsBossFight(false);
    setBossAvailable(false);
    
    // Teleport to town (Zone 0)
    setCurrentZoneId(0);
    setEnemy(getRandomEnemyForZone(0, char.level));
    
    addLog("🏛️ Escaped to Town safely!");
  }

  // Town healing logic
  function processTownHealing() {
    if (currentZoneId === 0 && (char.hp < char.maxHp || char.mp < char.maxMp) && char.hp > 0) {
      const healHp = Math.floor(char.maxHp * 0.1); // 10% per tick
      const healMp = Math.floor(char.maxMp * 0.1); // 10% per tick
      
      setChar(prev => {
        const newHp = Math.min(prev.maxHp, prev.hp + healHp);
        const newMp = Math.min(prev.maxMp, prev.mp + healMp);
        
        // Only log if we actually healed
        if (newHp > prev.hp || newMp > prev.mp) {
          addLog(`✨ Town Healing: +${newHp - prev.hp} HP, +${newMp - prev.mp} MP`);
        }
        
        return { ...prev, hp: newHp, mp: newMp };
      });
    }
  }
  
  townHealingRef.current = processTownHealing;

  // Auto-potion logic
  function processAutoPotion() {
    if (char.hp <= 0) return; // Don't use potions if dead
    
    // Auto HP Potion
    if (autoHpPercent > 0 && hpPotions > 0) {
      const hpPercentage = (char.hp / char.maxHp) * 100;
      if (hpPercentage < autoHpPercent && hpPercentage < 100) {
        useHpPotion();
      }
    }
    
    // Auto MP Potion
    if (autoMpPercent > 0 && mpPotions > 0) {
      const mpPercentage = (char.mp / char.maxMp) * 100;
      if (mpPercentage < autoMpPercent && mpPercentage < 100) {
        useMpPotion();
      }
    }
  }
  
  autoPotionRef.current = processAutoPotion;

  function battleAction(skillId?: string) {
    // Don't allow actions if dead or in town
    if (char.hp <= 0) return;
    if (currentZoneId === 0) {
      // In town, we just heal
      townHealingRef.current();
      return;
    }

    // Check auto-potions before battle
    autoPotionRef.current();

    const weaponBonus = equipped.weapon?.stat || 0;
    const armorBonus = equipped.armor?.stat || 0;

    // Use specified skill, or auto-attack skill if none specified
    const actualSkillId = skillId || char.autoAttackSkillId;
    const skillLevel = char.learnedSkills[actualSkillId] || 0;

    if (skillLevel === 0) {
      addLog("❌ Skill not learned!");
      return;
    }

    // Get skill from current job skills
    const skill = SKILLS_DB[char.jobClass].find((s) => s.id === actualSkillId);

    if (!skill) {
      addLog("❌ Skill not found!");
      return;
    }

    const now = Date.now();
    const lastUsed = skillCooldowns[actualSkillId] || 0;
    const timePassed = (now - lastUsed) / 1000;

    if (timePassed < skill.cooldown) {
      const remaining = (skill.cooldown - timePassed).toFixed(1);
      addLog(`⏳ ${skill.nameZh} on cooldown (${remaining}s)`);
      return;
    }

    const mpCost = skill.mpCost(skillLevel);
    if (char.mp < mpCost) {
      const mpRegen = Math.floor(char.maxMp * 0.1) + 5;
      const newMp = Math.min(char.maxMp, char.mp + mpRegen);
      setChar((prev) => ({ ...prev, mp: newMp }));
      addLog(`💤 Too low MP! Resting... Recovered ${mpRegen} MP.`);
      return;
    }

    setSkillCooldowns((prev) => ({ ...prev, [actualSkillId]: now }));

    let nextCharHp = char.hp;
    let nextCharMp = char.mp - mpCost;
    let nextCharExp = char.exp;
    let nextCharLevel = char.level;
    let nextCharExpToNext = char.expToNext;
    let nextCharGold = char.gold;
    let nextCharStats = { ...char.stats };
    let nextStatPoints = char.statPoints;

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
        addLog(`🌟 LEVEL UP! Now Lv.${nextCharLevel} (Stat Points +3)`);
      }

      const jobExpGain = calculateJobExpGain(enemy);
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
        
        // Check if can change job now
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
        }

        nextEnemy = getRandomEnemyForZone(currentZoneId, nextCharLevel);
        addLog(`👾 A wild ${nextEnemy.name} appeared!`);
      }
    } else {
      const playerDef = calcPlayerDef(char, armorBonus);
      const enemyDmg = calculateEnemyDamage(enemy, playerDef);

      nextCharHp -= enemyDmg;
      addLog(`💥 ${enemy.name} counter-attacks! You take ${enemyDmg} dmg.`);

      nextEnemy = { ...enemy, hp: nextEnemyHp };

      if (nextCharHp <= 0) {
        nextCharHp = 0;
        addLog(`💀 You were defeated by ${enemy.name}!`);
        setShowDeathModal(true);
      }
    }

    setChar({
      hp: nextCharHp,
      maxHp: calcMaxHp(nextCharLevel, nextCharStats.vit),
      mp: nextCharMp,
      maxMp: calcMaxMp(nextCharLevel, nextCharStats.int),
      level: nextCharLevel,
      exp: nextCharExp,
      expToNext: nextCharExpToNext,
      gold: nextCharGold,
      stats: nextCharStats,
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

  battleActionRef.current = battleAction;

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

  function useHpPotion() {
    if (hpPotions > 0 && char.hp < char.maxHp) {
      const heal = Math.floor(char.maxHp * HP_POTION_HEAL_PERCENT);
      setChar((prev) => ({
        ...prev,
        hp: Math.min(prev.maxHp, prev.hp + heal),
      }));
      setHpPotions((prev) => prev - 1);
      addLog(`🍖 +${heal} HP.`);
    } else if (hpPotions === 0) {
      addLog("❌ No HP Pots!");
    } else {
      addLog("❤️ HP Full!");
    }
  }

  function useMpPotion() {
    if (mpPotions > 0 && char.mp < char.maxMp) {
      const recover = Math.floor(char.maxMp * MP_POTION_RECOVER_PERCENT);
      setChar((prev) => ({
        ...prev,
        mp: Math.min(prev.maxMp, prev.mp + recover),
      }));
      setMpPotions((prev) => prev - 1);
      addLog(`🧪 +${recover} MP.`);
    } else if (mpPotions === 0) {
      addLog("❌ No MP Pots!");
    } else {
      addLog("💙 MP Full!");
    }
  }

  useEffect(() => {
    const id = setInterval(() => {
      // Auto-attack uses no skill parameter, which uses char.autoAttackSkillId
      battleActionRef.current();
    }, AUTO_ATTACK_INTERVAL);
    return () => clearInterval(id);
  }, []);

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
    setShowSkillWindow,
    setShowJobChangeNPC,
    setAutoHpPercent,
    setAutoMpPercent,
    addStat,
    learnSkill,
    setAutoAttackSkill,
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
  };
}
