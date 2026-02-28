import { Character } from "../types/character";
import { HP_POTION_COST, MP_POTION_COST } from "../data/constants";

interface ShopProps {
  character: Character;
  hpPotions: number;
  mpPotions: number;
  onSellItem: () => void;
  onBuyHpPotion: () => void;
  onBuyMpPotion: () => void;
  onUseHpPotion: () => void;
  onUseMpPotion: () => void;
}

export function Shop({
  character,
  hpPotions,
  mpPotions,
  onSellItem,
  onBuyHpPotion,
  onBuyMpPotion,
  onUseHpPotion,
  onUseMpPotion,
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
        🏪 Shop
      </h3>

      <div
        style={{
          display: "flex",
          gap: "6px",
          marginBottom: "8px",
          flexWrap: "wrap",
        }}
      >
        <button
          onClick={onSellItem}
          style={{
            flex: 1,
            padding: "6px",
            background: "#d97706",
            color: "white",
            border: "none",
            borderRadius: "4px",
            cursor: "pointer",
            fontSize: "10px",
          }}
        >
          🔄 Sell
        </button>
        <button
          onClick={onBuyHpPotion}
          style={{
            flex: 1,
            padding: "6px",
            background: "#dc2626",
            color: "white",
            border: "none",
            borderRadius: "4px",
            cursor: "pointer",
            fontSize: "10px",
          }}
        >
          🍖 {HP_POTION_COST}g
        </button>
        <button
          onClick={onBuyMpPotion}
          style={{
            flex: 1,
            padding: "6px",
            background: "#2563eb",
            color: "white",
            border: "none",
            borderRadius: "4px",
            cursor: "pointer",
            fontSize: "10px",
          }}
        >
          🧪 {MP_POTION_COST}g
        </button>
      </div>

      <div style={{ display: "flex", gap: "6px" }}>
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
    </div>
  );
}
