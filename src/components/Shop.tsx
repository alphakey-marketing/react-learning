import { useState } from "react";
import { Equipment, getRarityColor } from "../types/equipment";

interface ShopProps {
  gold: number;
  hpPotions: number;
  mpPotions: number;
  inventory: Equipment[];
  onBuyHpPotion: (amount: number) => void;
  onBuyMpPotion: (amount: number) => void;
  onSellItem: (item: Equipment) => void;
}

export function Shop({
  gold,
  hpPotions,
  mpPotions,
  inventory,
  onBuyHpPotion,
  onBuyMpPotion,
  onSellItem,
}: ShopProps) {
  const [showSellModal, setShowSellModal] = useState(false);
  const [selectedSellItem, setSelectedSellItem] = useState<Equipment | null>(null);
  
  const HP_POTION_COST = 50;
  const MP_POTION_COST = 50;
  
  const getSellPrice = (item: Equipment) => {
    return (item.atk || item.def || item.stat || 1) * 2;
  };
  
  const handleSellClick = (item: Equipment) => {
    setSelectedSellItem(item);
  };
  
  const confirmSell = () => {
    if (selectedSellItem) {
      onSellItem(selectedSellItem);
      setSelectedSellItem(null);
    }
  };

  return (
    <div
      style={{
        background: "#2a2a2a",
        padding: "12px",
        borderRadius: "8px",
        marginBottom: "15px",
        border: "1px solid #444",
      }}
    >
      <h3 style={{ margin: "0 0 10px 0", fontSize: "14px", color: "#fbbf24" }}>
        🏪 Town Shop
      </h3>

      <div style={{ marginBottom: "12px" }}>
        <div
          style={{
            fontSize: "12px",
            color: "#aaa",
            marginBottom: "8px",
            fontWeight: "bold",
          }}
        >
          💰 Your Gold: {gold}
        </div>

        <div style={{ display: "flex", gap: "8px", marginBottom: "8px" }}>
          <div style={{ flex: 1, fontSize: "11px" }}>
            <div style={{ marginBottom: "4px", color: "#f87171" }}>🍖 HP Potion ({hpPotions})</div>
            <div style={{ display: "flex", gap: "4px" }}>
              <button
                onClick={() => onBuyHpPotion(1)}
                style={{
                  flex: 1,
                  padding: "6px",
                  background: gold >= HP_POTION_COST ? "#16a34a" : "#555",
                  color: "white",
                  border: "none",
                  borderRadius: "4px",
                  cursor: gold >= HP_POTION_COST ? "pointer" : "not-allowed",
                  fontSize: "11px",
                }}
                disabled={gold < HP_POTION_COST}
              >
                Buy 1 ({HP_POTION_COST}g)
              </button>
              <button
                onClick={() => onBuyHpPotion(10)}
                style={{
                  flex: 1,
                  padding: "6px",
                  background: gold >= HP_POTION_COST * 10 ? "#16a34a" : "#555",
                  color: "white",
                  border: "none",
                  borderRadius: "4px",
                  cursor: gold >= HP_POTION_COST * 10 ? "pointer" : "not-allowed",
                  fontSize: "11px",
                }}
                disabled={gold < HP_POTION_COST * 10}
              >
                Buy 10 ({HP_POTION_COST * 10}g)
              </button>
            </div>
          </div>

          <div style={{ flex: 1, fontSize: "11px" }}>
            <div style={{ marginBottom: "4px", color: "#60a5fa" }}>🧪 MP Potion ({mpPotions})</div>
            <div style={{ display: "flex", gap: "4px" }}>
              <button
                onClick={() => onBuyMpPotion(1)}
                style={{
                  flex: 1,
                  padding: "6px",
                  background: gold >= MP_POTION_COST ? "#2563eb" : "#555",
                  color: "white",
                  border: "none",
                  borderRadius: "4px",
                  cursor: gold >= MP_POTION_COST ? "pointer" : "not-allowed",
                  fontSize: "11px",
                }}
                disabled={gold < MP_POTION_COST}
              >
                Buy 1 ({MP_POTION_COST}g)
              </button>
              <button
                onClick={() => onBuyMpPotion(10)}
                style={{
                  flex: 1,
                  padding: "6px",
                  background: gold >= MP_POTION_COST * 10 ? "#2563eb" : "#555",
                  color: "white",
                  border: "none",
                  borderRadius: "4px",
                  cursor: gold >= MP_POTION_COST * 10 ? "pointer" : "not-allowed",
                  fontSize: "11px",
                }}
                disabled={gold < MP_POTION_COST * 10}
              >
                Buy 10 ({MP_POTION_COST * 10}g)
              </button>
            </div>
          </div>
        </div>
      </div>

      <div>
        <div style={{ fontSize: "12px", color: "#aaa", marginBottom: "6px", fontWeight: "bold" }}>
          💸 Sell Items
        </div>
        <button
          onClick={() => setShowSellModal(true)}
          disabled={inventory.length === 0}
          style={{
            width: "100%",
            padding: "8px",
            background: inventory.length > 0 ? "#d97706" : "#555",
            color: "white",
            border: "none",
            borderRadius: "4px",
            cursor: inventory.length > 0 ? "pointer" : "not-allowed",
            fontSize: "12px",
            fontWeight: "bold",
          }}
        >
          {inventory.length > 0 ? `Sell Items (${inventory.length} available)` : "No items to sell"}
        </button>
      </div>
      
      {/* Sell Item Modal */}
      {showSellModal && (
        <div style={{
          position: "fixed",
          top: 0, left: 0, right: 0, bottom: 0,
          background: "rgba(0, 0, 0, 0.85)",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          zIndex: 1000,
        }}>
          <div style={{
            background: "#1a1a1a",
            border: "2px solid #fbbf24",
            borderRadius: "12px",
            width: "500px",
            maxWidth: "95%",
            maxHeight: "80vh",
            display: "flex",
            flexDirection: "column",
          }}>
            <div style={{
              padding: "15px",
              borderBottom: "1px solid #444",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}>
              <h3 style={{ margin: 0, color: "#fbbf24" }}>💸 Select Item to Sell</h3>
              <button
                onClick={() => setShowSellModal(false)}
                style={{
                  background: "none",
                  border: "none",
                  color: "#999",
                  fontSize: "24px",
                  cursor: "pointer",
                }}
              >×</button>
            </div>
            
            <div style={{
              flex: 1,
              overflowY: "auto",
              padding: "15px",
            }}>
              {inventory.length === 0 ? (
                <div style={{ textAlign: "center", color: "#666", padding: "20px" }}>
                  No items in inventory
                </div>
              ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                  {inventory.map((item) => (
                    <div
                      key={item.id}
                      onClick={() => handleSellClick(item)}
                      style={{
                        padding: "12px",
                        background: selectedSellItem?.id === item.id ? "rgba(217, 119, 6, 0.2)" : "#2a2a2a",
                        border: `2px solid ${selectedSellItem?.id === item.id ? "#d97706" : getRarityColor(item.rarity)}`,
                        borderRadius: "6px",
                        cursor: "pointer",
                        transition: "all 0.2s",
                      }}
                    >
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                        <div>
                          <div style={{ color: getRarityColor(item.rarity), fontWeight: "bold", fontSize: "14px" }}>
                            {item.refinement && item.refinement > 0 ? `+${item.refinement} ` : ""}
                            {item.name}
                          </div>
                          <div style={{ fontSize: "11px", color: "#888", marginTop: "2px" }}>
                            {item.type} | {item.atk ? `ATK: ${item.atk}` : `DEF: ${item.def || item.stat}`}
                          </div>
                        </div>
                        <div style={{
                          background: "#16a34a",
                          padding: "6px 12px",
                          borderRadius: "6px",
                          fontWeight: "bold",
                          color: "white",
                          fontSize: "13px",
                        }}>
                          💰 {getSellPrice(item)}g
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
            
            <div style={{
              padding: "15px",
              borderTop: "1px solid #444",
              display: "flex",
              gap: "8px",
            }}>
              <button
                onClick={() => setShowSellModal(false)}
                style={{
                  flex: 1,
                  padding: "10px",
                  background: "#555",
                  color: "white",
                  border: "none",
                  borderRadius: "6px",
                  cursor: "pointer",
                  fontWeight: "bold",
                }}
              >
                Cancel
              </button>
              <button
                onClick={confirmSell}
                disabled={!selectedSellItem}
                style={{
                  flex: 1,
                  padding: "10px",
                  background: selectedSellItem ? "#16a34a" : "#333",
                  color: "white",
                  border: "none",
                  borderRadius: "6px",
                  cursor: selectedSellItem ? "pointer" : "not-allowed",
                  fontWeight: "bold",
                  opacity: selectedSellItem ? 1 : 0.5,
                }}
              >
                {selectedSellItem ? `Sell for ${getSellPrice(selectedSellItem)}g` : "Select an item"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
