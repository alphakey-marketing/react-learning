import { useState, useMemo } from "react";
import { Character, CharacterStats as Stats } from "../types/character";
import { EquippedItems, calculateGearScore, calculateEquipmentStats } from "../types/equipment";
import { calcPlayerAtk, calcPlayerMagicAtk, calcPlayerDef, calcCritChance, calcASPD, calcMaxHp, calcMaxMp, getTotalStats } from "../logic/character";

interface CharacterStatsProps {
  character: Character;
  equipped: EquippedItems;
  onAddStat: (stat: keyof Stats) => void;
  onOpenSkills: () => void;
  selectedTitle?: string;
}

export function CharacterStats({
  character,
  equipped,
  onAddStat,
  onOpenSkills,
  selectedTitle,
}: CharacterStatsProps) {
  // Pending stats system
  const [pendingStats, setPendingStats] = useState<Record<keyof Stats, number>>({
    str: 0,
    agi: 0,
    vit: 0,
    int: 0,
    dex: 0,
    luk: 0,
  });

  const totalPendingPoints = Object.values(pendingStats).reduce((sum, val) => sum + val, 0);
  const remainingPoints = character.statPoints - totalPendingPoints;
  const hasPendingChanges = totalPendingPoints > 0;

  const addPendingStat = (stat: keyof Stats) => {
    if (remainingPoints > 0) {
      setPendingStats(prev => ({ ...prev, [stat]: prev[stat] + 1 }));
    }
  };

  const removePendingStat = (stat: keyof Stats) => {
    if (pendingStats[stat] > 0) {
      setPendingStats(prev => ({ ...prev, [stat]: prev[stat] - 1 }));
    }
  };

  const confirmStats = () => {
    // Apply all pending changes
    Object.entries(pendingStats).forEach(([stat, amount]) => {
      for (let i = 0; i < amount; i++) {
        onAddStat(stat as keyof Stats);
      }
    });
    // Reset pending
    setPendingStats({ str: 0, agi: 0, vit: 0, int: 0, dex: 0, luk: 0 });
  };

  const resetPending = () => {
    setPendingStats({ str: 0, agi: 0, vit: 0, int: 0, dex: 0, luk: 0 });
  };

  const expProgress = Math.floor((character.exp / character.expToNext) * 100);
  const hpPercent = Math.floor((character.hp / character.maxHp) * 100);
  const mpPercent = Math.floor((character.mp / character.maxMp) * 100);
  const jobExpPercent = Math.floor(
    (character.jobExp / character.jobExpToNext) * 100
  );

  // Calculate derived stats
  const equipStats = calculateEquipmentStats(equipped);
  const armorBonus = equipStats.totalDef;
  const totalStats = getTotalStats(character, equipStats);
  
  // Debug logging
  console.log('[CharacterStats] Equipment stats:', {
    weaponAtk: equipStats.weaponAtk,
    weaponLevel: equipStats.weaponLevel,
    weaponRefine: equipStats.weaponRefine,
    equipBonusAtk: equipStats.equipBonusAtk,
    weapon: equipped.weapon,
    basicStats: {
      str: equipStats.bonusStr,
      agi: equipStats.bonusAgi,
      vit: equipStats.bonusVit,
      int: equipStats.bonusInt,
      dex: equipStats.bonusDex,
      luk: equipStats.bonusLuk
    }
  });
  
  const atkRange = calcPlayerAtk(
    character, 
    equipStats.weaponAtk, 
    equipStats.weaponLevel, 
    equipStats.weaponRefine, 
    equipStats.equipBonusAtk,
    equipStats
  );
  
  console.log('[CharacterStats] ATK Range:', atkRange);
  
  const atkDisplay = atkRange.min === atkRange.max 
    ? `${atkRange.max}` 
    : `${atkRange.min} ~ ${atkRange.max}`;
  
  const matk = calcPlayerMagicAtk(character, equipStats);
  const def = calcPlayerDef(character, armorBonus, equipStats);
  const crit = calcCritChance(character, equipStats);
  const aspd = calcASPD(character, equipStats).toFixed(2);

  // Format DEF string: e.g. "12 + 15%"
  const defDisplay = `${def.softDef} + ${def.hardDefPercent}%`;

  // Calculate preview stats with pending changes
  const previewStats = useMemo(() => {
    if (!hasPendingChanges) return null;

    const previewChar: Character = {
      ...character,
      stats: {
        str: character.stats.str + pendingStats.str,
        agi: character.stats.agi + pendingStats.agi,
        vit: character.stats.vit + pendingStats.vit,
        int: character.stats.int + pendingStats.int,
        dex: character.stats.dex + pendingStats.dex,
        luk: character.stats.luk + pendingStats.luk,
      },
    };
    
    const previewTotalStats = getTotalStats(previewChar, equipStats);

    const previewAtkRange = calcPlayerAtk(
      previewChar, 
      equipStats.weaponAtk, 
      equipStats.weaponLevel, 
      equipStats.weaponRefine, 
      equipStats.equipBonusAtk,
      equipStats
    );
    const previewAtkDisplay = previewAtkRange.min === previewAtkRange.max 
      ? `${previewAtkRange.max}` 
      : `${previewAtkRange.min} ~ ${previewAtkRange.max}`;
    
    const previewMatk = calcPlayerMagicAtk(previewChar, equipStats);
    const previewDef = calcPlayerDef(previewChar, armorBonus, equipStats);
    const previewCrit = calcCritChance(previewChar, equipStats);
    const previewAspd = calcASPD(previewChar, equipStats).toFixed(2);
    const previewMaxHp = calcMaxHp(character.level, previewTotalStats.vit, character.jobClass);
    const previewMaxMp = calcMaxMp(character.level, previewTotalStats.int, character.jobClass);

    return {
      atk: previewAtkDisplay,
      matk: previewMatk,
      def: previewDef,
      crit: previewCrit,
      aspd: previewAspd,
      maxHp: previewMaxHp,
      maxMp: previewMaxMp,
    };
  }, [hasPendingChanges, character, pendingStats, equipStats, armorBonus]);

  const previewDefDisplay = previewStats ? `${previewStats.def.softDef} + ${previewStats.def.hardDefPercent}%` : null;

  // Calculate Total Combat Power
  const totalEquipPower = Object.values(equipped)
    .filter(item => item !== null)
    .reduce((sum, item) => sum + calculateGearScore(item as any), 0);
    
  const basePower = (character.level * 10) + (character.jobLevel * 5);
  const totalPower = basePower + totalEquipPower;

  // Get player avatar based on job class
  const getPlayerAvatar = () => {
    const seed = character.jobClass + "Hero";
    return `https://api.dicebear.com/7.x/adventurer/svg?seed=${seed}&backgroundColor=transparent`;
  };

  const renderStatWithPreview = (label: string, current: number | string, preview: number | string | null, color: string) => {
    const diffNode = (() => {
      if (preview === null) return null;
      if (typeof current === 'string' || typeof preview === 'string') {
        // Just show the new string if they differ
        if (current !== preview) {
          return (
            <span style={{ color: "#22c55e", marginLeft: "4px" }}>
              → {preview}
            </span>
          );
        }
        return null;
      }
      
      const diff = preview - current;
      if (diff !== 0) {
        return (
          <span style={{ color: "#22c55e", marginLeft: "4px" }}>
            → {preview} (+{diff > 0 ? diff.toFixed(label === "ASPD" ? 2 : 0) : 0})
          </span>
        );
      }
      return null;
    })();

    return (
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "4px" }}>
        <span style={{ color: "#bbb" }}>{label}</span>
        <span style={{ fontWeight: "bold", color }}>
          {current}
          {diffNode}
        </span>
      </div>
    );
  };

  const getEquipmentBonusForStat = (statKey: keyof Stats) => {
    const bonusMap: Record<keyof Stats, number> = {
      str: equipStats.bonusStr,
      agi: equipStats.bonusAgi,
      vit: equipStats.bonusVit,
      int: equipStats.bonusInt,
      dex: equipStats.bonusDex,
      luk: equipStats.bonusLuk
    };
    return bonusMap[statKey];
  };

  return (
    <div>
      <div
        style={{
          marginBottom: "15px",
          background: "linear-gradient(135deg, #2a2a2a 0%, #1f1f1f 100%)",
          padding: "15px",
          borderRadius: "8px",
          border: "1px solid #444",
          position: "relative",
          marginTop: "10px",
        }}
      >
        {/* Total Combat Power Badge */}
        <div style={{
          position: "absolute",
          top: "-16px",
          left: "50%",
          transform: "translateX(-50%)",
          background: "linear-gradient(90deg, #b45309, #f59e0b, #b45309)",
          padding: "6px 20px",
          borderRadius: "24px",
          fontWeight: "900",
          color: "white",
          fontSize: "16px",
          boxShadow: "0 6px 15px rgba(245, 158, 11, 0.5)",
          border: "2px solid #fcd34d",
          whiteSpace: "nowrap",
          zIndex: 10,
          textShadow: "1px 1px 2px rgba(0,0,0,0.5)"
        }}>
          ⚔️ Combat Power: {totalPower}
        </div>

        {/* Character Header with Avatar */}
        <div style={{
          display: "flex",
          alignItems: "center",
          gap: "15px",
          marginTop: "12px",
          marginBottom: "15px",
          padding: "10px",
          background: "rgba(0,0,0,0.3)",
          borderRadius: "8px",
          border: "1px solid #333"
        }}>
          <div style={{
            width: "60px",
            height: "60px",
            background: "#111",
            borderRadius: "50%",
            border: "2px solid #fcd34d",
            overflow: "hidden",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            boxShadow: "0 0 10px rgba(251, 191, 36, 0.2)"
          }}>
            <img 
              src={getPlayerAvatar()} 
              alt="Player" 
              style={{ width: "120%", height: "120%", objectFit: "cover", marginTop: "10px" }} 
            />
          </div>

          <div style={{ flex: 1 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: "2px" }}>
              <span style={{ fontSize: "18px", fontWeight: "bold", color: "#fff" }}>
                Lv.{character.level}
              </span>
              <span style={{ fontSize: "14px", color: "#a78bfa", fontWeight: "bold" }}>
                {character.jobClass}
              </span>
            </div>
            
            {selectedTitle && (
              <div
                style={{
                  fontSize: "11px",
                  color: "#fbbf24",
                  fontStyle: "italic",
                  display: "flex",
                  alignItems: "center",
                  gap: "4px",
                }}
              >
                <span>✨</span>
                <span>"{selectedTitle}"</span>
              </div>
            )}
            
            <div style={{ fontSize: "11px", color: "#888", marginTop: "4px" }}>
              Job Lv.{character.jobLevel}
            </div>
          </div>
        </div>

        {/* HP/MP Bars with Preview */}
        <div style={{ background: "rgba(0,0,0,0.2)", padding: "10px", borderRadius: "6px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", fontSize: "12px", marginBottom: "4px", fontWeight: "bold" }}>
            <span style={{ color: "#f87171" }}>HP</span>
            <span>
              {character.hp} / {character.maxHp}
              {previewStats && previewStats.maxHp !== character.maxHp && (
                <span style={{ color: "#22c55e", marginLeft: "4px" }}>
                  → {previewStats.maxHp} (+{previewStats.maxHp - character.maxHp})
                </span>
              )}
            </span>
          </div>
          <div style={{ width: "100%", height: "14px", background: "#333", borderRadius: "7px", overflow: "hidden", marginBottom: "10px", border: "1px solid #222" }}>
            <div style={{ width: `${hpPercent}%`, height: "100%", background: "linear-gradient(90deg, #ef4444, #f87171)", transition: "width 0.2s" }} />
          </div>

          <div style={{ display: "flex", justifyContent: "space-between", fontSize: "12px", marginBottom: "4px", fontWeight: "bold" }}>
            <span style={{ color: "#60a5fa" }}>MP</span>
            <span>
              {character.mp} / {character.maxMp}
              {previewStats && previewStats.maxMp !== character.maxMp && (
                <span style={{ color: "#22c55e", marginLeft: "4px" }}>
                  → {previewStats.maxMp} (+{previewStats.maxMp - character.maxMp})
                </span>
              )}
            </span>
          </div>
          <div style={{ width: "100%", height: "10px", background: "#333", borderRadius: "5px", overflow: "hidden", marginBottom: "15px", border: "1px solid #222" }}>
            <div style={{ width: `${mpPercent}%`, height: "100%", background: "linear-gradient(90deg, #3b82f6, #60a5fa)", transition: "width 0.2s" }} />
          </div>

          <div style={{ display: "flex", gap: "10px" }}>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: "9px", color: "#10b981", marginBottom: "2px", textAlign: "right" }}>Base EXP: {Math.floor(expProgress)}%</div>
              <div style={{ width: "100%", height: "4px", background: "#333", borderRadius: "2px", overflow: "hidden" }}>
                <div style={{ width: `${expProgress}%`, height: "100%", background: "#10b981", transition: "width 0.2s" }} />
              </div>
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: "9px", color: "#f97316", marginBottom: "2px", textAlign: "right" }}>Job EXP: {Math.floor(jobExpPercent)}%</div>
              <div style={{ width: "100%", height: "4px", background: "#333", borderRadius: "2px", overflow: "hidden" }}>
                <div style={{ width: `${jobExpPercent}%`, height: "100%", background: "#f97316", transition: "width 0.2s" }} />
              </div>
            </div>
          </div>
        </div>

        <div
          style={{
            textAlign: "center",
            color: "#fbbf24",
            fontWeight: "bold",
            fontSize: "15px",
            marginTop: "12px",
            padding: "8px",
            background: "rgba(0,0,0,0.3)",
            borderRadius: "6px",
            border: "1px solid #444"
          }}
        >
          💰 Gold: {character.gold.toLocaleString()}
        </div>
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: "8px",
        }}
      >
        {/* Base Stats Column with Pending System */}
        <div
          style={{
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
              marginBottom: "6px",
              borderBottom: "1px solid #333",
              paddingBottom: "4px",
            }}
          >
            <span style={{ color: "#a78bfa", fontWeight: "bold" }}>📊 Base Stats</span>
            <span style={{ color: remainingPoints > 0 ? "#22c55e" : "#888", fontWeight: "bold" }}>
              Pts: {remainingPoints}
            </span>
          </div>
          {(["str", "agi", "vit", "int", "dex", "luk"] as const).map((key) => {
            const equipBonus = getEquipmentBonusForStat(key);
            
            return (
              <div
                key={key}
                style={{
                  display: "flex",
                  alignItems: "center",
                  marginBottom: "3px",
                  gap: "4px",
                }}
              >
                <span style={{ width: "35px", textTransform: "uppercase", color: "#bbb" }}>
                  {key}
                </span>
                <span style={{ width: "auto", fontWeight: "bold", minWidth: "24px" }}>
                  {character.stats[key]}
                  {equipBonus > 0 && (
                    <span style={{ color: "#22c55e", marginLeft: "2px", fontSize: "10px" }} title={`+${equipBonus} from equipment`}>
                      +{equipBonus}
                    </span>
                  )}
                  {pendingStats[key] > 0 && (
                    <span style={{ color: "#f59e0b", marginLeft: "4px" }}>
                      (+{pendingStats[key]})
                    </span>
                  )}
                </span>
                <div style={{ marginLeft: "auto", display: "flex", gap: "2px" }}>
                  <button
                    onClick={() => removePendingStat(key)}
                    disabled={pendingStats[key] === 0}
                    style={{
                      padding: "0 6px",
                      fontSize: "12px",
                      borderRadius: "3px",
                      border: "none",
                      background: pendingStats[key] > 0 ? "linear-gradient(to bottom, #dc2626, #991b1b)" : "#333",
                      color: "white",
                      cursor: pendingStats[key] > 0 ? "pointer" : "not-allowed",
                      opacity: pendingStats[key] > 0 ? 1 : 0.3,
                      fontWeight: "bold"
                    }}
                  >
                    -
                  </button>
                  <button
                    onClick={() => addPendingStat(key)}
                    disabled={remainingPoints <= 0}
                    style={{
                      padding: "0 6px",
                      fontSize: "12px",
                      borderRadius: "3px",
                      border: "none",
                      background: remainingPoints > 0 ? "linear-gradient(to bottom, #22c55e, #16a34a)" : "#333",
                      color: "white",
                      cursor: remainingPoints > 0 ? "pointer" : "not-allowed",
                      opacity: remainingPoints > 0 ? 1 : 0.3,
                      fontWeight: "bold"
                    }}
                  >
                    +
                  </button>
                </div>
              </div>
            );
          })}

          {/* Confirmation Buttons */}
          {hasPendingChanges && (
            <div style={{ marginTop: "8px", display: "flex", gap: "4px" }}>
              <button
                onClick={confirmStats}
                style={{
                  flex: 1,
                  padding: "6px",
                  fontSize: "11px",
                  background: "linear-gradient(to bottom, #22c55e, #16a34a)",
                  color: "white",
                  border: "none",
                  borderRadius: "4px",
                  cursor: "pointer",
                  fontWeight: "bold",
                }}
              >
                ✓ Confirm
              </button>
              <button
                onClick={resetPending}
                style={{
                  flex: 1,
                  padding: "6px",
                  fontSize: "11px",
                  background: "linear-gradient(to bottom, #dc2626, #991b1b)",
                  color: "white",
                  border: "none",
                  borderRadius: "4px",
                  cursor: "pointer",
                  fontWeight: "bold",
                }}
              >
                ✕ Reset
              </button>
            </div>
          )}
        </div>

        {/* Derived Stats Column with Preview */}
        <div
          style={{
            background: "#111",
            padding: "8px",
            borderRadius: "4px",
            fontSize: "11px",
          }}
        >
          <div
            style={{
              marginBottom: "6px",
              borderBottom: "1px solid #333",
              paddingBottom: "4px",
            }}
          >
            <span style={{ color: "#38bdf8", fontWeight: "bold" }}>⚔️ Combat Stats</span>
          </div>
          
          {renderStatWithPreview("ATK", atkDisplay, previewStats?.atk || null, "#f87171")}
          {renderStatWithPreview("MATK", matk, previewStats?.matk || null, "#c084fc")}
          {renderStatWithPreview("DEF", defDisplay, previewDefDisplay, "#60a5fa")}
          {renderStatWithPreview("CRIT", crit + "%", previewStats ? previewStats.crit + "%" : null, "#fbbf24")}
          {renderStatWithPreview("ASPD", aspd, previewStats?.aspd || null, "#2dd4bf")}
          
          <div style={{ marginTop: "8px", fontSize: "9px", color: "#666", fontStyle: "italic", borderTop: "1px solid #222", paddingTop: "4px" }}>
            {character.jobClass === "Swordsman" || character.jobClass === "Knight" ? "STR increases ATK greatly" : ""}
            {character.jobClass === "Archer" || character.jobClass === "Hunter" ? "DEX & AGI increase ATK" : ""}
            {character.jobClass === "Mage" || character.jobClass === "Wizard" ? "INT increases MATK" : ""}
            {character.jobClass === "Novice" ? "Distribute stats to prepare for job change" : ""}
          </div>
        </div>
      </div>

      <div style={{ marginTop: "10px" }}>
        <button
          onClick={onOpenSkills}
          style={{
            width: "100%",
            padding: "10px",
            background: "linear-gradient(to right, #7c3aed, #6d28d9)",
            color: "white",
            border: "1px solid #8b5cf6",
            borderRadius: "6px",
            cursor: "pointer",
            fontWeight: "bold",
            fontSize: "13px",
            boxShadow: character.skillPoints > 0 ? "0 0 15px rgba(124, 58, 237, 0.6)" : "none",
            animation: character.skillPoints > 0 ? "pulse 2s infinite" : "none",
            transition: "all 0.2s"
          }}
        >
          📖 Skill Tree {character.skillPoints > 0 ? `(Points: ${character.skillPoints}!)` : ""}
        </button>
      </div>
    </div>
  );
}