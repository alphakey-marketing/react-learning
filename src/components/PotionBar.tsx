import { Character } from "../types/character";

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
  return (
    <div
      style={{
        background: "#2a2a2a",
        padding: "10px",
        borderRadius: "6px",
        border: "1px solid #444",
        marginBottom: "15px",
      }}
    >
      <h3
        style={{
          margin: "0 0 8px 0",
          fontSize: "14px",
          color: "#fbbf24",
        }}
      >
        🧪 Potions
      </h3>

      {/* Use Potion Buttons */}
      <div style={{ display: "flex", gap: "6px", marginBottom: "10px" }}>
        <button
          onClick={onUseHpPotion}
          disabled={hpPotions === 0}
          style={{
            flex: 1,
            padding: "8px",
            background: hpPotions > 0 ? "#ef4444" : "#555",
            color: "white",
            border: "none",
            borderRadius: "4px",
            cursor: hpPotions > 0 ? "pointer" : "not-allowed",
            fontSize: "11px",
            fontWeight: "bold",
          }}
        >
          🍖 Use HP ({hpPotions})
        </button>
        <button
          onClick={onUseMpPotion}
          disabled={mpPotions === 0}
          style={{
            flex: 1,
            padding: "8px",
            background: mpPotions > 0 ? "#3b82f6" : "#555",
            color: "white",
            border: "none",
            borderRadius: "4px",
            cursor: mpPotions > 0 ? "pointer" : "not-allowed",
            fontSize: "11px",
            fontWeight: "bold",
          }}
        >
          🧪 Use MP ({mpPotions})
        </button>
      </div>

      {/* Auto-Use Settings */}
      <div
        style={{
          background: "#1a1a1a",
          padding: "8px",
          borderRadius: "4px",
          border: "1px solid #333",
        }}
      >
        <div style={{ fontSize: "11px", color: "#fbbf24", marginBottom: "6px" }}>
          ⚙️ Auto-Use Potions
        </div>
        
        {/* Auto HP */}
        <div style={{ marginBottom: "6px" }}>
          <label style={{ fontSize: "10px", color: "#aaa", display: "block", marginBottom: "3px" }}>
            Auto HP when below:
          </label>
          <div style={{ display: "flex", gap: "4px" }}>
            {[0, 30, 50, 70].map((percent) => (
              <button
                key={`hp-${percent}`}
                onClick={() => onSetAutoHpPercent(percent)}
                style={{
                  flex: 1,
                  padding: "4px",
                  background: autoHpPercent === percent ? "#dc2626" : "#444",
                  color: "white",
                  border: autoHpPercent === percent ? "1px solid #ef4444" : "none",
                  borderRadius: "4px",
                  cursor: "pointer",
                  fontSize: "9px",
                }}
              >
                {percent === 0 ? "OFF" : `${percent}%`}
              </button>
            ))}
          </div>
        </div>

        {/* Auto MP */}
        <div>
          <label style={{ fontSize: "10px", color: "#aaa", display: "block", marginBottom: "3px" }}>
            Auto MP when below:
          </label>
          <div style={{ display: "flex", gap: "4px" }}>
            {[0, 30, 50, 70].map((percent) => (
              <button
                key={`mp-${percent}`}
                onClick={() => onSetAutoMpPercent(percent)}
                style={{
                  flex: 1,
                  padding: "4px",
                  background: autoMpPercent === percent ? "#2563eb" : "#444",
                  color: "white",
                  border: autoMpPercent === percent ? "1px solid #3b82f6" : "none",
                  borderRadius: "4px",
                  cursor: "pointer",
                  fontSize: "9px",
                }}
              >
                {percent === 0 ? "OFF" : `${percent}%`}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
