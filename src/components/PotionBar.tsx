import { Character } from "../types/character";
import { HP_POTION_HEAL_FLAT, HP_POTION_HEAL_PERCENT } from "../data/constants";
import { useState } from "react";

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
  const [showAutoSettings, setShowAutoSettings] = useState(false);
  const hpHealAmount = HP_POTION_HEAL_FLAT + Math.floor(character.maxHp * HP_POTION_HEAL_PERCENT);

  return (
    <div
      style={{
        marginBottom: "8px",
      }}
    >
      {/* Horizontal quick-use strip */}
      <div
        style={{
          display: "flex",
          gap: "6px",
          alignItems: "stretch",
        }}
      >
        {/* HP Potion button */}
        <button
          onClick={onUseHpPotion}
          disabled={hpPotions === 0 || character.hp >= character.maxHp}
          style={{
            flex: 1,
            minHeight: "52px",
            padding: "6px 8px",
            background: hpPotions > 0 && character.hp < character.maxHp
              ? "linear-gradient(135deg, #ef4444, #dc2626)"
              : "#374151",
            color: "white",
            border: "none",
            borderRadius: "8px",
            cursor: hpPotions > 0 && character.hp < character.maxHp ? "pointer" : "not-allowed",
            opacity: hpPotions > 0 && character.hp < character.maxHp ? 1 : 0.5,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            gap: "2px",
            touchAction: "manipulation",
          }}
        >
          <span style={{ fontSize: "18px", lineHeight: 1 }}>🍖</span>
          <span style={{ fontSize: "11px", fontWeight: "bold" }}>HP ({hpPotions})</span>
          <span style={{ fontSize: "9px", opacity: 0.8 }}>+{hpHealAmount}</span>
        </button>

        {/* MP Potion button */}
        <button
          onClick={onUseMpPotion}
          disabled={mpPotions === 0 || character.mp >= character.maxMp}
          style={{
            flex: 1,
            minHeight: "52px",
            padding: "6px 8px",
            background: mpPotions > 0 && character.mp < character.maxMp
              ? "linear-gradient(135deg, #3b82f6, #2563eb)"
              : "#374151",
            color: "white",
            border: "none",
            borderRadius: "8px",
            cursor: mpPotions > 0 && character.mp < character.maxMp ? "pointer" : "not-allowed",
            opacity: mpPotions > 0 && character.mp < character.maxMp ? 1 : 0.5,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            gap: "2px",
            touchAction: "manipulation",
          }}
        >
          <span style={{ fontSize: "18px", lineHeight: 1 }}>🧪</span>
          <span style={{ fontSize: "11px", fontWeight: "bold" }}>MP ({mpPotions})</span>
        </button>

        {/* Auto-settings toggle */}
        <button
          onClick={() => setShowAutoSettings(prev => !prev)}
          style={{
            minWidth: "44px",
            minHeight: "52px",
            padding: "6px",
            background: showAutoSettings ? "#374151" : "rgba(55,65,81,0.5)",
            color: "#9ca3af",
            border: "1px solid #374151",
            borderRadius: "8px",
            cursor: "pointer",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            gap: "2px",
            touchAction: "manipulation",
          }}
        >
          <span style={{ fontSize: "16px" }}>⚙️</span>
          <span style={{ fontSize: "8px" }}>Auto</span>
        </button>
      </div>

      {/* Auto-use settings panel (expanded on demand) */}
      {showAutoSettings && (
        <div
          style={{
            marginTop: "6px",
            background: "#1a1a1a",
            padding: "8px",
            borderRadius: "8px",
            border: "1px solid #374151",
          }}
        >
          <div style={{ fontSize: "10px", color: "#fbbf24", marginBottom: "8px", fontWeight: "bold" }}>
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
                    minHeight: "32px",
                    padding: "4px",
                    background: autoHpPercent === percent ? "#dc2626" : "#374151",
                    color: "white",
                    border: autoHpPercent === percent ? "1px solid #ef4444" : "1px solid transparent",
                    borderRadius: "4px",
                    cursor: "pointer",
                    fontSize: "9px",
                    touchAction: "manipulation",
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
                    minHeight: "32px",
                    padding: "4px",
                    background: autoMpPercent === percent ? "#2563eb" : "#374151",
                    color: "white",
                    border: autoMpPercent === percent ? "1px solid #3b82f6" : "1px solid transparent",
                    borderRadius: "4px",
                    cursor: "pointer",
                    fontSize: "9px",
                    touchAction: "manipulation",
                  }}
                >
                  {percent === 0 ? "OFF" : `${percent}%`}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
