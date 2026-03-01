import { Character, CharacterStats as Stats } from "../types/character";
import { EquippedItems } from "../types/equipment";
import { calcPlayerAtk, calcPlayerMagicAtk, calcPlayerDef, calcCritChance } from "../logic/character";

interface CharacterStatsProps {
  character: Character;
  equipped: EquippedItems;
  onAddStat: (stat: keyof Stats) => void;
  onOpenSkills: () => void;
}

export function CharacterStats({
  character,
  equipped,
  onAddStat,
  onOpenSkills,
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

  return (
    <div>
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
            Lv.{character.level} {character.jobClass}
          </strong>
          <span>
            HP: {character.hp}/{character.maxHp}
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
          <span>Job Lv.{character.jobLevel}</span>
          <span>
            Job EXP: {character.jobExp}/{character.jobExpToNext}
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
            MP: {character.mp}/{character.maxMp}
          </span>
          <span>
            EXP: {character.exp}/{character.expToNext}
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
          💰 Gold: {character.gold}
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
            <span style={{ color: character.statPoints > 0 ? "#22c55e" : "#888" }}>
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
                  fontSize: "10px",
                  borderRadius: "3px",
                  border: "none",
                  background: character.statPoints > 0 ? "#22c55e" : "#444",
                  color: "white",
                  cursor: character.statPoints > 0 ? "pointer" : "not-allowed",
                  opacity: character.statPoints > 0 ? 1 : 0.5,
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
          
          {/* Helpful tooltips for class scaling */}
          <div style={{ marginTop: "12px", fontSize: "9px", color: "#666", fontStyle: "italic", borderTop: "1px solid #222", paddingTop: "4px" }}>
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
            padding: "8px",
            background: "#7c3aed",
            color: "white",
            border: "none",
            borderRadius: "4px",
            cursor: "pointer",
            fontWeight: "bold",
            fontSize: "12px",
            boxShadow: character.skillPoints > 0 ? "0 0 10px rgba(124, 58, 237, 0.5)" : "none",
            animation: character.skillPoints > 0 ? "pulse 2s infinite" : "none",
          }}
        >
          📖 Skills {character.skillPoints > 0 ? `(Points: ${character.skillPoints}!)` : ""}
        </button>
      </div>
    </div>
  );
}
