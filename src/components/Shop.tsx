import { useState } from "react";
import { Character } from "../types/character";
import { Equipment } from "../types/equipment";
import { HP_POTION_COST, MP_POTION_COST } from "../data/constants";

interface ShopProps {
  character: Character;
  isInTown: boolean;
  inventory: Equipment[];
  onSellItem: (item: Equipment) => void;
  onBuyHpPotion: (amount: number) => void;
  onBuyMpPotion: (amount: number) => void;
}

export function Shop({
  character,
  isInTown,
  inventory,
  onSellItem,
  onBuyHpPotion,
  onBuyMpPotion,
}: ShopProps) {
  const [showSellModal, setShowSellModal] = useState(false);
  const [selectedItem, setSelectedItem] = useState<Equipment | null>(null);

  const calculateSellPrice = (item: Equipment) => {
    return Math.floor(item.stat * 2);
  };

  const getRarityColor = (rarity: string) => {
    switch (rarity) {
      case "epic":
        return "#a855f7";
      case "rare":
        return "#3b82f6";
      case "common":
      default:
        return "#666";
    }
  };

  const handleSellConfirm = () => {
    if (selectedItem) {
      onSellItem(selectedItem);
      setShowSellModal(false);
      setSelectedItem(null);
    }
  };

  const handleSellCancel = () => {
    setShowSellModal(false);
    setSelectedItem(null);
  };

  return (
    <>
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
            onClick={() => setShowSellModal(true)}
            disabled={inventory.length === 0}
            style={{
              width: "100%",
              padding: "6px",
              background: inventory.length > 0 ? "#d97706" : "#555",
              color: "white",
              border: "none",
              borderRadius: "4px",
              cursor: inventory.length > 0 ? "pointer" : "not-allowed",
              fontSize: "10px",
              opacity: inventory.length > 0 ? 1 : 0.5,
            }}
          >
            🔄 Sell Items {inventory.length > 0 ? `(${inventory.length})` : ""}
          </button>
        </div>
      </div>

      {/* Sell Item Modal */}
      {showSellModal && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: "rgba(0, 0, 0, 0.85)",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            zIndex: 1000,
          }}
          onClick={handleSellCancel}
        >
          <div
            style={{
              background: "linear-gradient(135deg, #1a1a1a 0%, #2a2a2a 100%)",
              border: "2px solid #f59e0b",
              borderRadius: "12px",
              padding: "20px",
              maxWidth: "500px",
              width: "90%",
              maxHeight: "70vh",
              overflowY: "auto",
              color: "white",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <h2
              style={{
                margin: "0 0 15px 0",
                fontSize: "20px",
                color: "#fbbf24",
                textAlign: "center",
                borderBottom: "2px solid #f59e0b",
                paddingBottom: "10px",
              }}
            >
              💰 Sell Items
            </h2>

            {inventory.length === 0 ? (
              <div
                style={{
                  textAlign: "center",
                  padding: "20px",
                  color: "#666",
                  fontSize: "14px",
                }}
              >
                No items to sell
              </div>
            ) : (
              <div style={{ marginBottom: "15px" }}>
                <div
                  style={{
                    fontSize: "12px",
                    color: "#aaa",
                    marginBottom: "10px",
                  }}
                >
                  Select an item to sell:
                </div>
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: "8px",
                  }}
                >
                  {inventory.map((item) => {
                    const sellPrice = calculateSellPrice(item);
                    const isSelected = selectedItem?.id === item.id;
                    return (
                      <button
                        key={item.id}
                        onClick={() => setSelectedItem(item)}
                        style={{
                          padding: "12px",
                          background: isSelected
                            ? "rgba(251, 191, 36, 0.2)"
                            : "rgba(0, 0, 0, 0.3)",
                          border: isSelected
                            ? "2px solid #fbbf24"
                            : `1px solid ${getRarityColor(item.rarity)}`,
                          borderRadius: "6px",
                          cursor: "pointer",
                          textAlign: "left",
                          color: "white",
                          fontSize: "13px",
                          transition: "all 0.2s",
                        }}
                      >
                        <div
                          style={{
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "center",
                            marginBottom: "6px",
                          }}
                        >
                          <span
                            style={{
                              fontWeight: "bold",
                              color: getRarityColor(item.rarity),
                            }}
                          >
                            {item.type === "weapon" ? "⚔️" : "🛡️"} {item.name}
                          </span>
                          <span
                            style={{
                              color: "#22c55e",
                              fontWeight: "bold",
                            }}
                          >
                            {sellPrice}g
                          </span>
                        </div>
                        <div
                          style={{
                            fontSize: "11px",
                            color: "#888",
                            display: "flex",
                            gap: "10px",
                          }}
                        >
                          <span>
                            {item.type === "weapon" ? "ATK" : "DEF"}: +{item.stat}
                          </span>
                          <span
                            style={{
                              color: getRarityColor(item.rarity),
                              textTransform: "capitalize",
                            }}
                          >
                            {item.rarity}
                          </span>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div style={{ display: "flex", gap: "8px", marginTop: "15px" }}>
              <button
                onClick={handleSellConfirm}
                disabled={!selectedItem}
                style={{
                  flex: 1,
                  padding: "10px",
                  background: selectedItem
                    ? "linear-gradient(to bottom, #22c55e, #16a34a)"
                    : "#555",
                  color: "white",
                  border: "none",
                  borderRadius: "6px",
                  cursor: selectedItem ? "pointer" : "not-allowed",
                  fontSize: "14px",
                  fontWeight: "bold",
                  opacity: selectedItem ? 1 : 0.5,
                }}
              >
                ✓ Confirm Sale
              </button>
              <button
                onClick={handleSellCancel}
                style={{
                  flex: 1,
                  padding: "10px",
                  background: "linear-gradient(to bottom, #dc2626, #991b1b)",
                  color: "white",
                  border: "none",
                  borderRadius: "6px",
                  cursor: "pointer",
                  fontSize: "14px",
                  fontWeight: "bold",
                }}
              >
                ✕ Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
