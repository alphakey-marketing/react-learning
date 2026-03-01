import { Character } from "../types/character";
import { HP_POTION_COST, MP_POTION_COST } from "../data/constants";

interface ShopProps {
  character: Character;
  isInTown: boolean;
  onSellItem: () => void;
  onBuyHpPotion: (amount: number) => void;
  onBuyMpPotion: (amount: number) => void;
}

export function Shop({
  character,
  isInTown,
  onSellItem,
  onBuyHpPotion,
  onBuyMpPotion,
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
      <div>
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
    </div>
  );
}
