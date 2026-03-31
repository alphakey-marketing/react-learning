import { Character } from "../types/character";
import { HP_POTION_HEAL_FLAT, HP_POTION_HEAL_PERCENT } from "../data/constants";

interface PotionBarProps {
  character: Character;
  hpPotions: number;
  mpPotions: number;
  autoHpPercent: number;
  autoMpPercent: number;
  onUseHpPotion: () => void;
  onUseMpPotion: () => void;
  onSetAutoHpPercent: (percent: number) => void;
  onSetAutoMpPercent: (percent: number) => void;
}

export function PotionBar({
  character,
  hpPotions,
  mpPotions,
  autoHpPercent,
  autoMpPercent,
  onUseHpPotion,
  onUseMpPotion,
  onSetAutoHpPercent,
  onSetAutoMpPercent,
}: PotionBarProps) {
  const hpHealAmount = HP_POTION_HEAL_FLAT + Math.floor(character.maxHp * HP_POTION_HEAL_PERCENT);

  return (
    <div style={{ marginBottom: "8px" }}>

      {/* Auto-use settings — always visible and prominent */}
      <div
        style={{
          background: "#1a1a1a",
          padding: "10px",
          borderRadius: "8px",
          border: "1px solid #4b5563",
          marginBottom: "8px",
        }}
      >
        <div style={{ fontSize: "11px", color: "#fbbf24", marginBottom: "8px", fontWeight: "bold" }}>
          ⚙️ Auto-Use Potions
        </div>

        {/* Auto HP */}
        <div style={{ marginBottom: "8px" }}>
          <label style={{ fontSize: "10px", color: "#9ca3af", display: "block", marginBottom: "4px" }}>
            Auto HP when below:
          </label>
          <div style={{ display: "flex", gap: "4px" }}>
            {[0, 30, 50, 70].map((percent) => (
              <button
                key={`hp-${percent}`}
                onClick={() => onSetAutoHpPercent(percent)}
                style={{
                  flex: 1,
                  minHeight: "40px",
                  padding: "6px 4px",
                  background: autoHpPercent === percent ? "#dc2626" : "#374151",
                  color: "white",
                  border: autoHpPercent === percent ? "2px solid #ef4444" : "1px solid transparent",
                  borderRadius: "6px",
                  cursor: "pointer",
                  fontSize: "11px",
                  fontWeight: autoHpPercent === percent ? "bold" : "normal",
                  touchAction: "manipulation",
                  boxShadow: autoHpPercent === percent ? "0 0 8px rgba(239,68,68,0.5)" : "none",
                }}
              >
                {percent === 0 ? "OFF" : `${percent}%`}
              </button>
            ))}
          </div>
        </div>

        {/* Auto MP */}
        <div>
          <label style={{ fontSize: "10px", color: "#9ca3af", display: "block", marginBottom: "4px" }}>
            Auto MP when below:
          </label>
          <div style={{ display: "flex", gap: "4px" }}>
            {[0, 30, 50, 70].map((percent) => (
              <button
                key={`mp-${percent}`}
                onClick={() => onSetAutoMpPercent(percent)}
                style={{
                  flex: 1,
                  minHeight: "40px",
                  padding: "6px 4px",
                  background: autoMpPercent === percent ? "#2563eb" : "#374151",
                  color: "white",
                  border: autoMpPercent === percent ? "2px solid #3b82f6" : "1px solid transparent",
                  borderRadius: "6px",
                  cursor: "pointer",
                  fontSize: "11px",
                  fontWeight: autoMpPercent === percent ? "bold" : "normal",
                  touchAction: "manipulation",
                  boxShadow: autoMpPercent === percent ? "0 0 8px rgba(59,130,246,0.5)" : "none",
                }}
              >
                {percent === 0 ? "OFF" : `${percent}%`}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Manual quick-use strip — smaller */}
      <div style={{ display: "flex", gap: "6px", alignItems: "stretch" }}>
        {/* HP Potion button */}
        <button
          onClick={onUseHpPotion}
          disabled={hpPotions === 0 || character.hp >= character.maxHp}
          style={{
            flex: 1,
            minHeight: "36px",
            padding: "4px 6px",
            background: hpPotions > 0 && character.hp < character.maxHp
              ? "linear-gradient(135deg, #ef4444, #dc2626)"
              : "#374151",
            color: "white",
            border: "none",
            borderRadius: "6px",
            cursor: hpPotions > 0 && character.hp < character.maxHp ? "pointer" : "not-allowed",
            opacity: hpPotions > 0 && character.hp < character.maxHp ? 1 : 0.5,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: "4px",
            touchAction: "manipulation",
            fontSize: "10px",
            fontWeight: "bold",
          }}
        >
          <span style={{ fontSize: "13px", lineHeight: 1 }}>🍖</span>
          <span>HP ({hpPotions}) +{hpHealAmount}</span>
        </button>

        {/* MP Potion button */}
        <button
          onClick={onUseMpPotion}
          disabled={mpPotions === 0 || character.mp >= character.maxMp}
          style={{
            flex: 1,
            minHeight: "36px",
            padding: "4px 6px",
            background: mpPotions > 0 && character.mp < character.maxMp
              ? "linear-gradient(135deg, #3b82f6, #2563eb)"
              : "#374151",
            color: "white",
            border: "none",
            borderRadius: "6px",
            cursor: mpPotions > 0 && character.mp < character.maxMp ? "pointer" : "not-allowed",
            opacity: mpPotions > 0 && character.mp < character.maxMp ? 1 : 0.5,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: "4px",
            touchAction: "manipulation",
            fontSize: "10px",
            fontWeight: "bold",
          }}
        >
          <span style={{ fontSize: "13px", lineHeight: 1 }}>🧪</span>
          <span>MP ({mpPotions})</span>
        </button>
      </div>
    </div>
  );
}
