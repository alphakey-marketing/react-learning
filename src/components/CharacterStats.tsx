import { Character, CharacterStats as Stats } from "../types/character";
import { EquippedItems, calculateGearScore } from "../types/equipment";
import { calcPlayerAtk, calcPlayerMagicAtk, calcPlayerDef, calcCritChance, calcASPD } from "../logic/character";

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
  const expProgress = Math.floor((character.exp / character.expToNext) * 100);
  const hpPercent = Math.floor((character.hp / character.maxHp) * 100);
  const mpPercent = Math.floor((character.mp / character.maxMp) * 100);
  const jobExpPercent = Math.floor(
    (character.jobExp / character.jobExpToNext) * 100
  );

  // Calculate derived stats
  const weaponBonus = equipped.weapon?.stat || 0;
  const armorBonus = equipped.armor?.stat || 0;
  
  const atk = calcPlayerAtk(character, weaponBonus);
  const matk = calcPlayerMagicAtk(character);
  const def = calcPlayerDef(character, armorBonus);
  const crit = calcCritChance(character);
  const aspd = calcASPD(character).toFixed(2);

  // Calculate Total Combat Power
  const totalEquipPower = Object.values(equipped)
    .filter(item => item !== null)
    .reduce((sum, item) => sum + calculateGearScore(item as any), 0);
    
  const basePower = (character.level * 10) + (character.jobLevel * 5);
  const totalPower = basePower + totalEquipPower;

  // Get player avatar using character's avatar seed
  const getPlayerAvatar = () => {
    // Extract style and seed from avatarSeed
    const parts = character.avatarSeed.split('-');
    const style = parts[0] || 'adventurer';
    const seed = parts.slice(1).join('-') || 'default';
    return `https://api.dicebear.com/7.x/${style}/svg?seed=${seed}&backgroundColor=transparent`;
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
          {/* Avatar Container */}
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
            {/* Character Name */}
            <div style={{ fontSize: "16px", fontWeight: "bold", color: "#fbbf24", marginBottom: "4px" }}>
              {character.name}
            </div>
            
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: "2px" }}>
              <span style={{ fontSize: "18px", fontWeight: "bold", color: "#fff" }}>
                Lv.{character.level}
              </span>
              <span style={{ fontSize: "14px", color: "#a78bfa", fontWeight: "bold" }}>
                {character.jobClass}
              </span>
            </div>
            
            {/* Achievement Title Display */}
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

        {/* HP/MP Bars */}
        <div style={{ background: "rgba(0,0,0,0.2)", padding: "10px", borderRadius: "6px" }}>
          {/* HP */}
          <div style={{ display: "flex", justifyContent: "space-between", fontSize: "12px", marginBottom: "4px", fontWeight: "bold" }}>
            <span style={{ color: "#f87171" }}>HP</span>
            <span>{character.hp} / {character.maxHp}</span>
          </div>
          <div style={{ width: "100%", height: "14px", background: "#333", borderRadius: "7px", overflow: "hidden", marginBottom: "10px", border: "1px solid #222" }}>
            <div style={{ width: `${hpPercent}%`, height: "100%", background: "linear-gradient(90deg, #ef4444, #f87171)", transition: "width 0.2s" }} />
          </div>

          {/* MP */}
          <div style={{ display: "flex", justifyContent: "space-between", fontSize: "12px", marginBottom: "4px", fontWeight: "bold" }}>
            <span style={{ color: "#60a5fa" }}>MP</span>
            <span>{character.mp} / {character.maxMp}</span>
          </div>
          <div style={{ width: "100%", height: "10px", background: "#333", borderRadius: "5px", overflow: "hidden", marginBottom: "15px", border: "1px solid #222" }}>
            <div style={{ width: `${mpPercent}%`, height: "100%", background: "linear-gradient(90deg, #3b82f6, #60a5fa)", transition: "width 0.2s" }} />
          </div>

          {/* EXP Bars */}
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
        {/* Base Stats Column */}
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
            <span style={{ color: character.statPoints > 0 ? "#22c55e" : "#888", fontWeight: "bold" }}>
              Pts: {character.statPoints}
            </span>
          </div>
          {(["str", "agi", "vit", "int", "dex", "luk"] as const).map((key) => (
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
              <span style={{ width: "24px", fontWeight: "bold" }}>{character.stats[key]}</span>
              <button
                onClick={() => onAddStat(key)}
                disabled={character.statPoints <= 0}
                style={{
                  padding: "0 6px",
                  fontSize: "12px",
                  borderRadius: "3px",
                  border: "none",
                  background: character.statPoints > 0 ? "linear-gradient(to bottom, #22c55e, #16a34a)" : "#333",
                  color: "white",
                  cursor: character.statPoints > 0 ? "pointer" : "not-allowed",
                  opacity: character.statPoints > 0 ? 1 : 0.5,
                  fontWeight: "bold"
                }}
              >
                +
              </button>
            </div>
          ))}
        </div>

        {/* Derived Stats Column */}
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
          
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "4px" }}>
            <span style={{ color: "#bbb" }}>ATK</span>
            <span style={{ fontWeight: "bold", color: "#f87171" }}>{atk}</span>
          </div>
          
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "4px" }}>
            <span style={{ color: "#bbb" }}>MATK</span>
            <span style={{ fontWeight: "bold", color: "#c084fc" }}>{matk}</span>
          </div>
          
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "4px" }}>
            <span style={{ color: "#bbb" }}>DEF</span>
            <span style={{ fontWeight: "bold", color: "#60a5fa" }}>{def}</span>
          </div>
          
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "4px" }}>
            <span style={{ color: "#bbb" }}>CRIT</span>
            <span style={{ fontWeight: "bold", color: "#fbbf24" }}>{crit}%</span>
          </div>

          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "4px" }}>
            <span style={{ color: "#bbb" }}>ASPD</span>
            <span style={{ fontWeight: "bold", color: "#2dd4bf" }}>{aspd} <span style={{fontSize: "9px", color: "#777"}}>/s</span></span>
          </div>
          
          {/* Helpful tooltips for class scaling */}
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
