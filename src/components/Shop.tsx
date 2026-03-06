import { useState } from "react";
import { Character } from "../types/character";
import { Equipment, getEquipmentIcon } from "../types/equipment";
import { HP_POTION_COST, MP_POTION_COST, HP_POTION_HEAL_FLAT, HP_POTION_HEAL_PERCENT } from "../data/constants";

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
  const [selectedItems, setSelectedItems] = useState<Set<number>>(new Set());

  const calculateSellPrice = (item: Equipment) => {
    return Math.floor((item.atk || item.def || item.stat || 1) * 2);
  };

  const getRarityColor = (rarity: string) => {
    switch (rarity) {
      case "legendary":
        return "#ff6b35";
      case "epic":
        return "#a855f7";
      case "rare":
        return "#3b82f6";
      case "uncommon":
        return "#22c55e";
      case "common":
      default:
        return "#9ca3af";
    }
  };

  const getTotalSellValue = () => {
    return inventory
      .filter(item => selectedItems.has(item.id))
      .reduce((total, item) => total + calculateSellPrice(item), 0);
  };

  const handleToggleItem = (itemId: number) => {
    setSelectedItems(prev => {
      const newSet = new Set(prev);
      if (newSet.has(itemId)) {
        newSet.delete(itemId);
      } else {
        newSet.add(itemId);
      }
      return newSet;
    });
  };

  const handleSelectAll = () => {
    if (selectedItems.size === inventory.length) {
      // Deselect all
      setSelectedItems(new Set());
    } else {
      // Select all
      setSelectedItems(new Set(inventory.map(item => item.id)));
    }
  };

  const handleSellConfirm = () => {
    const itemsToSell = inventory.filter(item => selectedItems.has(item.id));
    itemsToSell.forEach(item => onSellItem(item));
    setShowSellModal(false);
    setSelectedItems(new Set());
  };

  const handleSellCancel = () => {
    setShowSellModal(false);
    setSelectedItems(new Set());
  };

  // Calculate actual heal for this character
  const hpHealAmount = HP_POTION_HEAL_FLAT + Math.floor(character.maxHp * HP_POTION_HEAL_PERCENT);

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
              🍖 HP Potions ({HP_POTION_COST}g) - Heals {HP_POTION_HEAL_FLAT}+{Math.floor(HP_POTION_HEAL_PERCENT * 100)}% Max HP:
            </div>
            <div style={{ fontSize: "10px", color: "#22c55e", marginBottom: "4px", paddingLeft: "4px" }}>
              ⚡ You: ~{hpHealAmount} HP per potion
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
              🧪 MP Potions ({MP_POTION_COST}g):
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

      {/* Sell Item Modal with Multi-Select */}
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
              maxWidth: "500px",
              width: "90%",
              maxHeight: "80vh",
              display: "flex",
              flexDirection: "column",
              color: "white",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div style={{
              padding: "20px 20px 15px 20px",
              borderBottom: "2px solid #f59e0b",
            }}>
              <h2
                style={{
                  margin: "0 0 10px 0",
                  fontSize: "20px",
                  color: "#fbbf24",
                  textAlign: "center",
                }}
              >
                💰 Sell Items
              </h2>
              
              {inventory.length > 0 && (
                <div style={{ 
                  display: "flex", 
                  justifyContent: "space-between", 
                  alignItems: "center",
                  fontSize: "12px",
                }}>
                  <button
                    onClick={handleSelectAll}
                    style={{
                      padding: "6px 12px",
                      background: selectedItems.size === inventory.length ? "#dc2626" : "#3b82f6",
                      color: "white",
                      border: "none",
                      borderRadius: "4px",
                      cursor: "pointer",
                      fontSize: "11px",
                      fontWeight: "bold",
                    }}
                  >
                    {selectedItems.size === inventory.length ? "✕ Deselect All" : "✓ Select All"}
                  </button>
                  <div style={{ color: "#aaa" }}>
                    {selectedItems.size} / {inventory.length} selected
                  </div>
                </div>
              )}
            </div>

            {/* Scrollable Items List */}
            <div style={{
              flex: 1,
              overflowY: "auto",
              padding: "15px 20px",
            }}>
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
                <div style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: "8px",
                }}>
                  {inventory.map((item) => {
                    const sellPrice = calculateSellPrice(item);
                    const isSelected = selectedItems.has(item.id);
                    return (
                      <button
                        key={item.id}
                        onClick={() => handleToggleItem(item.id)}
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
                          position: "relative",
                        }}
                      >
                        {/* Selection Checkbox */}
                        <div
                          style={{
                            position: "absolute",
                            top: "8px",
                            left: "8px",
                            width: "20px",
                            height: "20px",
                            borderRadius: "4px",
                            border: isSelected ? "2px solid #fbbf24" : "2px solid #666",
                            background: isSelected ? "#fbbf24" : "transparent",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            fontSize: "12px",
                            fontWeight: "bold",
                            color: "#000",
                          }}
                        >
                          {isSelected && "✓"}
                        </div>
                        
                        <div
                          style={{
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "center",
                            marginBottom: "6px",
                            marginLeft: "28px",
                          }}
                        >
                          <span
                            style={{
                              fontWeight: "bold",
                              color: getRarityColor(item.rarity),
                            }}
                          >
                            {getEquipmentIcon(item)} {item.name}
                            {item.type === "weapon" && item.weaponType && (
                              <span style={{ fontSize: "11px", color: "#999", marginLeft: "4px", fontWeight: "normal", textTransform: "capitalize" }}>
                                ({item.weaponType})
                              </span>
                            )}
                            {item.refinement !== undefined && item.refinement > 0 && (
                              <span style={{ color: "#fbbf24" }}> +{item.refinement}</span>
                            )}
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
                            marginLeft: "28px",
                          }}
                        >
                          {item.atk && <span>ATK: +{item.atk}</span>}
                          {item.def && <span>DEF: +{item.def}</span>}
                          {item.stat && <span>STAT: +{item.stat}</span>}
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
              )}
            </div>

            {/* Sticky Footer with Total and Action Buttons */}
            <div style={{
              padding: "15px 20px 20px 20px",
              borderTop: "2px solid #333",
              background: "linear-gradient(to top, #1a1a1a, #252525)",
              borderRadius: "0 0 10px 10px",
            }}>
              {/* Total Value Display */}
              {selectedItems.size > 0 && (
                <div style={{
                  marginBottom: "12px",
                  padding: "12px",
                  background: "rgba(34, 197, 94, 0.15)",
                  border: "2px solid #22c55e",
                  borderRadius: "6px",
                  textAlign: "center",
                }}>
                  <div style={{ fontSize: "11px", color: "#aaa", marginBottom: "4px" }}>
                    Total Sale Value
                  </div>
                  <div style={{ 
                    fontSize: "24px", 
                    fontWeight: "bold", 
                    color: "#22c55e",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: "8px",
                  }}>
                    💰 {getTotalSellValue()}g
                  </div>
                  <div style={{ fontSize: "10px", color: "#888", marginTop: "4px" }}>
                    Selling {selectedItems.size} item{selectedItems.size !== 1 ? 's' : ''}
                  </div>
                </div>
              )}
              
              {/* Action Buttons */}
              <div style={{ display: "flex", gap: "8px" }}>
                <button
                  onClick={handleSellConfirm}
                  disabled={selectedItems.size === 0}
                  style={{
                    flex: 1,
                    padding: "12px",
                    background: selectedItems.size > 0
                      ? "linear-gradient(to bottom, #22c55e, #16a34a)"
                      : "#555",
                    color: "white",
                    border: "none",
                    borderRadius: "6px",
                    cursor: selectedItems.size > 0 ? "pointer" : "not-allowed",
                    fontSize: "14px",
                    fontWeight: "bold",
                    opacity: selectedItems.size > 0 ? 1 : 0.5,
                  }}
                >
                  ✓ Confirm Sale
                </button>
                <button
                  onClick={handleSellCancel}
                  style={{
                    flex: 1,
                    padding: "12px",
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
        </div>
      )}
    </>
  );
}
