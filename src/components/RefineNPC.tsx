import { Equipment, EquippedItems, getRarityColor, getEquipmentIcon } from "../types/equipment";
import { Character } from "../types/character";
import { useState, useEffect } from "react";
import { REFINEMENT_MATERIAL_COSTS, REFINEMENT_GOLD_MULTIPLIER, REFINEMENT_WEAPON_BONUS, REFINEMENT_ARMOR_BONUS } from "../data/constants";

export interface RefineResult {
  success: boolean;
  broken: boolean;
  message: string;
}

interface RefineNPCProps {
  character: Character;
  inventory: Equipment[];
  equipped: EquippedItems;
  onRefine: (item: Equipment, isEquipped: boolean, slotKey?: keyof EquippedItems) => RefineResult | void;
  onClose: () => void;
}

export function RefineNPC({ character, inventory, equipped, onRefine, onClose }: RefineNPCProps) {
  const [activeTab, setActiveTab] = useState<"equipped" | "inventory">("equipped");
  const [selectedItem, setSelectedItem] = useState<{ item: Equipment; isEquipped: boolean; slotKey?: keyof EquippedItems } | null>(null);
  const [refineResult, setRefineResult] = useState<RefineResult | null>(null);

  // Clear result when selecting a new item
  useEffect(() => {
    setRefineResult(null);
  }, [selectedItem?.item.id]);

  const getRefineCost = (item: Equipment) => {
    return REFINEMENT_GOLD_MULTIPLIER * ((item.refinement || 0) + 1); 
  };

  const getMaterialCost = (item: Equipment) => {
    const currentRefine = item.refinement || 0;
    return REFINEMENT_MATERIAL_COSTS[currentRefine] || 1;
  };

  const getSuccessRate = (currentRefine: number) => {
    if (currentRefine < 4) return 100;
    // REBALANCE: Slightly lower success rates due to softer penalty
    const rates: Record<number, number> = { 4: 55, 5: 45, 6: 35, 7: 25, 8: 15, 9: 10 };
    return rates[currentRefine] || 0;
  };

  const getRefineEffect = (item: Equipment) => {
    if (item.type === "weapon") return `+${REFINEMENT_WEAPON_BONUS} ATK/MATK`;
    return `+${REFINEMENT_ARMOR_BONUS} DEF`;
  };

  const handleRefine = () => {
    if (!selectedItem) return;
    
    const result = onRefine(selectedItem.item, selectedItem.isEquipped, selectedItem.slotKey);
    
    if (result) {
      setRefineResult(result);
      
      // If item failed and leveled down, keep selected but update refinement level
      if (result.broken) {
        setSelectedItem(prev => {
          if (!prev) return prev;
          const currentRefine = prev.item.refinement || 0;
          return {
            ...prev,
            item: {
              ...prev.item,
              refinement: Math.max(0, currentRefine - 1) // Level reduction penalty
            }
          };
        });
        
        // Auto-dismiss failure message after 3 seconds
        setTimeout(() => {
          setRefineResult(null);
        }, 3000);
      } else if (result.success) {
        // Update selected item to reflect new refinement level for UI continuity
        setSelectedItem(prev => {
          if (!prev) return prev;
          return {
            ...prev,
            item: {
              ...prev.item,
              refinement: (prev.item.refinement || 0) + 1
            }
          };
        });
        
        // Auto-dismiss success message after 2 seconds
        setTimeout(() => {
          setRefineResult(null);
        }, 2000);
      } else {
        // Failed but not broken (safe fail) - keep item selected, dismiss message after 2 seconds
        setTimeout(() => {
          setRefineResult(null);
        }, 2000);
      }
    }
  };

  const equippedList = Object.entries(equipped).filter(([_, item]) => item !== null && item.type !== "accessory") as [keyof EquippedItems, Equipment][];
  const inventoryList = inventory.filter(i => i.type !== "accessory");

  const renderItemCard = (item: Equipment, isEquipped: boolean, slotKey?: keyof EquippedItems) => {
    const isSelected = selectedItem?.item.id === item.id;
    const isWeapon = item.type === "weapon";
    const currentRefine = item.refinement || 0;
    
    const typeLabel = isWeapon 
      ? (item.weaponType ? `Weapon (${item.weaponType.charAt(0).toUpperCase() + item.weaponType.slice(1)})` : "Weapon") 
      : item.type.charAt(0).toUpperCase() + item.type.slice(1);
    
    return (
      <div
        key={item.id}
        onClick={() => setSelectedItem({ item, isEquipped, slotKey })}
        style={{
          border: `1px solid ${isSelected ? "#fbbf24" : "#444"}`,
          borderRadius: "6px",
          padding: "8px",
          background: isSelected ? "rgba(251, 191, 36, 0.1)" : "rgba(0,0,0,0.3)",
          cursor: "pointer",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "8px"
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <span style={{ fontSize: "18px" }}>{getEquipmentIcon(item)}</span>
          <div>
            <div style={{ color: getRarityColor(item.rarity), fontWeight: "bold" }}>
              {currentRefine > 0 ? `+${currentRefine} ` : ""}{item.name}
            </div>
            <div style={{ fontSize: "12px", color: "#888" }}>
              {typeLabel} | {isWeapon ? `ATK: ${item.atk || item.stat}` : `DEF: ${item.def || item.stat}`}
            </div>
          </div>
        </div>
        {currentRefine >= 10 && (
          <div style={{ color: "#fbbf24", fontWeight: "bold", fontSize: "12px" }}>MAX</div>
        )}
      </div>
    );
  };

  return (
    <div style={{
      position: "fixed",
      top: 0, left: 0, right: 0, bottom: 0,
      background: "rgba(0, 0, 0, 0.8)",
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
      zIndex: 1000,
    }}>
      <div style={{
        background: "linear-gradient(135deg, #1f2937 0%, #111827 100%)",
        border: "2px solid #fbbf24",
        borderRadius: "12px",
        width: "600px",
        maxWidth: "95%",
        height: "80vh",
        display: "flex",
        flexDirection: "column",
        boxShadow: "0 0 30px rgba(251, 191, 36, 0.2)",
      }}>
        
        {/* Header */}
        <div style={{
          padding: "15px 20px",
          borderBottom: "1px solid #374151",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center"
        }}>
          <div>
            <h2 style={{ margin: 0, color: "#fbbf24", fontSize: "20px" }}>🔨 The Blacksmith</h2>
            <div style={{ fontSize: "13px", color: "#9ca3af", marginTop: "4px" }}>
              "I can make your gear stronger... for a price."
            </div>
          </div>
          <button
            onClick={onClose}
            style={{
              background: "none",
              border: "none",
              color: "#9ca3af",
              fontSize: "24px",
              cursor: "pointer"
            }}
          >×</button>
        </div>

        {/* Resources */}
        <div style={{
          padding: "10px 20px",
          background: "rgba(0,0,0,0.3)",
          display: "flex",
          justifyContent: "space-around",
          borderBottom: "1px solid #374151",
          fontSize: "14px"
        }}>
          <div style={{ color: "#fbbf24" }}>💰 {character.gold}g</div>
          <div style={{ color: "#a78bfa" }}>💎 Elunium: {character.elunium}</div>
          <div style={{ color: "#f87171" }}>🔥 Oridecon: {character.oridecon}</div>
        </div>

        {/* Main Content Area */}
        <div style={{ display: "flex", flex: 1, minHeight: 0 }}>
          
          {/* List Section */}
          <div style={{ width: "50%", borderRight: "1px solid #374151", display: "flex", flexDirection: "column" }}>
            <div style={{ display: "flex", padding: "10px" }}>
              <button
                onClick={() => { setActiveTab("equipped"); setSelectedItem(null); setRefineResult(null); }}
                style={{
                  flex: 1, padding: "8px",
                  background: activeTab === "equipped" ? "#374151" : "transparent",
                  color: "white", border: "none", cursor: "pointer",
                  borderRadius: "4px"
                }}
              >Equipped</button>
              <button
                onClick={() => { setActiveTab("inventory"); setSelectedItem(null); setRefineResult(null); }}
                style={{
                  flex: 1, padding: "8px",
                  background: activeTab === "inventory" ? "#374151" : "transparent",
                  color: "white", border: "none", cursor: "pointer",
                  borderRadius: "4px"
                }}
              >Inventory</button>
            </div>
            
            <div style={{ flex: 1, overflowY: "auto", padding: "0 10px 10px 10px" }}>
              {activeTab === "equipped" && equippedList.map(([key, item]) => renderItemCard(item, true, key))}
              {activeTab === "equipped" && equippedList.length === 0 && (
                <div style={{ textAlign: "center", color: "#666", marginTop: "20px" }}>No equipped gear to refine.</div>
              )}

              {activeTab === "inventory" && inventoryList.map(item => renderItemCard(item, false))}
              {activeTab === "inventory" && inventoryList.length === 0 && (
                <div style={{ textAlign: "center", color: "#666", marginTop: "20px" }}>No inventory gear to refine.</div>
              )}
            </div>
          </div>

          {/* Details Section */}
          <div style={{ width: "50%", padding: "20px", display: "flex", flexDirection: "column", position: "relative" }}>
            
            {/* Feedback Message Overlay - Always visible when exists */}
            {refineResult && (
              <div style={{
                position: "absolute",
                top: "20px",
                left: "20px",
                right: "20px",
                padding: "12px",
                borderRadius: "8px",
                textAlign: "center",
                fontWeight: "bold",
                fontSize: "15px",
                zIndex: 10,
                animation: "popIn 0.3s ease-out",
                background: refineResult.success 
                  ? "rgba(16, 185, 129, 0.95)" 
                  : refineResult.broken 
                    ? "rgba(239, 68, 68, 0.95)" 
                    : "rgba(245, 158, 11, 0.95)",
                color: "white",
                boxShadow: "0 4px 15px rgba(0,0,0,0.5)",
                border: refineResult.success 
                  ? "2px solid #10b981" 
                  : refineResult.broken 
                    ? "2px solid #ef4444" 
                    : "2px solid #f59e0b",
              }}>
                {refineResult.message}
              </div>
            )}

            {selectedItem ? (
              <div style={{ flex: 1, display: "flex", flexDirection: "column", marginTop: refineResult ? "70px" : "0", transition: "margin 0.3s" }}>
                <div style={{ textAlign: "center", marginBottom: "15px" }}>
                  <div style={{ fontSize: "40px", marginBottom: "10px" }}>
                    {getEquipmentIcon(selectedItem.item)}
                  </div>
                  <div style={{ fontSize: "18px", fontWeight: "bold", color: getRarityColor(selectedItem.item.rarity) }}>
                    {selectedItem.item.refinement ? `+${selectedItem.item.refinement} ` : ""}{selectedItem.item.name}
                  </div>
                </div>

                <div style={{ background: "rgba(0,0,0,0.3)", padding: "12px", borderRadius: "8px", marginBottom: "15px", fontSize: "14px" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "6px" }}>
                    <span>Current Level:</span>
                    <span style={{ color: "#fbbf24" }}>+{selectedItem.item.refinement || 0}</span>
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "6px" }}>
                    <span>Next Level:</span>
                    <span style={{ color: "#10b981" }}>+{(selectedItem.item.refinement || 0) + 1}</span>
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "6px" }}>
                    <span>Upgrade Effect:</span>
                    <span style={{ color: "#60a5fa", fontWeight: "bold" }}>{getRefineEffect(selectedItem.item)}</span>
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "6px" }}>
                    <span>Success Rate:</span>
                    <span style={{ color: getSuccessRate(selectedItem.item.refinement || 0) === 100 ? "#10b981" : "#ef4444", fontWeight: "bold" }}>
                      {getSuccessRate(selectedItem.item.refinement || 0)}%
                    </span>
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between" }}>
                    <span>Failure Penalty:</span>
                    <span style={{ color: (selectedItem.item.refinement || 0) >= 4 ? "#ef4444" : "#10b981", fontWeight: "bold" }}>
                      {(selectedItem.item.refinement || 0) >= 4 ? "-1 Level" : "Safe"}
                    </span>
                  </div>
                </div>

                {(selectedItem.item.refinement || 0) < 10 ? (
                  <div style={{ flex: 1, display: "flex", flexDirection: "column", justifyContent: "flex-end" }}>
                    <div style={{ marginBottom: "15px", fontSize: "14px", background: "rgba(0,0,0,0.3)", padding: "12px", borderRadius: "8px" }}>
                      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "6px" }}>
                        <span>Required Gold:</span>
                        <span style={{ color: character.gold >= getRefineCost(selectedItem.item) ? "#fbbf24" : "#ef4444" }}>
                          {getRefineCost(selectedItem.item)}g
                        </span>
                      </div>
                      <div style={{ display: "flex", justifyContent: "space-between" }}>
                        <span>Required Material:</span>
                        <span style={{ color: (selectedItem.item.type === "weapon" ? character.oridecon : character.elunium) >= getMaterialCost(selectedItem.item) ? (selectedItem.item.type === "weapon" ? "#f87171" : "#a78bfa") : "#ef4444" }}>
                          {getMaterialCost(selectedItem.item)}x {selectedItem.item.type === "weapon" ? "Oridecon" : "Elunium"}
                        </span>
                      </div>
                    </div>
                    
                    <button
                      onClick={handleRefine}
                      disabled={
                        character.gold < getRefineCost(selectedItem.item) || 
                        (selectedItem.item.type === "weapon" ? character.oridecon : character.elunium) < getMaterialCost(selectedItem.item) ||
                        refineResult !== null  // Disable during refinement animation
                      }
                      style={{
                        padding: "12px",
                        background: "linear-gradient(45deg, #fbbf24, #d97706)",
                        color: "white",
                        border: "none",
                        borderRadius: "6px",
                        cursor: "pointer",
                        fontWeight: "bold",
                        fontSize: "16px",
                        opacity: (character.gold < getRefineCost(selectedItem.item) || (selectedItem.item.type === "weapon" ? character.oridecon : character.elunium) < getMaterialCost(selectedItem.item) || refineResult !== null) ? 0.5 : 1,
                        transition: "transform 0.1s"
                      }}
                      onMouseDown={(e) => e.currentTarget.style.transform = "scale(0.98)"}
                      onMouseUp={(e) => e.currentTarget.style.transform = "scale(1)"}
                      onMouseLeave={(e) => e.currentTarget.style.transform = "scale(1)"}
                    >
                      {refineResult ? "Processing..." : "Refine Item"}
                    </button>
                  </div>
                ) : (
                  <div style={{ flex: 1, display: "flex", flexDirection: "column", justifyContent: "flex-end" }}>
                    <div style={{ textAlign: "center", padding: "15px", color: "#fbbf24", fontWeight: "bold", background: "rgba(251, 191, 36, 0.1)", borderRadius: "8px" }}>
                      This item has reached its maximum potential!
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div style={{ flex: 1, display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center" }}>
                <div style={{ color: "#666", textAlign: "center", padding: "20px" }}>
                  Select an item from the left to view refinement details.
                </div>
              </div>
            )}
          </div>

        </div>
      </div>
      <style>{`
        @keyframes popIn {
          0% { transform: scale(0.9); opacity: 0; }
          100% { transform: scale(1); opacity: 1; }
        }
      `}</style>
    </div>
  );
}