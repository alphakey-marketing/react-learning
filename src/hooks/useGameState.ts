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

  const weaponBonus = useMemo(() => equipped.weapon?.atk || equipped.weapon?.stat || 0, [equipped.weapon]);
  const armorBonus = useMemo(() => equipped.armor?.def || equipped.armor?.stat || 0, [equipped.armor]);
  
  const attacksPerSecond = useMemo(() => 
    calcASPD(char), 
    [char.stats.agi, char.stats.dex, char.level]
  );

  // Continue with all the existing functions from the previous useGameState...
  // (Keeping the rest unchanged for brevity - they remain the same)
  
  function equipItem(item: Equipment) {
    // Handle accessory slots
    if (item.type === "accessory") {
      if (!equipped.accessory1) {
        setEquipped((prev) => ({ ...prev, accessory1: item }));
      } else if (!equipped.accessory2) {
        setEquipped((prev) => ({ ...prev, accessory2: item }));
      } else {
        // Replace accessory1 if both are filled
        setEquipped((prev) => ({ ...prev, accessory1: item }));
      }
    } else {
      setEquipped((prev) => ({ ...prev, [item.type]: item }));
    }
    
    setInventory((prev) => prev.filter((i) => i.id !== item.id));
    addLog(`⚔️ Equipped ${item.name}!`);
  }

  // Keep all other existing functions the same...
  // (I'm omitting the full function list since they remain unchanged)

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
    // ... all other existing functions
  };
}
