import { Character } from "../types/character";
import { HP_POTION_COST, MP_POTION_COST } from "../data/constants";

interface ShopProps {
  character: Character;
  hpPotions: number;
  mpPotions: number;
  isInTown: boolean;
  autoHpPercent: number;
  autoMpPercent: number;
  onSellItem: () => void;
  onBuyHpPotion: (amount: number) => void;
  onBuyMpPotion: (amount: number) => void;
  onUseHpPotion: () => void;
  onUseMpPotion: () => void;
  onSetAutoHpPercent: (percent: number) => void;
  onSetAutoMpPercent: (percent: number) => void;
}

export function Shop({
  character,
  hpPotions,
  mpPotions,
  isInTown,
  autoHpPercent,
  autoMpPercent,
  onSellItem,
  onBuyHpPotion,
  onBuyMpPotion,
  onUseHpPotion,
  onUseMpPotion,
  onSetAutoHpPercent,
  onSetAutoMpPercent,
}: ShopProps) {
  return (
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
        🏪 Shop {!isInTown && "(❌ Town Only)"}
      </h3>

      {/* Bulk Buy Buttons - Only in Town */}
      {isInTown && (
        <div style={{ marginBottom: "8px" }}>
          <div style={{ fontSize: "11px", color: "#aaa", marginBottom: "4px" }}>
            Buy HP Potions ({HP_POTION_COST}g each):
          </div>
          <div style={{ display: "flex", gap: "4px", marginBottom: "6px" }}>
            <button
              onClick={() => onBuyHpPotion(1)}
              style={{
                flex: 1,
                padding: "4px",
                background: "#dc2626",
                color: "white",
                border: "none",
                borderRadius: "4px",
                cursor: "pointer",
                fontSize: "10px",
              }}
            >
              🍖 +1
            </button>
            <button
              onClick={() => onBuyHpPotion(5)}
              style={{
                flex: 1,
                padding: "4px",
                background: "#dc2626",
                color: "white",
                border: "none",
                borderRadius: "4px",
                cursor: "pointer",
                fontSize: "10px",
              }}
            >
              🍖 +5
            </button>
            <button
              onClick={() => onBuyHpPotion(10)}
              style={{
                flex: 1,
                padding: "4px",
                background: "#dc2626",
                color: "white",
                border: "none",
                borderRadius: "4px",
                cursor: "pointer",
                fontSize: "10px",
              }}
            >
              🍖 +10
            </button>
          </div>

          <div style={{ fontSize: "11px", color: "#aaa", marginBottom: "4px" }}>
            Buy MP Potions ({MP_POTION_COST}g each):
          </div>
          <div style={{ display: "flex", gap: "4px", marginBottom: "8px" }}>
            <button
              onClick={() => onBuyMpPotion(1)}
              style={{
                flex: 1,
                padding: "4px",
                background: "#2563eb",
                color: "white",
                border: "none",
                borderRadius: "4px",
                cursor: "pointer",
                fontSize: "10px",
              }}
            >
              🧪 +1
            </button>
            <button
              onClick={() => onBuyMpPotion(5)}
              style={{
                flex: 1,
                padding: "4px",
                background: "#2563eb",
                color: "white",
                border: "none",
                borderRadius: "4px",
                cursor: "pointer",
                fontSize: "10px",
              }}
            >
              🧪 +5
            </button>
            <button
              onClick={() => onBuyMpPotion(10)}
              style={{
                flex: 1,
                padding: "4px",
                background: "#2563eb",
                color: "white",
                border: "none",
                borderRadius: "4px",
                cursor: "pointer",
                fontSize: "10px",
              }}
            >
              🧪 +10
            </button>
          </div>
        </div>
      )}

      {/* Sell Item Button */}
      <div style={{ marginBottom: "8px" }}>
        <button
          onClick={onSellItem}
          style={{
            width: "100%",
            padding: "6px",
            background: "#d97706",
            color: "white",
            border: "none",
            borderRadius: "4px",
            cursor: "pointer",
            fontSize: "10px",
          }}
        >
          🔄 Sell Item
        </button>
      </div>

      {/* Use Potion Buttons */}
      <div style={{ display: "flex", gap: "6px", marginBottom: "8px" }}>
        <button
          onClick={onUseHpPotion}
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
          onClick={onUseMpPotion}
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
