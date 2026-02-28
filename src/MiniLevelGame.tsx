import { useState, useEffect, useRef } from "react";

type JobClass = "Novice" | "Swordsman" | "Mage" | "Archer";

// --- 技能定義 ---
interface Skill {
  id: string;
  name: string;
  nameZh: string;
  maxLevel: number;
  mpCost: (level: number) => number;
  description: string;
  damageMultiplier: (level: number) => number;
  cooldown: number; // 秒
  effect?: "stun" | "dot" | "heal" | "buff"; // 未來擴充用
}

// 各職業技能資料庫
const SKILLS_DB: Record<JobClass, Skill[]> = {
  Novice: [
    {
      id: "basic_attack",
      name: "Basic Attack",
      nameZh: "普通攻擊",
      maxLevel: 1,
      mpCost: () => 2,
      description: "基本攻擊",
      damageMultiplier: () => 1.0,
      cooldown: 0,
    },
  ],
  Swordsman: [
    {
      id: "bash",
      name: "Bash",
      nameZh: "強力攻擊",
      maxLevel: 10,
      mpCost: (lv) => 8 + lv,
      description: "單體物理重擊，傷害隨等級提升",
      damageMultiplier: (lv) => 1.3 + lv * 0.1,
      cooldown: 1,
    },
    {
      id: "magnum_break",
      name: "Magnum Break",
      nameZh: "爆裂波動",
      maxLevel: 10,
      mpCost: (lv) => 15 + lv * 2,
      description: "範圍火屬性攻擊",
      damageMultiplier: (lv) => 1.5 + lv * 0.15,
      cooldown: 3,
    },
    {
      id: "provoke",
      name: "Provoke",
      nameZh: "挑釁",
      maxLevel: 5,
      mpCost: () => 5,
      description: "降低敵人防禦",
      damageMultiplier: () => 0,
      cooldown: 2,
      effect: "buff",
    },
  ],
  Mage: [
    {
      id: "fire_bolt",
      name: "Fire Bolt",
      nameZh: "火焰彈",
      maxLevel: 10,
      mpCost: (lv) => 10 + lv * 2,
      description: "火屬性魔法攻擊",
      damageMultiplier: (lv) => 1.4 + lv * 0.2,
      cooldown: 1.5,
    },
    {
      id: "cold_bolt",
      name: "Cold Bolt",
      nameZh: "冰箭術",
      maxLevel: 10,
      mpCost: (lv) => 12 + lv * 2,
      description: "水屬性魔法攻擊",
      damageMultiplier: (lv) => 1.5 + lv * 0.2,
      cooldown: 1.5,
    },
    {
      id: "lightning_bolt",
      name: "Lightning Bolt",
      nameZh: "雷擊術",
      maxLevel: 10,
      mpCost: (lv) => 14 + lv * 2,
      description: "風屬性魔法攻擊",
      damageMultiplier: (lv) => 1.6 + lv * 0.25,
      cooldown: 2,
    },
  ],
  Archer: [
    {
      id: "double_strafe",
      name: "Double Strafe",
      nameZh: "二連矢",
      maxLevel: 10,
      mpCost: (lv) => 10 + lv,
      description: "連續射擊兩箭",
      damageMultiplier: (lv) => 1.2 + lv * 0.12,
      cooldown: 1,
    },
    {
      id: "arrow_shower",
      name: "Arrow Shower",
      nameZh: "箭雨",
      maxLevel: 10,
      mpCost: (lv) => 15 + lv * 2,
      description: "範圍攻擊",
      damageMultiplier: (lv) => 1.4 + lv * 0.15,
      cooldown: 2.5,
    },
    {
      id: "owl_eye",
      name: "Owl's Eye",
      nameZh: "鷹眼",
      maxLevel: 5,
      mpCost: () => 0,
      description: "永久增加 DEX",
      damageMultiplier: () => 0,
      cooldown: 0,
      effect: "buff",
    },
  ],
};

// --- 介面定義 ---
interface Character {
  level: number;
  exp: number;
  expToNext: number;
  hp: number;
  maxHp: number;
  mp: number;
  maxMp: number;
  gold: number;

  stats: {
    str: number;
    agi: number;
    vit: number;
    int: number;
    dex: number;
    luk: number;
  };
  statPoints: number;

  jobClass: JobClass;
  jobLevel: number;
  jobExp: number;
  jobExpToNext: number;
  skillPoints: number;

  // ✅ 新增：學習的技能
  learnedSkills: Record<string, number>; // { skillId: level }
}

interface Enemy {
  name: string;
  level: number;
  hp: number;
  maxHp: number;
  atk: number;
  def: number;
}

interface Log {
  id: number;
  text: string;
}

interface Equipment {
  id: number;
  name: string;
  type: "weapon" | "armor";
  stat: number;
  rarity: "common" | "rare" | "epic";
}

interface Zone {
  id: number;
  name: string;
  minLevel: number;
  enemies: Enemy[];
}

// 地圖資料庫
const ZONES: Zone[] = [
  {
    id: 1,
    name: "🌱 新手草原",
    minLevel: 1,
    enemies: [
      { name: "Slime", level: 1, hp: 30, maxHp: 30, atk: 5, def: 2 },
      { name: "Goblin", level: 2, hp: 50, maxHp: 50, atk: 8, def: 4 },
    ],
  },
  {
    id: 2,
    name: "🌲 黑暗森林",
    minLevel: 5,
    enemies: [
      { name: "Goblin", level: 2, hp: 50, maxHp: 50, atk: 8, def: 4 },
      { name: "Orc", level: 4, hp: 80, maxHp: 80, atk: 12, def: 6 },
      { name: "Wolf", level: 5, hp: 100, maxHp: 100, atk: 15, def: 8 },
    ],
  },
  {
    id: 3,
    name: "💀 骷髏洞穴",
    minLevel: 10,
    enemies: [
      { name: "Orc", level: 4, hp: 80, maxHp: 80, atk: 12, def: 6 },
      { name: "Skeleton", level: 8, hp: 140, maxHp: 140, atk: 18, def: 10 },
      { name: "Demon", level: 10, hp: 200, maxHp: 200, atk: 25, def: 15 },
    ],
  },
];

function getEnemyPool(zoneId: number): Enemy[] {
  const zone = ZONES.find((z) => z.id === zoneId);
  return zone ? zone.enemies : ZONES[0].enemies;
}

function getRandomEnemyForZone(zoneId: number, playerLevel: number): Enemy {
  const pool = getEnemyPool(zoneId);
  if (pool.length === 0) return { ...ZONES[0].enemies[0] };
  const random = pool[Math.floor(Math.random() * pool.length)];
  return { ...random };
}

export function MiniLevelGame() {
  // --- State 定義 ---
  const [char, setChar] = useState<Character>({
    level: 1,
    exp: 0,
    expToNext: 100,
    hp: 100,
    maxHp: 100,
    mp: 50,
    maxMp: 50,
    gold: 0,
    stats: {
      str: 5,
      agi: 1,
      vit: 1,
      int: 1,
      dex: 1,
      luk: 1,
    },
    statPoints: 5,
    jobClass: "Novice",
    jobLevel: 1,
    jobExp: 0,
    jobExpToNext: 50,
    skillPoints: 3, // 初始給 3 點測試
    learnedSkills: { basic_attack: 1 }, // 預設學會普攻
  });

  const [enemy, setEnemy] = useState<Enemy>(() => {
    try {
      return getRandomEnemyForZone(1, 1);
    } catch (e) {
      return { name: "Slime", level: 1, hp: 30, maxHp: 30, atk: 5, def: 2 };
    }
  });

  const [logs, setLogs] = useState<Log[]>([]);
  const [inventory, setInventory] = useState<Equipment[]>([]);
  const [equipped, setEquipped] = useState<{
    weapon: Equipment | null;
    armor: Equipment | null;
  }>({
    weapon: null,
    armor: null,
  });

  const [currentZoneId, setCurrentZoneId] = useState<number>(1);
  const [unlockedZoneIds, setUnlockedZoneIds] = useState<number[]>([1]);
  const [killCount, setKillCount] = useState<number>(0);
  const [bossAvailable, setBossAvailable] = useState<boolean>(false);
  const [bossDefeated, setBossDefeated] = useState<boolean>(false);
  const [isBossFight, setIsBossFight] = useState<boolean>(false);

  const [hpPotions, setHpPotions] = useState<number>(1);
  const [mpPotions, setMpPotions] = useState<number>(1);

  // ✅ 技能系統 State
  const [showSkillWindow, setShowSkillWindow] = useState<boolean>(false);
  const [skillCooldowns, setSkillCooldowns] = useState<Record<string, number>>({});

  const logsEndRef = useRef<HTMLDivElement>(null);
  const logContainerRef = useRef<HTMLDivElement>(null);
  const battleActionRef = useRef<(skillId?: string) => void>(() => {});

  // === Stats 相關 Helper ===
  function calcPlayerAtk(char: Character, weaponBonus: number) {
    const { str, dex, luk } = char.stats;
    const base = str * 2 + Math.floor(dex * 0.5) + Math.floor(luk * 0.3);
    return base + weaponBonus + char.level;
  }

  function calcPlayerMagicAtk(char: Character) {
    const { int, dex } = char.stats;
    return int * 3 + Math.floor(dex * 0.3) + char.level;
  }

  function calcPlayerDef(char: Character, armorBonus: number) {
    const { vit, agi } = char.stats;
    const softDef = vit * 1.5 + agi * 0.5;
    return softDef + armorBonus;
  }

  function calcCritChance(char: Character) {
    const { luk } = char.stats;
    return Math.min(50, Math.floor(luk / 3));
  }

  const CRIT_MULTIPLIER = 1.5;

  function addLog(text: string) {
    setLogs((prev) => {
      const newLog = { id: Date.now() + Math.random(), text };
      const next = [...prev, newLog];
      if (next.length > 50) next.shift();
      return next;
    });
  }

  // ✅ 技能學習
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

  // ✅ 核心戰鬥邏輯（支援技能）
  function battleAction(skillId?: string) {
    const weaponBonus = equipped.weapon?.stat || 0;
    const armorBonus = equipped.armor?.stat || 0;

    // 如果沒指定技能，用普攻
    const actualSkillId = skillId || "basic_attack";
    const skillLevel = char.learnedSkills[actualSkillId] || 0;

    if (skillLevel === 0) {
      addLog("❌ Skill not learned!");
      return;
    }

    // 找技能資料
    const allSkills = SKILLS_DB[char.jobClass];
    const skill = allSkills.find((s) => s.id === actualSkillId);

    if (!skill) {
      addLog("❌ Skill not found!");
      return;
    }

    // CD 檢查
    const now = Date.now();
    const lastUsed = skillCooldowns[actualSkillId] || 0;
    const timePassed = (now - lastUsed) / 1000;

    if (timePassed < skill.cooldown) {
      const remaining = (skill.cooldown - timePassed).toFixed(1);
      addLog(`⏳ ${skill.nameZh} on cooldown (${remaining}s)`);
      return;
    }

    // MP 檢查
    const mpCost = skill.mpCost(skillLevel);
    if (char.mp < mpCost) {
      const mpRegen = Math.floor(char.maxMp * 0.1) + 5;
      const newMp = Math.min(char.maxMp, char.mp + mpRegen);
      setChar((prev) => ({ ...prev, mp: newMp }));
      addLog(`💤 Too low MP! Resting... Recovered ${mpRegen} MP.`);
      return;
    }

    // 設定 CD
    setSkillCooldowns((prev) => ({ ...prev, [actualSkillId]: now }));

    // === 戰鬥計算 ===
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

    // 判斷物理/魔法
    const isMagic = ["fire_bolt", "cold_bolt", "lightning_bolt"].includes(
      actualSkillId,
    );
    const baseAtk = isMagic
      ? calcPlayerMagicAtk(char)
      : calcPlayerAtk(char, weaponBonus);

    const randomVar = Math.floor(Math.random() * 5);
    let baseDmg = Math.max(1, baseAtk - enemy.def + randomVar);

    // 暴擊判定（魔法不暴擊）
    const critChance = isMagic ? 0 : calcCritChance(char);
    const roll = Math.random() * 100;
    let isCrit = false;
    if (roll < critChance) {
      isCrit = true;
      baseDmg = Math.floor(baseDmg * CRIT_MULTIPLIER);
    }

    // 技能倍率
    const multiplier = skill.damageMultiplier(skillLevel);
    const damage = Math.floor(baseDmg * multiplier);
    nextEnemyHp = enemy.hp - damage;

    const critText = isCrit ? " ❗CRIT!" : "";
    addLog(
      `🎯 ${skill.nameZh} Lv.${skillLevel}: Hit ${enemy.name} for ${damage} dmg.${critText} (MP-${mpCost})`,
    );

    let nextJobLevel = char.jobLevel;
    let nextJobExp = char.jobExp;
    let nextJobExpToNext = char.jobExpToNext;
    let nextSkillPoints = char.skillPoints;

    if (nextEnemyHp <= 0) {
      addLog(`💀 ${enemy.name} defeated!`);

      const goldGain = 10 + enemy.level * 5;
      nextCharGold += goldGain;
      addLog(`💰 Gained ${goldGain} Gold.`);

      const expGain = 20 + enemy.level * 10;
      nextCharExp += expGain;
      addLog(`✨ Gained ${expGain} Base EXP.`);

      const jobExpGain = 15 + enemy.level * 8;
      nextJobExp += jobExpGain;
      addLog(`✨ Gained ${jobExpGain} Job EXP.`);

      // Base Level Up
      while (nextCharExp >= nextCharExpToNext) {
        nextCharExp -= nextCharExpToNext;
        nextCharLevel += 1;
        nextCharExpToNext = Math.floor(nextCharExpToNext * 1.5);

        nextStatPoints += 3;
        nextCharHp = nextCharLevel * 20 + 50 + nextCharStats.vit * 5;
        nextCharMp = nextCharLevel * 10 + 30 + nextCharStats.int * 3;

        addLog(`🌟 LEVEL UP! Now Lv.${nextCharLevel} (Stat Points +3)`);
      }

      // Job Level Up
      while (nextJobExp >= nextJobExpToNext) {
        nextJobExp -= nextJobExpToNext;
        nextJobLevel += 1;
        nextJobExpToNext = Math.floor(nextJobExpToNext * 1.4);

        nextSkillPoints += 1;
        addLog(`📘 JOB LEVEL UP! Job Lv.${nextJobLevel} (Skill Points +1)`);
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

        const isWeapon = Math.random() > 0.5;
        const statValue =
          Math.floor(Math.random() * 10) + 5 + nextCharLevel * 3;
        const bossGear: Equipment = {
          id: Date.now(),
          name: isWeapon
            ? `Boss Sword +${statValue}`
            : `Boss Armor +${statValue}`,
          type: isWeapon ? "weapon" : "armor",
          stat: statValue,
          rarity: "epic",
        };
        setInventory((prev) => [...prev, bossGear]);
        addLog(`🎁 Boss Drop: ${bossGear.name}!`);

        nextEnemy = getRandomEnemyForZone(currentZoneId, nextCharLevel);
        addLog(`👾 A wild ${nextEnemy.name} appeared!`);
      } else {
        const nextKillCount = killCount + 1;
        setKillCount(nextKillCount);

        if (nextKillCount % 10 === 0) {
          setBossAvailable(true);
          addLog(`⚔️ Boss is ready! Click the button to challenge!`);
        }

        if (Math.random() < 0.2) {
          const isWeapon = Math.random() > 0.5;
          const statValue =
            Math.floor(Math.random() * 5) + 1 + nextCharLevel * 2;
          const newGear: Equipment = {
            id: Date.now(),
            name: isWeapon ? `Sword +${statValue}` : `Armor +${statValue}`,
            type: isWeapon ? "weapon" : "armor",
            stat: statValue,
            rarity: statValue > 15 ? "epic" : statValue > 8 ? "rare" : "common",
          };
          setInventory((prev) => [...prev, newGear]);
          addLog(`🎁 Looted: ${newGear.name}!`);
        }

        nextEnemy = getRandomEnemyForZone(currentZoneId, nextCharLevel);
        addLog(`👾 A wild ${nextEnemy.name} appeared!`);
      }
    } else {
      const playerDef = calcPlayerDef(char, armorBonus);
      const enemyRawDmg = enemy.atk;
      const enemyDmg = Math.max(1, Math.floor(enemyRawDmg - playerDef * 0.7));

      nextCharHp -= enemyDmg;
      addLog(`💥 ${enemy.name} counter-attacks! You take ${enemyDmg} dmg.`);

      nextEnemy = { ...enemy, hp: nextEnemyHp };

      if (nextCharHp <= 0) {
        nextCharHp = 0;
        addLog(`💀 You were defeated... Respawning.`);
        nextCharHp = Math.floor((char.level * 20 + 50) * 0.5);
        nextCharMp = Math.floor((char.level * 10 + 30) * 0.5);
        nextEnemy = {
          ...nextEnemy,
          hp: Math.min(nextEnemy.maxHp, nextEnemy.hp + 10),
        };
      }
    }

    setChar({
      hp: nextCharHp,
      maxHp: nextCharLevel * 20 + 50 + nextCharStats.vit * 5,
      mp: nextCharMp,
      maxMp: nextCharLevel * 10 + 30 + nextCharStats.int * 3,
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

  // 自動攻擊（普攻）
  useEffect(() => {
    const id = setInterval(() => {
      battleActionRef.current("basic_attack");
    }, 1500);
    return () => clearInterval(id);
  }, []);

  // ✅ FIXED: Only auto-scroll if user is already at the bottom
  useEffect(() => {
    const container = logContainerRef.current;
    if (!container) return;

    const isNearBottom = container.scrollHeight - container.scrollTop - container.clientHeight < 50;
    
    if (isNearBottom) {
      logsEndRef.current?.scrollIntoView({ behavior: "auto", block: "end" });
    }
  }, [logs]);

  const expProgress = Math.floor((char.exp / char.expToNext) * 100);
  const hpPercent = Math.floor((char.hp / char.maxHp) * 100);
  const mpPercent = Math.floor((char.mp / char.maxMp) * 100);
  const jobExpPercent = Math.floor((char.jobExp / char.jobExpToNext) * 100);

  // 取得當前職業可用技能
  const availableSkills = SKILLS_DB[char.jobClass];

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)",
        color: "white",
        display: "flex",
        justifyContent: "center",
        alignItems: "flex-start",
        fontFamily: "system-ui, sans-serif",
        padding: "20px",
        paddingTop: "40px",
      }}
    >

      <div
        style={{
          border: "2px solid gold",
          padding: "20px",
          borderRadius: "12px",
          width: "100%",
          maxWidth: "1200px",
          background: "rgba(34, 34, 34, 0.95)",
          boxShadow: "0 8px 32px rgba(255, 215, 0, 0.2)",
          backdropFilter: "blur(10px)",
        }}
      >

        <h1
          style={{
            textAlign: "center",
            margin: "0 0 20px 0",
            fontSize: "28px",
            background: "linear-gradient(45deg, #fbbf24, #f59e0b)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            fontWeight: "bold",
          }}
        >
          ⚔️ Mini RPG - RO Style
        </h1>


        <div style={{ display: "flex", gap: "20px", marginBottom: "15px", flexWrap: "wrap" }}>
          {/* === 左欄 === */}
          <div style={{ flex: "1 1 400px", minWidth: "300px" }}>
            {/* 玩家狀態 */}
            <div
              style={{
                marginBottom: "15px",
                background: "linear-gradient(135deg, #2a2a2a 0%, #1f1f1f 100%)",
                padding: "15px",
                borderRadius: "8px",
                border: "1px solid #444",
              }}
            >

              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  marginBottom: "2px",
                }}
              >
                <strong>
                  Lv.{char.level} {char.jobClass}
                </strong>
                <span>
                  HP: {char.hp}/{char.maxHp}
                </span>
              </div>

              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  marginBottom: "4px",
                  fontSize: "11px",
                }}
              >
                <span>Job Lv.{char.jobLevel}</span>
                <span>
                  Job EXP: {char.jobExp}/{char.jobExpToNext}
                </span>
              </div>
              <div
                style={{
                  width: "100%",
                  height: "4px",
                  background: "#555",
                  borderRadius: "5px",
                  overflow: "hidden",
                  marginBottom: "4px",
                }}
              >
                <div
                  style={{
                    width: `${jobExpPercent}%`,
                    height: "100%",
                    background: "#f97316",
                    transition: "width 0.2s",
                  }}
                />
              </div>
              <div
                style={{
                  width: "100%",
                  height: "10px",
                  background: "#555",
                  borderRadius: "5px",
                  overflow: "hidden",
                  marginBottom: "8px",
                }}
              >
                <div
                  style={{
                    width: `${hpPercent}%`,
                    height: "100%",
                    background: "#ef4444",
                    transition: "width 0.2s",
                  }}
                />
              </div>

              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  marginBottom: "5px",
                  fontSize: "12px",
                }}
              >
                <span>
                  MP: {char.mp}/{char.maxMp}
                </span>
                <span>
                  EXP: {char.exp}/{char.expToNext}
                </span>
              </div>
              <div
                style={{
                  width: "100%",
                  height: "6px",
                  background: "#555",
                  borderRadius: "5px",
                  overflow: "hidden",
                  marginBottom: "8px",
                }}
              >
                <div
                  style={{
                    width: `${mpPercent}%`,
                    height: "100%",
                    background: "#3b82f6",
                    transition: "width 0.2s",
                  }}
                />
              </div>
              <div
                style={{
                  width: "100%",
                  height: "4px",
                  background: "#555",
                  borderRadius: "5px",
                  overflow: "hidden",
                  marginBottom: "8px",
                }}
              >
                <div
                  style={{
                    width: `${expProgress}%`,
                    height: "100%",
                    background: "#10b981",
                    transition: "width 0.2s",
                  }}
                />
              </div>

              <div
                style={{
                  textAlign: "center",
                  color: "#fbbf24",
                  fontWeight: "bold",
                  fontSize: "14px",
                }}
              >
                💰 Gold: {char.gold}
              </div>
            </div>

            {/* Stats Panel */}
            <div
              style={{
                marginTop: "8px",
                background: "#111",
                padding: "8px",
                borderRadius: "4px",
                fontSize: "11px",
              }}
            >
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  marginBottom: "4px",
                }}
              >
                <span>📊 Stats</span>
                <span>Points: {char.statPoints}</span>
              </div>
              {(["str", "agi", "vit", "int", "dex", "luk"] as const).map(
                (key) => (
                  <div
                    key={key}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      marginBottom: "2px",
                      gap: "4px",
                    }}
                  >
                    <span style={{ width: "40px", textTransform: "uppercase" }}>
                      {key}
                    </span>
                    <span style={{ width: "24px" }}>{char.stats[key]}</span>
                    <button
                      onClick={() => {
                        if (char.statPoints <= 0) {
                          addLog("❌ No stat points!");
                          return;
                        }
                        setChar((prev) => ({
                          ...prev,
                          stats: { ...prev.stats, [key]: prev.stats[key] + 1 },
                          statPoints: prev.statPoints - 1,
                        }));
                      }}
                      disabled={char.statPoints <= 0}
                      style={{
                        padding: "0 6px",
                        fontSize: "10px",
                        borderRadius: "3px",
                        border: "none",
                        background: char.statPoints > 0 ? "#22c55e" : "#444",
                        color: "white",
                        cursor: char.statPoints > 0 ? "pointer" : "not-allowed",
                      }}
                    >
                      +
                    </button>
                  </div>
                ),
              )}
            </div>

            {/* ✅ 技能按鈕 */}
            <div style={{ marginTop: "10px" }}>
              <button
                onClick={() => setShowSkillWindow(!showSkillWindow)}
                style={{
                  width: "100%",
                  padding: "8px",
                  background: "#7c3aed",
                  color: "white",
                  border: "none",
                  borderRadius: "4px",
                  cursor: "pointer",
                  fontWeight: "bold",
                  fontSize: "12px",
                }}
              >
                📖 Skills (Points: {char.skillPoints})
              </button>
            </div>

            {/* 敵人狀態 */}
            <div
              style={{
                marginTop: "15px",
                marginBottom: "15px",
                background: "#333",
                padding: "10px",
                borderRadius: "6px",
                textAlign: "center",
              }}
            >
              <h2
                style={{
                  margin: "0 0 5px 0",
                  fontSize: "16px",
                  color: "#fbbf24",
                }}
              >
                {enemy.name}{" "}
                <span style={{ fontSize: "12px", color: "#aaa" }}>
                  (Lv.{enemy.level})
                </span>
              </h2>
              <div style={{ fontSize: "12px", marginBottom: "5px" }}>
                HP: {enemy.hp}/{enemy.maxHp}
              </div>
              <div
                style={{
                  width: "100%",
                  height: "8px",
                  background: "#555",
                  borderRadius: "5px",
                  overflow: "hidden",
                }}
              >
                <div
                  style={{
                    width: `${(enemy.hp / enemy.maxHp) * 100}%`,
                    height: "100%",
                    background: "#f59e0b",
                    transition: "width 0.2s",
                  }}
                />
              </div>
            </div>

            {/* Boss 按鈕 */}
            {bossAvailable && (
              <div style={{ marginBottom: "15px", textAlign: "center" }}>
                <button
                  onClick={() => {
                    setIsBossFight(true);
                    const bossTemplate = getRandomEnemyForZone(
                      currentZoneId,
                      char.level,
                    );
                    const bossEnemy = {
                      ...bossTemplate,
                      name: `👹 Boss: ${bossTemplate.name}`,
                      hp: bossTemplate.maxHp * 5,
                      maxHp: bossTemplate.maxHp * 5,
                      atk: bossTemplate.atk * 2,
                      def: bossTemplate.def * 2,
                    };
                    setEnemy(bossEnemy);
                    setBossAvailable(false);
                    addLog(`⚔️ CHALLENGE: ${bossEnemy.name} appeared!`);
                  }}
                  style={{
                    width: "100%",
                    padding: "12px",
                    background: "linear-gradient(45deg, #dc2626, #991b1b)",
                    color: "white",
                    border: "none",
                    borderRadius: "6px",
                    fontSize: "14px",
                    fontWeight: "bold",
                    cursor: "pointer",
                    boxShadow: "0 0 10px rgba(220, 38, 38, 0.7)",
                  }}
                >
                  💀 CHALLENGE BOSS (Kills: {killCount}/10)
                </button>
              </div>
            )}

            {bossDefeated && (
              <div
                style={{
                  marginBottom: "15px",
                  textAlign: "center",
                  color: "#10b981",
                  fontWeight: "bold",
                  padding: "10px",
                  background: "rgba(16, 185, 129, 0.1)",
                  borderRadius: "4px",
                  fontSize: "12px",
                }}
              >
                ✅ Boss Defeated! Next area unlocked.
              </div>
            )}
          </div>

          {/* === 右欄 === */}
            <div style={{ flex: "1 1 400px", minWidth: "300px" }}>
            {/* 地圖系統 */}
            <div
              style={{
                background: "#2a2a2a",
                padding: "10px",
                borderRadius: "6px",
                marginBottom: "15px",
                border: "1px solid #444",
              }}
            >
              <h3
                style={{
                  margin: "0 0 8px 0",
                  fontSize: "14px",
                  color: "#fbbf24",
                }}
              >
                📍{" "}
                {ZONES.find((z) => z.id === currentZoneId)?.name || "Unknown"}
              </h3>
              <div style={{ display: "flex", gap: "5px", flexWrap: "wrap" }}>
                {ZONES.map((zone) => {
                  const isUnlocked = unlockedZoneIds.includes(zone.id);
                  const isCurrent = currentZoneId === zone.id;
                  if (isCurrent) return null;
                  return (
                    <button
                      key={zone.id}
                      onClick={() => travelToZone(zone.id)}
                      disabled={!isUnlocked}
                      style={{
                        flex: "1 1 auto",
                        padding: "6px 8px",
                        fontSize: "10px",
                        background: isUnlocked ? "#2563eb" : "#444",
                        color: "white",
                        border: "none",
                        borderRadius: "4px",
                        cursor: isUnlocked ? "pointer" : "not-allowed",
                        opacity: isUnlocked ? 1 : 0.5,
                      }}
                    >
                      {isUnlocked
                        ? `➡️ ${zone.name}`
                        : `🔒 Lv.${zone.minLevel}`}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* 裝備系統 */}
            <div
              style={{
                background: "#2a2a2a",
                padding: "10px",
                borderRadius: "6px",
                marginBottom: "15px",
                border: "1px solid #444",
              }}
            >
              <h3
                style={{
                  margin: "0 0 8px 0",
                  fontSize: "14px",
                  color: "#fbbf24",
                }}
              >
                🎒 Inventory ({inventory.length})
              </h3>
              <div
                style={{
                  display: "flex",
                  gap: "6px",
                  marginBottom: "8px",
                  fontSize: "11px",
                }}
              >
                <div
                  style={{
                    flex: 1,
                    background: "#111",
                    padding: "6px",
                    borderRadius: "4px",
                    border: equipped.weapon
                      ? "1px solid #059669"
                      : "1px solid #444",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap",
                  }}
                >
                  ⚔️{" "}
                  {equipped.weapon
                    ? `${equipped.weapon.name} (+${equipped.weapon.stat})`
                    : "No Weapon"}
                </div>
                <div
                  style={{
                    flex: 1,
                    background: "#111",
                    padding: "6px",
                    borderRadius: "4px",
                    border: equipped.armor
                      ? "1px solid #2563eb"
                      : "1px solid #444",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap",
                  }}
                >
                  🛡️{" "}
                  {equipped.armor
                    ? `${equipped.armor.name} (+${equipped.armor.stat})`
                    : "No Armor"}
                </div>
              </div>
              <div
                style={{
                  display: "flex",
                  flexWrap: "wrap",
                  gap: "3px",
                  maxHeight: "70px",
                  overflowY: "auto",
                }}
              >
                {inventory.length === 0 ? (
                  <div style={{ color: "#666", fontSize: "10px" }}>
                    Empty...
                  </div>
                ) : (
                  inventory.map((item) => (
                    <button
                      key={item.id}
                      onClick={() => {
                        setEquipped((prev) => ({ ...prev, [item.type]: item }));
                        addLog(`⚔️ Equipped ${item.name}!`);
                      }}
                      style={{
                        fontSize: "9px",
                        padding: "2px 4px",
                        background:
                          item.rarity === "epic"
                            ? "#a855f7"
                            : item.rarity === "rare"
                              ? "#3b82f6"
                              : "#555",
                        color: "white",
                        border: "none",
                        borderRadius: "3px",
                        cursor: "pointer",
                        maxWidth: "90px",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        whiteSpace: "nowrap",
                      }}
                    >
                      {item.name}
                    </button>
                  ))
                )}
              </div>
            </div>

            {/* 商店系統 */}
            <div
              style={{
                background: "#2a2a2a",
                padding: "10px",
                borderRadius: "6px",
                border: "1px solid #444",
              }}
            >
              <h3
                style={{
                  margin: "0 0 8px 0",
                  fontSize: "14px",
                  color: "#fbbf24",
                }}
              >
                🏪 Shop
              </h3>

              <div
                style={{
                  display: "flex",
                  gap: "6px",
                  marginBottom: "8px",
                  flexWrap: "wrap",
                }}
              >
                <button
                  onClick={() => {
                    if (inventory.length === 0) {
                      addLog("❌ Inventory empty!");
                      return;
                    }
                    const item = inventory[0];
                    const sellPrice = item.stat * 2;
                    setInventory((prev) => prev.slice(1));
                    setChar((prev) => ({
                      ...prev,
                      gold: prev.gold + sellPrice,
                    }));
                    addLog(`💰 Sold ${item.name} for ${sellPrice}g.`);
                  }}
                  style={{
                    flex: 1,
                    padding: "6px",
                    background: "#d97706",
                    color: "white",
                    border: "none",
                    borderRadius: "4px",
                    cursor: "pointer",
                    fontSize: "10px",
                  }}
                >
                  🔄 Sell
                </button>
                <button
                  onClick={() => {
                    if (char.gold >= 50) {
                      setChar((prev) => ({ ...prev, gold: prev.gold - 50 }));
                      setHpPotions((prev) => prev + 1);
                      addLog("🍖 +1 HP Pot");
                    } else {
                      addLog("❌ Need 50g!");
                    }
                  }}
                  style={{
                    flex: 1,
                    padding: "6px",
                    background: "#dc2626",
                    color: "white",
                    border: "none",
                    borderRadius: "4px",
                    cursor: "pointer",
                    fontSize: "10px",
                  }}
                >
                  🍖 50g
                </button>
                <button
                  onClick={() => {
                    if (char.gold >= 50) {
                      setChar((prev) => ({ ...prev, gold: prev.gold - 50 }));
                      setMpPotions((prev) => prev + 1);
                      addLog("🧪 +1 MP Pot");
                    } else {
                      addLog("❌ Need 50g!");
                    }
                  }}
                  style={{
                    flex: 1,
                    padding: "6px",
                    background: "#2563eb",
                    color: "white",
                    border: "none",
                    borderRadius: "4px",
                    cursor: "pointer",
                    fontSize: "10px",
                  }}
                >
                  🧪 50g
                </button>
              </div>

              <div style={{ display: "flex", gap: "6px" }}>
                <button
                  onClick={() => {
                    if (hpPotions > 0 && char.hp < char.maxHp) {
                      const heal = Math.floor(char.maxHp * 0.5);
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
                  }}
                  disabled={hpPotions === 0}
                  style={{
                    flex: 1,
                    padding: "6px",
                    background: hpPotions > 0 ? "#ef4444" : "#555",
                    color: "white",
                    border: "none",
                    borderRadius: "4px",
                    cursor: "pointer",
                    fontSize: "10px",
                  }}
                >
                  Use HP ({hpPotions})
                </button>
                <button
                  onClick={() => {
                    if (mpPotions > 0 && char.mp < char.maxMp) {
                      const recover = Math.floor(char.maxMp * 0.5);
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
                  }}
                  disabled={mpPotions === 0}
                  style={{
                    flex: 1,
                    padding: "6px",
                    background: mpPotions > 0 ? "#3b82f6" : "#555",
                    color: "white",
                    border: "none",
                    borderRadius: "4px",
                    cursor: "pointer",
                    fontSize: "10px",
                  }}
                >
                  Use MP ({mpPotions})
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* === 技能視窗（全寬） === */}
        {showSkillWindow && (
          <div
            style={{
              marginBottom: "15px",
              background: "#1a1a1a",
              padding: "12px",
              borderRadius: "6px",
              border: "2px solid #7c3aed",
            }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                marginBottom: "10px",
              }}
            >
              <h3 style={{ margin: 0, fontSize: "14px", color: "#fbbf24" }}>
                📖 Skill Tree ({char.jobClass})
              </h3>
              <button
                onClick={() => setShowSkillWindow(false)}
                style={{
                  background: "#444",
                  color: "white",
                  border: "none",
                  borderRadius: "4px",
                  padding: "4px 8px",
                  cursor: "pointer",
                  fontSize: "12px",
                }}
              >
                ✕
              </button>
            </div>

            <div
              style={{ fontSize: "11px", marginBottom: "8px", color: "#aaa" }}
            >
              Skill Points: {char.skillPoints}
            </div>

            <div
              style={{ display: "flex", flexDirection: "column", gap: "8px" }}
            >
              {availableSkills.map((skill) => {
                const currentLevel = char.learnedSkills[skill.id] || 0;
                const isMaxed = currentLevel >= skill.maxLevel;
                const mpCost =
                  currentLevel > 0
                    ? skill.mpCost(currentLevel)
                    : skill.mpCost(1);

                return (
                  <div
                    key={skill.id}
                    style={{
                      background: "#2a2a2a",
                      padding: "8px",
                      borderRadius: "4px",
                      border: "1px solid #444",
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        marginBottom: "4px",
                      }}
                    >
                      <div>
                        <strong style={{ color: "#fbbf24" }}>
                          {skill.nameZh}
                        </strong>
                        <span
                          style={{
                            color: "#aaa",
                            fontSize: "10px",
                            marginLeft: "6px",
                          }}
                        >
                          Lv.{currentLevel}/{skill.maxLevel}
                        </span>
                      </div>
                      <button
                        onClick={() => learnSkill(skill.id)}
                        disabled={isMaxed || char.skillPoints <= 0}
                        style={{
                          padding: "4px 12px",
                          fontSize: "10px",
                          background:
                            isMaxed || char.skillPoints <= 0
                              ? "#555"
                              : "#22c55e",
                          color: "white",
                          border: "none",
                          borderRadius: "3px",
                          cursor:
                            isMaxed || char.skillPoints <= 0
                              ? "not-allowed"
                              : "pointer",
                        }}
                      >
                        {isMaxed ? "MAX" : "Learn"}
                      </button>
                    </div>
                    <div
                      style={{
                        fontSize: "10px",
                        color: "#bbb",
                        marginBottom: "4px",
                      }}
                    >
                      {skill.description}
                    </div>
                    <div style={{ fontSize: "9px", color: "#888" }}>
                      MP Cost: {mpCost} | Cooldown: {skill.cooldown}s
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* === 戰鬥 Log === */}
        <div style={{ marginBottom: "15px" }}>
          <h3
            style={{ margin: "0 0 8px 0", fontSize: "14px", color: "#fbbf24" }}
          >
            📜 Battle Log
          </h3>
          <div
            ref={logContainerRef}
            style={{
              height: "150px",
              overflowY: "auto",
              background: "#111",
              border: "1px solid #444",
              borderRadius: "4px",
              padding: "8px",
              fontSize: "11px",
              fontFamily: "monospace",
            }}
          >
            {logs.map((log) => (
              <div
                key={log.id}
                style={{
                  marginBottom: "3px",
                  borderBottom: "1px solid #222",
                  paddingBottom: "2px",
                }}
              >
                {log.text}
              </div>
            ))}
            <div ref={logsEndRef} />
            {logs.length === 0 && (
              <div style={{ color: "#666" }}>Battle started...</div>
            )}
          </div>
        </div>

        {/* === 技能快捷鍵 === */}
        <div style={{ marginBottom: "10px" }}>
          <h3
            style={{ margin: "0 0 8px 0", fontSize: "12px", color: "#fbbf24" }}
          >
            ⚡ Hotkeys
          </h3>
          <div style={{ display: "flex", gap: "6px", flexWrap: "wrap" }}>
            {availableSkills
              .filter((skill) => (char.learnedSkills[skill.id] || 0) > 0)
              .map((skill) => {
                const skillLevel = char.learnedSkills[skill.id];
                const now = Date.now();
                const lastUsed = skillCooldowns[skill.id] || 0;
                const timePassed = (now - lastUsed) / 1000;
                const isOnCooldown = timePassed < skill.cooldown;

                return (
                  <button
                    key={skill.id}
                    onClick={() => battleAction(skill.id)}
                    disabled={char.hp <= 0 || isOnCooldown}
                    style={{
                      flex: "1 1 120px",
                      padding: "8px",
                      background: isOnCooldown
                        ? "#555"
                        : skill.id.includes("bolt")
                          ? "#7c3aed"
                          : "#059669",
                      color: "white",
                      border: "none",
                      borderRadius: "4px",
                      cursor: isOnCooldown ? "not-allowed" : "pointer",
                      fontSize: "11px",
                      fontWeight: "bold",
                      position: "relative",
                    }}
                  >
                    {skill.nameZh} Lv.{skillLevel}
                    <div style={{ fontSize: "9px", fontWeight: "normal" }}>
                      {skill.mpCost(skillLevel)} MP
                    </div>
                  </button>
                );
              })}
          </div>
        </div>

        {char.hp <= 0 && (
          <div
            style={{
              marginTop: "10px",
              textAlign: "center",
              color: "#ef4444",
              fontWeight: "bold",
            }}
          >
            💀 You are defeated! Wait for respawn...
          </div>
        )}
      </div>
    </div>
  );
}
