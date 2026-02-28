import { useState, useEffect, useRef } from "react";

type JobClass = "Novice" | "Swordsman" | "Mage" | "Archer";

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

  // ✅ 新增：六圍同 Stat Point
  stats: {
    str: number; // 物理攻擊
    agi: number; // 攻擊速度/閃避（暫時只當作防禦加成）
    vit: number; // HP、防禦
    int: number; // 魔攻 / MP（之後做 Mage 用）
    dex: number; // 命中/最低傷害
    luk: number; // 暴擊
  };
  statPoints: number; // 未分配點數
  // ✅ 新增 Job 系統欄位
  jobClass: JobClass;      // 目前職業，例如 "Novice" / "Swordsman"
  jobLevel: number;        // Job 等級，類似 RO 嘅 Job Lv [web:60]
  jobExp: number;          // Job 經驗值
  jobExpToNext: number;    // 下個 Job Lv 需要 JobExp
  skillPoints: number;     // 技能點數（之後 Skill Tree 用）
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
  // 移除 unlocked 屬性，因為我哋用 unlockedZoneIds State 管理
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

// 獲取敵人池
function getEnemyPool(zoneId: number): Enemy[] {
  const zone = ZONES.find(z => z.id === zoneId);
  // 後備方案：如果搵唔到，就返去第 1 個地圖
  return zone ? zone.enemies : ZONES[0].enemies;
}

// 隨機敵人
function getRandomEnemyForZone(zoneId: number, playerLevel: number): Enemy {
  const pool = getEnemyPool(zoneId);
  if (pool.length === 0) return { ...ZONES[0].enemies[0] }; // 絕對後備

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

    // ✅ Job 初始值（要留喺 object 入面）
    jobClass: "Novice",
    jobLevel: 1,
    jobExp: 0,
    jobExpToNext: 50,
    skillPoints: 0,
  });
  // ✅ 修復：用函數初始化，但確保有後備
  const [enemy, setEnemy] = useState<Enemy>(() => {
    try {
      return getRandomEnemyForZone(1, 1); // 一開始強制用 Zone 1
    } catch (e) {
      return { name: "Slime", level: 1, hp: 30, maxHp: 30, atk: 5, def: 2 };
    }
  });

  const [logs, setLogs] = useState<Log[]>([]);
  const [inventory, setInventory] = useState<Equipment[]>([]);
  const [equipped, setEquipped] = useState<{ weapon: Equipment | null; armor: Equipment | null }>({
    weapon: null,
    armor: null,
  });

  // --- 地圖系統 State ---
  const [currentZoneId, setCurrentZoneId] = useState<number>(1);
  const [unlockedZoneIds, setUnlockedZoneIds] = useState<number[]>([1]);
  // ✅ Boss 系統 State
  const [killCount, setKillCount] = useState<number>(0);
  const [bossAvailable, setBossAvailable] = useState<boolean>(false);
  const [bossDefeated, setBossDefeated] = useState<boolean>(false);
  const [isBossFight, setIsBossFight] = useState<boolean>(false); // 加呢行！

  // ✅ 商店系統 State
  const [hpPotions, setHpPotions] = useState<number>(1);
  const [mpPotions, setMpPotions] = useState<number>(1);

  // ✅ Refs
  const logsEndRef = useRef<HTMLDivElement>(null);
  const battleActionRef = useRef<(isSkill: boolean) => void>(() => {});
  // === Stats 相關 Helper ===

  // 計玩家物理攻擊力（白字 + 綠字簡化版）
  function calcPlayerAtk(char: Character, weaponBonus: number) {
    const { str, dex, luk } = char.stats;
    const base = str * 2 + Math.floor(dex * 0.5) + Math.floor(luk * 0.3);
    return base + weaponBonus + char.level; // 少少 level 補正
  }

  // 計玩家軟防禦（VIT+AGI）
  function calcPlayerDef(char: Character, armorBonus: number) {
    const { vit, agi } = char.stats;
    const softDef = vit * 1.5 + agi * 0.5;
    return softDef + armorBonus;
  }

  // 暴擊率（%）：每 3 LUK 約等於 1%（簡化版）[web:21]
  function calcCritChance(char: Character) {
    const { luk } = char.stats;
    return Math.min(50, Math.floor(luk / 3)); // 上限 50%
  }

  // 暴擊倍數：1.5x（原作類似 1.4x–1.5x）[web:19][web:21]
  const CRIT_MULTIPLIER = 1.5;

  // 命中 / 閃避暫時唔做太複雜，之後可以再擴充

  // --- Helper: 加 Log ---
  function addLog(text: string) {
    setLogs((prev) => {
      const newLog = { id: Date.now() + Math.random(), text };
      const next = [...prev, newLog];
      if (next.length > 50) next.shift();
      return next;
    });
  }

  // --- 核心戰鬥邏輯 ---
  function battleAction(isSkill: boolean) {
    const weaponBonus = equipped.weapon?.stat || 0;
    const armorBonus = equipped.armor?.stat || 0;
    const skillCost = isSkill ? 10 : 2;

    // MP 檢查
    if (char.mp < skillCost) {
      const mpRegen = Math.floor(char.maxMp * 0.1) + 5;
      const newMp = Math.min(char.maxMp, char.mp + mpRegen);
      setChar(prev => ({ ...prev, mp: newMp }));
      addLog(`💤 Too low MP! Resting... Recovered ${mpRegen} MP.`);
      return;
    }

    // === 準備變數（保持你原來結構） ===
    let nextCharHp = char.hp;
    let nextCharMp = char.mp - skillCost;
    let nextCharExp = char.exp;
    let nextCharLevel = char.level;
    let nextCharExpToNext = char.expToNext;
    let nextCharGold = char.gold;

    // ⭐ 新增：Stats + Stat Points
    let nextCharStats = { ...char.stats };
    let nextStatPoints = char.statPoints;

    let nextEnemyHp = enemy.hp;
    let nextEnemy = enemy;

    // === 用 Stats 計傷害 ===
    const playerAtk = calcPlayerAtk(char, weaponBonus);
    const randomVar = Math.floor(Math.random() * 5);
    let baseDmg = Math.max(1, playerAtk - enemy.def + randomVar);

    const critChance = calcCritChance(char);
    const roll = Math.random() * 100;
    let isCrit = false;
    if (roll < critChance) {
      isCrit = true;
      baseDmg = Math.floor(baseDmg * CRIT_MULTIPLIER);
    }

    const damage = isSkill ? Math.floor(baseDmg * 1.8) : baseDmg;
    nextEnemyHp = enemy.hp - damage;

    const actionName = isSkill ? "🔥 Power Strike" : "⚔️ Attack";
    const critText = isCrit ? " ❗CRIT!" : "";
    addLog(`${actionName}: Hit ${enemy.name} for ${damage} dmg.${critText} (MP-${skillCost})`);

    // === 之後部份，完全跟你原本的邏輯 ===
    let nextJobLevel = char.jobLevel;
    let nextJobExp = char.jobExp;
    let nextJobExpToNext = char.jobExpToNext;
    let nextSkillPoints = char.skillPoints;

    if (nextEnemyHp <= 0) {
      addLog(`💀 ${enemy.name} defeated!`);

      // 金幣
      const goldGain = 10 + (enemy.level * 5);
      nextCharGold += goldGain;
      addLog(`💰 Gained ${goldGain} Gold.`);

      // ✨ Base EXP 獎勵
      const expGain = 20 + (enemy.level * 10);
      nextCharExp += expGain;
      addLog(`✨ Gained ${expGain} Base EXP.`);

      // ✨ Job EXP 獎勵（簡化版：少少少啲）
      const jobExpGain = 15 + (enemy.level * 8);
      nextJobExp += jobExpGain;
      addLog(`✨ Gained ${jobExpGain} Job EXP.`);


      // 🌟 Base Level Up（你原本嗰段）
      while (nextCharExp >= nextCharExpToNext) {
        nextCharExp -= nextCharExpToNext;
        nextCharLevel += 1;
        nextCharExpToNext = Math.floor(nextCharExpToNext * 1.5);

        nextStatPoints += 3;
        nextCharHp = (nextCharLevel * 20) + 50 + nextCharStats.vit * 5;
        nextCharMp = (nextCharLevel * 10) + 30 + nextCharStats.int * 3;

        addLog(`🌟 LEVEL UP! Now Lv.${nextCharLevel} (Stat Points +3)`);
      }

      // 🌟 Job Level Up
      while (nextJobExp >= nextJobExpToNext) {
        nextJobExp -= nextJobExpToNext;
        nextJobLevel += 1;
        nextJobExpToNext = Math.floor(nextJobExpToNext * 1.4);  // 比 Base 少少易 [web:60]

        nextSkillPoints += 1; // 每 Job Lv +1 skill point
        addLog(`📘 JOB LEVEL UP! Job Lv.${nextJobLevel} (Skill Points +1)`);
      }

      // ✅ Boss / 普通怪：**完全照你原本嗰兩個分支**

      if (isBossFight) {
        // --- Boss 死咗 ---
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

        // Boss Drop
        const isWeapon = Math.random() > 0.5;
        const statValue = Math.floor(Math.random() * 10) + 5 + (nextCharLevel * 3);
        const bossGear: Equipment = {
          id: Date.now(),
          name: isWeapon ? `Boss Sword +${statValue}` : `Boss Armor +${statValue}`,
          type: isWeapon ? "weapon" : "armor",
          stat: statValue,
          rarity: "epic",
        };
        setInventory((prev) => [...prev, bossGear]);
        addLog(`🎁 Boss Drop: ${bossGear.name}!`);

        // 重生普通怪
        nextEnemy = getRandomEnemyForZone(currentZoneId, nextCharLevel);
        addLog(`👾 A wild ${nextEnemy.name} appeared!`);

      } else {
        // --- 普通怪死咗 ---
        const nextKillCount = killCount + 1;
        setKillCount(nextKillCount);

        if (nextKillCount % 10 === 0) {
          setBossAvailable(true);
          addLog(`⚔️ Boss is ready! Click the button to challenge!`);
        }

        // 掉落（20%）
        if (Math.random() < 0.2) {
          const isWeapon = Math.random() > 0.5;
          const statValue = Math.floor(Math.random() * 5) + 1 + (nextCharLevel * 2);
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

        // 重生普通怪
        nextEnemy = getRandomEnemyForZone(currentZoneId, nextCharLevel);
        addLog(`👾 A wild ${nextEnemy.name} appeared!`);
      }

    } else {
      // --- 敵人未死，反擊！---
      const playerDef = calcPlayerDef(char, armorBonus);
      const enemyRawDmg = enemy.atk;
      const enemyDmg = Math.max(1, Math.floor(enemyRawDmg - playerDef * 0.7));

      nextCharHp -= enemyDmg;
      addLog(`💥 ${enemy.name} counter-attacks! You take ${enemyDmg} dmg.`);

      nextEnemy = { ...enemy, hp: nextEnemyHp };

      if (nextCharHp <= 0) {
        nextCharHp = 0;
        addLog(`💀 You were defeated... Respawning.`);
        nextCharHp = Math.floor(((char.level * 20) + 50) * 0.5);
        nextCharMp = Math.floor(((char.level * 10) + 30) * 0.5);
        nextEnemy = { ...nextEnemy, hp: Math.min(nextEnemy.maxHp, nextEnemy.hp + 10) };
      }
    }

    // === 最尾 setChar / setEnemy ===
    setChar({
      hp: nextCharHp,
      maxHp: (nextCharLevel * 20) + 50 + nextCharStats.vit * 5,
      mp: nextCharMp,
      maxMp: (nextCharLevel * 10) + 30 + nextCharStats.int * 3,
      level: nextCharLevel,
      exp: nextCharExp,
      expToNext: nextCharExpToNext,
      gold: nextCharGold,
      stats: nextCharStats,
      statPoints: nextStatPoints,

      // ✅ 新增 Job 部分
      jobClass: char.jobClass,
      jobLevel: nextJobLevel,
      jobExp: nextJobExp,
      jobExpToNext: nextJobExpToNext,
      skillPoints: nextSkillPoints,
    });


    setEnemy(nextEnemy);
  }


  // 更新 Ref
  battleActionRef.current = battleAction;

  // 切換地圖
  function travelToZone(zoneId: number) {
    const targetZone = ZONES.find(z => z.id === zoneId);
    if (!targetZone || !unlockedZoneIds.includes(zoneId)) {
      addLog("❌ 地圖未解鎖！");
      return;
    }
    setCurrentZoneId(zoneId);
    setEnemy(getRandomEnemyForZone(zoneId, char.level));
    addLog(`🚀 旅行到：${targetZone.name}！`);
  }

  // 自動攻擊
  useEffect(() => {
    const id = setInterval(() => {
      battleActionRef.current(false);
    }, 1000);
    return () => clearInterval(id);
  }, []);

  // 自動 Scroll
  useEffect(() => {
    logsEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [logs]);

  // UI 變量
  const expProgress = Math.floor((char.exp / char.expToNext) * 100);
  const hpPercent = Math.floor((char.hp / char.maxHp) * 100);
  const mpPercent = Math.floor((char.mp / char.maxMp) * 100);

  return (
    <div style={{ eight: "100vh", background: "#1a1a2e", color: "white", display: "flex", justifyContent: "center", alignItems: "center", fontFamily: "system-ui, sans-serif", padding: "20px" }}>
      <div style={{ border: "2px solid gold", padding: "20px", borderRadius: "8px", width: "100%", maxWidth: "900px", background: "#222", boxShadow: "0 0 15px rgba(255, 215, 0, 0.3)" }}>

        <h1 style={{ textAlign: "center", margin: "0 0 15px 0", fontSize: "24px" }}>⚔️ Mini RPG</h1>

        {/* ✅ 兩欄主容器 */}
        <div style={{ display: "flex", gap: "20px", marginBottom: "15px" }}>

          {/* === 左欄 (Left Column) === */}
          <div style={{ flex: 1 }}>

            {/* 玩家狀態 */}
            <div style={{ marginBottom: "15px", background: "#333", padding: "10px", borderRadius: "6px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "2px" }}>
                <strong>Lv.{char.level} {char.jobClass}</strong>
                <span>HP: {char.hp}/{char.maxHp}</span>
              </div>

              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "4px", fontSize: "11px" }}>
                <span>Job Lv.{char.jobLevel}</span>
                <span>Job EXP: {char.jobExp}/{char.jobExpToNext}</span>
              </div>
              <div style={{ width: "100%", height: "4px", background: "#555", borderRadius: "5px", overflow: "hidden", marginBottom: "4px" }}>
                <div style={{ width: `${jobExpPercent}%`, height: "100%", background: "#f97316", transition: "width 0.2s" }} />
              </div>
              <div style={{ width: "100%", height: "10px", background: "#555", borderRadius: "5px", overflow: "hidden", marginBottom: "8px" }}>
                <div style={{ width: `${hpPercent}%`, height: "100%", background: "#ef4444", transition: "width 0.2s" }} />
              </div>

              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "5px", fontSize: "12px" }}>
                <span>MP: {char.mp}/{char.maxMp}</span>
                <span>EXP: {char.exp}/{char.expToNext}</span>
              </div>
              <div style={{ width: "100%", height: "6px", background: "#555", borderRadius: "5px", overflow: "hidden", marginBottom: "8px" }}>
                <div style={{ width: `${mpPercent}%`, height: "100%", background: "#3b82f6", transition: "width 0.2s" }} />
              </div>
              <div style={{ width: "100%", height: "4px", background: "#555", borderRadius: "5px", overflow: "hidden", marginBottom: "8px" }}>
                <div style={{ width: `${expProgress}%`, height: "100%", background: "#10b981", transition: "width 0.2s" }} />
              </div>

              <div style={{ textAlign: "center", color: "#fbbf24", fontWeight: "bold", fontSize: "14px" }}>
                💰 Gold: {char.gold}
              </div>
            </div>
            {/* Stats Panel */}
            <div style={{ marginTop: "8px", background: "#111", padding: "8px", borderRadius: "4px", fontSize: "11px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "4px" }}>
                <span>📊 Stats</span>
                <span>Points: {char.statPoints}</span>
              </div>
              {(["str", "agi", "vit", "int", "dex", "luk"] as const).map((key) => (
                <div key={key} style={{ display: "flex", alignItems: "center", marginBottom: "2px", gap: "4px" }}>
                  <span style={{ width: "40px", textTransform: "uppercase" }}>{key}</span>
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
              ))}
            </div>

            {/* 敵人狀態 */}
            <div style={{ marginBottom: "15px", background: "#333", padding: "10px", borderRadius: "6px", textAlign: "center" }}>
              <h2 style={{ margin: "0 0 5px 0", fontSize: "16px", color: "#fbbf24" }}>
                {enemy.name} <span style={{fontSize:"12px", color:"#aaa"}}>(Lv.{enemy.level})</span>
              </h2>
              <div style={{ fontSize: "12px", marginBottom: "5px" }}>HP: {enemy.hp}/{enemy.maxHp}</div>
              <div style={{ width: "100%", height: "8px", background: "#555", borderRadius: "5px", overflow: "hidden" }}>
                <div style={{ width: `${(enemy.hp / enemy.maxHp) * 100}%`, height: "100%", background: "#f59e0b", transition: "width 0.2s" }} />
              </div>
            </div>

            {/* Boss 挑戰按鈕 */}
            {bossAvailable && (
              <div style={{ marginBottom: "15px", textAlign: "center" }}>
                <button
                  onClick={() => {
                    setIsBossFight(true);
                    const bossTemplate = getRandomEnemyForZone(currentZoneId, char.level);
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
                <p style={{ fontSize: "11px", color: "#aaa", marginTop: "4px" }}>
                  Defeat boss to unlock next area!
                </p>
              </div>
            )}

            {bossDefeated && (
              <div style={{ marginBottom: "15px", textAlign: "center", color: "#10b981", fontWeight: "bold", padding: "10px", background: "rgba(16, 185, 129, 0.1)", borderRadius: "4px", fontSize: "12px" }}>
                ✅ Boss Defeated! Next area unlocked. Travel now!
              </div>
            )}

          </div>

          {/* === 右欄 (Right Column) === */}
          <div style={{ flex: 1 }}>

            {/* 地圖系統 UI */}
            <div style={{ background: "#2a2a2a", padding: "10px", borderRadius: "6px", marginBottom: "15px", border: "1px solid #444" }}>
              <h3 style={{ margin: "0 0 8px 0", fontSize: "14px", color: "#fbbf24" }}>
                📍 {ZONES.find(z => z.id === currentZoneId)?.name || "Unknown"}
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
                      {isUnlocked ? `➡️ ${zone.name}` : `🔒 Lv.${zone.minLevel}`}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* 裝備系統 UI */}
            <div style={{ background: "#2a2a2a", padding: "10px", borderRadius: "6px", marginBottom: "15px", border: "1px solid #444" }}>
              <h3 style={{ margin: "0 0 8px 0", fontSize: "14px", color: "#fbbf24" }}>🎒 Inventory ({inventory.length})</h3>
              <div style={{ display: "flex", gap: "6px", marginBottom: "8px", fontSize: "11px" }}>
                <div style={{ flex: 1, background: "#111", padding: "6px", borderRadius: "4px", border: equipped.weapon ? "1px solid #059669" : "1px solid #444", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                  ⚔️ {equipped.weapon ? `${equipped.weapon.name} (+${equipped.weapon.stat})` : "No Weapon"}
                </div>
                <div style={{ flex: 1, background: "#111", padding: "6px", borderRadius: "4px", border: equipped.armor ? "1px solid #2563eb" : "1px solid #444", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                  🛡️ {equipped.armor ? `${equipped.armor.name} (+${equipped.armor.stat})` : "No Armor"}
                </div>
              </div>
              <div style={{ display: "flex", flexWrap: "wrap", gap: "3px", maxHeight: "70px", overflowY: "auto" }}>
                {inventory.length === 0 ? (
                  <div style={{ color: "#666", fontSize: "10px" }}>Empty...</div>
                ) : (
                  inventory.map((item) => (
                    <button
                      key={item.id}
                      onClick={() => {
                        setEquipped(prev => ({ ...prev, [item.type]: item }));
                        addLog(`⚔️ Equipped ${item.name}!`);
                      }}
                      style={{
                        fontSize: "9px",
                        padding: "2px 4px",
                        background: item.rarity === "epic" ? "#a855f7" : item.rarity === "rare" ? "#3b82f6" : "#555",
                        color: "white",
                        border: "none",
                        borderRadius: "3px",
                        cursor: "pointer",
                        maxWidth: "90px",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        whiteSpace: "nowrap"
                      }}
                    >
                      {item.name}
                    </button>
                  ))
                )}
              </div>
            </div>

            {/* 商店系統 UI */}
            <div style={{ background: "#2a2a2a", padding: "10px", borderRadius: "6px", border: "1px solid #444" }}>
              <h3 style={{ margin: "0 0 8px 0", fontSize: "14px", color: "#fbbf24" }}>🏪 Shop</h3>

              <div style={{ display: "flex", gap: "6px", marginBottom: "8px", flexWrap: "wrap" }}>
                <button
                  onClick={() => {
                    if (inventory.length === 0) {
                      addLog("❌ Inventory empty!");
                      return;
                    }
                    const item = inventory[0];
                    const sellPrice = item.stat * 2;
                    setInventory((prev) => prev.slice(1));
                    setChar((prev) => ({ ...prev, gold: prev.gold + sellPrice }));
                    addLog(`💰 Sold ${item.name} for ${sellPrice}g.`);
                  }}
                  style={{ flex: 1, padding: "6px", background: "#d97706", color: "white", border: "none", borderRadius: "4px", cursor: "pointer", fontSize: "10px" }}
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
                  style={{ flex: 1, padding: "6px", background: "#dc2626", color: "white", border: "none", borderRadius: "4px", cursor: "pointer", fontSize: "10px" }}
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
                  style={{ flex: 1, padding: "6px", background: "#2563eb", color: "white", border: "none", borderRadius: "4px", cursor: "pointer", fontSize: "10px" }}
                >
                  🧪 50g
                </button>
              </div>

              <div style={{ display: "flex", gap: "6px" }}>
                <button
                  onClick={() => {
                    if (hpPotions > 0 && char.hp < char.maxHp) {
                      const heal = Math.floor(char.maxHp * 0.5);
                      setChar((prev) => ({ ...prev, hp: Math.min(prev.maxHp, prev.hp + heal) }));
                      setHpPotions((prev) => prev - 1);
                      addLog(`🍖 +${heal} HP.`);
                    } else if (hpPotions === 0) {
                      addLog("❌ No HP Pots!");
                    } else {
                      addLog("❤️ HP Full!");
                    }
                  }}
                  disabled={hpPotions === 0}
                  style={{ flex: 1, padding: "6px", background: hpPotions > 0 ? "#ef4444" : "#555", color: "white", border: "none", borderRadius: "4px", cursor: "pointer", fontSize: "10px" }}
                >
                  Use HP ({hpPotions})
                </button>
                <button
                  onClick={() => {
                    if (mpPotions > 0 && char.mp < char.maxMp) {
                      const recover = Math.floor(char.maxMp * 0.5);
                      setChar((prev) => ({ ...prev, mp: Math.min(prev.maxMp, prev.mp + recover) }));
                      setMpPotions((prev) => prev - 1);
                      addLog(`🧪 +${recover} MP.`);
                    } else if (mpPotions === 0) {
                      addLog("❌ No MP Pots!");
                    } else {
                      addLog("💙 MP Full!");
                    }
                  }}
                  disabled={mpPotions === 0}
                  style={{ flex: 1, padding: "6px", background: mpPotions > 0 ? "#3b82f6" : "#555", color: "white", border: "none", borderRadius: "4px", cursor: "pointer", fontSize: "10px" }}
                >
                  Use MP ({mpPotions})
                </button>
                </div>
                </div>

                </div>
                </div>

                {/* === 戰鬥 Log (Full Width) === */}
                <div style={{ marginBottom: "15px" }}>
                <h3 style={{ margin: "0 0 8px 0", fontSize: "14px", color: "#fbbf24" }}>📜 Battle Log</h3>
                <div style={{ height: "150px", overflowY: "auto", background: "#111", border: "1px solid #444", borderRadius: "4px", padding: "8px", fontSize: "11px", fontFamily: "monospace" }}>
                {logs.map((log) => (
                <div key={log.id} style={{ marginBottom: "3px", borderBottom: "1px solid #222", paddingBottom: "2px" }}>
                {log.text}
                </div>
                ))}
                <div ref={logsEndRef} />
                {logs.length === 0 && <div style={{ color: "#666" }}>Battle started...</div>}
                </div>
                </div>

                {/* === 攻擊按鈕區 (Full Width) === */}
                <div style={{ display: "flex", gap: "10px" }}>
                <button
                onClick={() => battleAction(false)}
                disabled={char.mp < 2 || char.hp <= 0}
                style={{
                flex: 1,
                padding: "12px",
                background: char.mp < 2 ? "#555" : "#059669",
                color: "white",
                border: "none",
                borderRadius: "4px",
                cursor: char.mp < 2 ? "not-allowed" : "pointer",
                fontWeight: "bold",
                fontSize: "14px",
                }}
                >
                ⚔️ Attack (2 MP)
                </button>

                <button
                onClick={() => battleAction(true)}
                disabled={char.mp < 10 || char.hp <= 0}
                style={{
                flex: 1,
                padding: "12px",
                background: char.mp < 10 ? "#555" : "#7c3aed",
                color: "white",
                border: "none",
                borderRadius: "4px",
                cursor: char.mp < 10 ? "not-allowed" : "pointer",
                fontWeight: "bold",
                fontSize: "14px",
                }}
                >
                🔥 Skill (10 MP)
                </button>
                </div>

                {char.hp <= 0 && (
                <div style={{ marginTop: "10px", textAlign: "center", color: "#ef4444", fontWeight: "bold" }}>
                💀 You are defeated! Wait for respawn...
                </div>
                )}

                </div>
                </div>
                );
                }


                
