import { useState } from "react";
import { Equipment, EquippedItems, getEquipmentIcon, getRarityColor, calculateGearScore } from "../types/equipment";
import { EquipmentComparisonModal } from "./EquipmentComparisonModal";

interface EnhancedInventoryProps {
  inventory: Equipment[];
  equipped: EquippedItems;
  onEquip: (item: Equipment) => void;
  onUnequip?: (slotKey: keyof EquippedItems) => void;
}

type SortOption = "type" | "rarity" | "power" | "name";

export function EnhancedInventory({ inventory, equipped, onEquip, onUnequip }: EnhancedInventoryProps) {
  const [sortBy, setSortBy] = useState<SortOption>("type");
  const [selectedItem, setSelectedItem] = useState<Equipment | null>(null);
  const [selectedEquippedSlot, setSelectedEquippedSlot] = useState<keyof EquippedItems | null>(null);
  
  // Sort inventory
  const sortedInventory = [...inventory].sort((a, b) => {
    switch (sortBy) {
      case "type":
        return a.type.localeCompare(b.type);
      case "rarity":
        const rarityOrder = { common: 0, uncommon: 1, rare: 2, epic: 3, legendary: 4 };
        return (rarityOrder[b.rarity] || 0) - (rarityOrder[a.rarity] || 0);
      case "power":
        return calculateGearScore(b) - calculateGearScore(a);
      case "name":
        return a.name.localeCompare(b.name);
      default:
        return 0;
    }
  });
  
  // Equipment slots display
  const slots = [
    { key: "weapon" as keyof EquippedItems, label: "Weapon", icon: "⚔️" },
    { key: "armor" as keyof EquippedItems, label: "Armor", icon: "🛡️" },
    { key: "head" as keyof EquippedItems, label: "Head", icon: "🎩" },
    { key: "garment" as keyof EquippedItems, label: "Garment", icon: "🧥" },
    { key: "footgear" as keyof EquippedItems, label: "Footgear", icon: "👢" },
    { key: "accessory1" as keyof EquippedItems, label: "Accessory 1", icon: "💍" },
    { key: "accessory2" as keyof EquippedItems, label: "Accessory 2", icon: "💍" },
  ];
  
  const handleEquipClick = () => {
    if (selectedItem) {
      // If we selected a specific accessory slot to replace
      if (selectedItem.type === "accessory" && selectedEquippedSlot) {
        // We pass a special flag or just rely on the onEquip logic in useGameState
        // (We will update useGameState to handle a targetSlot parameter)
        onEquip({ ...selectedItem, targetSlot: selectedEquippedSlot } as any);
      } else {
        onEquip(selectedItem);
      }
      setSelectedItem(null);
      setSelectedEquippedSlot(null);
    }
  };
  
  const handleUnequipClick = (slotKey: keyof EquippedItems, e: React.MouseEvent) => {
    e.stopPropagation();
    if (onUnequip && equipped[slotKey]) {
      onUnequip(slotKey);
    }
  };
  
  const getCurrentlyEquipped = (item: Equipment): Equipment | null => {
    if (item.type === "accessory") {
      // If a specific slot is targeted, return that one
      if (selectedEquippedSlot) {
        return equipped[selectedEquippedSlot] || null;
      }
      // Otherwise default to checking accessory1 first, then 2
      return equipped.accessory1 || equipped.accessory2 || null;
    }
    return equipped[item.type as keyof EquippedItems];
  };
  
  return (
    <div style={{
      background: "#2a2a2a",
      padding: "12px",
      borderRadius: "8px",
      marginBottom: "15px",
      border: "1px solid #444",
    }}>
      {/* Header */}
      <h3 style={{
        margin: "0 0 12px 0",
        fontSize: "15px",
        color: "#fbbf24",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
      }}>
        <span>🎒 Equipment & Inventory</span>
        <span style={{ fontSize: "11px", color: "#9ca3af" }}>({inventory.length})</span>
      </h3>
      
      {/* Equipment Slots - RO Style */}
      <div style={{
        display: "grid",
        gridTemplateColumns: "repeat(2, 1fr)",
        gap: "6px",
        marginBottom: "12px",
      }}>
        {slots.map((slot) => {
          const item = equipped[slot.key];
          const rarityColor = item ? getRarityColor(item.rarity) : "#444";
          const gearScore = item ? calculateGearScore(item) : 0;
          const displayIcon = item ? getEquipmentIcon(item) : slot.icon;
          
          return (
            <div
              key={slot.key}
              style={{
                background: "#1a1a1a",
                padding: "8px",
                borderRadius: "4px",
                border: `1px solid ${item ? rarityColor : "#444"}`,
                fontSize: "10px",
                display: "flex",
                flexDirection: "column",
                gap: "4px",
                position: "relative",
              }}
            >
              {/* Combat Power Badge - Top Left */}
              {item && (
                <span style={{ 
                  position: "absolute",
                  top: "4px",
                  left: "4px",
                  background: "#333", 
                  padding: "2px 6px", 
                  borderRadius: "4px", 
                  color: "#fbbf24",
                  fontSize: "10px",
                  fontWeight: "bold",
                  border: "1px solid #444",
                  zIndex: 1,
                }}>
                  ⭐ {gearScore}
                </span>
              )}
              
              {/* Unequip Button - Top Right */}
              {item && onUnequip && (
                <button
                  onClick={(e) => handleUnequipClick(slot.key, e)}
                  style={{
                    position: "absolute",
                    top: "4px",
                    right: "4px",
                    width: "20px",
                    height: "20px",
                    background: "transparent",
                    border: "1px solid #dc2626",
                    borderRadius: "4px",
                    color: "#dc2626",
                    fontSize: "14px",
                    fontWeight: "bold",
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    transition: "all 0.2s",
                    lineHeight: "1",
                    padding: "0",
                    zIndex: 2,
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = "#dc2626";
                    e.currentTarget.style.color = "white";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = "transparent";
                    e.currentTarget.style.color = "#dc2626";
                  }}
                  title={`Unequip ${item.name}`}
                >
                  ×
                </button>
              )}
              
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: "20px" }}>
                <span style={{ color: "#9ca3af", fontSize: "10px", fontWeight: "bold" }}>
                  {displayIcon} {slot.label}
                </span>
              </div>
              
              {item ? (
                <div style={{ color: rarityColor, fontWeight: "500", fontSize: "11px" }}>
                  {item.name}
                  {item.refinement !== undefined && item.refinement > 0 && (
                    <span style={{ color: "#fbbf24" }}> +{item.refinement}</span>
                  )}
                </div>
              ) : (
                <div style={{ color: "#666", fontStyle: "italic", fontSize: "11px" }}>Empty</div>
              )}
            </div>
          );
        })}
      </div>
      
      {/* Inventory Controls */}
      <div style={{
        display: "flex",
        gap: "4px",
        marginBottom: "8px",
        fontSize: "10px",
      }}>
        <span style={{ color: "#9ca3af", marginRight: "4px", alignSelf: "center" }}>Sort:</span>
        {(["type", "rarity", "power", "name"] as SortOption[]).map((option) => (
          <button
            key={option}
            onClick={() => setSortBy(option)}
            style={{
              padding: "4px 8px",
              background: sortBy === option ? "#3b82f6" : "#444",
              color: "white",
              border: "none",
              borderRadius: "4px",
              cursor: "pointer",
              textTransform: "capitalize",
              fontSize: "10px",
              fontWeight: sortBy === option ? "bold" : "normal",
            }}
          >
            {option}
          </button>
        ))}
      </div>
      
      {/* Inventory Grid */}
      <div style={{
        display: "grid",
        gridTemplateColumns: "repeat(4, 1fr)",
        gap: "8px",
        maxHeight: "220px",
        overflowY: "auto",
        padding: "6px",
        background: "#1a1a1a",
        borderRadius: "4px",
      }}>
        {sortedInventory.length === 0 ? (
          <div style={{ 
            gridColumn: "1 / -1",
            color: "#666", 
            fontSize: "12px",
            textAlign: "center",
            padding: "20px",
          }}>
            No items in inventory
          </div>
        ) : (
          sortedInventory.map((item) => {
            const icon = getEquipmentIcon(item);
            const rarityColor = getRarityColor(item.rarity);
            const gearScore = calculateGearScore(item);
            
            // For accessories, check if ANY equipped accessory is worse
            let isUpgrade = false;
            if (item.type === "accessory") {
              const acc1Score = equipped.accessory1 ? calculateGearScore(equipped.accessory1) : 0;
              const acc2Score = equipped.accessory2 ? calculateGearScore(equipped.accessory2) : 0;
              isUpgrade = gearScore > acc1Score || gearScore > acc2Score;
            } else {
              const currentlyEquipped = equipped[item.type as keyof EquippedItems];
              const equippedScore = currentlyEquipped ? calculateGearScore(currentlyEquipped) : 0;
              isUpgrade = gearScore > equippedScore;
            }
            
            return (
              <button
                key={item.id}
                onClick={() => setSelectedItem(item)}
                style={{
                  fontSize: "24px",
                  padding: "10px 8px 14px 8px",
                  background: "#2a2a2a",
                  border: `2px solid ${rarityColor}`,
                  borderRadius: "6px",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  position: "relative",
                  transition: "transform 0.2s, box-shadow 0.2s",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = "scale(1.05)";
                  e.currentTarget.style.boxShadow = `0 0 12px ${rarityColor}`;
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = "scale(1)";
                  e.currentTarget.style.boxShadow = "none";
                }}
              >
                {icon}
                {item.refinement !== undefined && item.refinement > 0 && (
                  <span style={{
                    position: "absolute",
                    top: "2px",
                    right: "4px",
                    fontSize: "10px",
                    color: "#fbbf24",
                    fontWeight: "bold",
                    textShadow: "0px 1px 2px rgba(0,0,0,0.8)"
                  }}>
                    +{item.refinement}
                  </span>
                )}
                
                {/* Upgrade indicator arrow */}
                {isUpgrade && (
                  <span style={{
                    position: "absolute",
                    top: "-6px",
                    left: "-6px",
                    fontSize: "14px",
                    color: "#22c55e",
                    fontWeight: "bold",
                    textShadow: "0 0 4px black",
                    background: "rgba(0,0,0,0.5)",
                    borderRadius: "50%",
                    width: "18px",
                    height: "18px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}>
                    ▲
                  </span>
                )}
                
                {/* Power Badge */}
                <span style={{
                  position: "absolute",
                  bottom: "-6px",
                  left: "50%",
                  transform: "translateX(-50%)",
                  fontSize: "10px",
                  fontWeight: "bold",
                  background: "#111",
                  color: "#fbbf24",
                  padding: "2px 6px",
                  borderRadius: "4px",
                  border: "1px solid #666",
                  whiteSpace: "nowrap",
                  boxShadow: "0 2px 4px rgba(0,0,0,0.5)"
                }}>
                  ⭐ {gearScore}
                </span>
              </button>
            );
          })
        )}
      </div>
      
      {/* Accessory Slot Selection Modal with Combat Power Comparison */}
      {selectedItem && selectedItem.type === "accessory" && !selectedEquippedSlot && equipped.accessory1 && equipped.accessory2 && (
        <div style={{
          position: "fixed",
          top: 0, left: 0, right: 0, bottom: 0,
          background: "rgba(0,0,0,0.8)",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          zIndex: 1000
        }}>
          <div style={{
            background: "#1a1a1a",
            padding: "20px",
            borderRadius: "8px",
            border: "2px solid #fbbf24",
            maxWidth: "500px",
            width: "90%",
            textAlign: "center"
          }}>
            <h3 style={{ color: "#fbbf24", margin: "0 0 10px 0" }}>💍 Replace Which Accessory?</h3>
            <div style={{ fontSize: "12px", color: "#aaa", marginBottom: "15px" }}>
              New: <span style={{ color: getRarityColor(selectedItem.rarity), fontWeight: "bold" }}>{selectedItem.name}</span> (⭐ {calculateGearScore(selectedItem)})
            </div>
            <div style={{ display: "flex", gap: "10px", justifyContent: "center", marginBottom: "15px" }}>
              <button
                onClick={() => setSelectedEquippedSlot("accessory1")}
                style={{
                  padding: "15px",
                  background: "#2a2a2a",
                  border: "2px solid #555",
                  borderRadius: "8px",
                  color: "white",
                  cursor: "pointer",
                  flex: 1,
                  position: "relative",
                  transition: "all 0.2s"
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = "#fbbf24";
                  e.currentTarget.style.transform = "scale(1.05)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = "#555";
                  e.currentTarget.style.transform = "scale(1)";
                }}
              >
                <div style={{ fontSize: "10px", color: "#888", marginBottom: "5px" }}>Slot 1</div>
                <div style={{ color: getRarityColor(equipped.accessory1.rarity), fontWeight: "bold", fontSize: "13px", marginBottom: "8px" }}>
                  {equipped.accessory1.name}
                </div>
                <div style={{
                  background: calculateGearScore(selectedItem) > calculateGearScore(equipped.accessory1) ? "#ef4444" : "#333",
                  padding: "4px 8px",
                  borderRadius: "4px",
                  fontSize: "11px",
                  fontWeight: "bold",
                  display: "inline-block"
                }}>
                  ⭐ {calculateGearScore(equipped.accessory1)}
                </div>
                {calculateGearScore(selectedItem) > calculateGearScore(equipped.accessory1) && (
                  <div style={{ fontSize: "10px", color: "#22c55e", marginTop: "5px" }}>
                    ▲ +{calculateGearScore(selectedItem) - calculateGearScore(equipped.accessory1)} Power
                  </div>
                )}
              </button>
              <button
                onClick={() => setSelectedEquippedSlot("accessory2")}
                style={{
                  padding: "15px",
                  background: "#2a2a2a",
                  border: "2px solid #555",
                  borderRadius: "8px",
                  color: "white",
                  cursor: "pointer",
                  flex: 1,
                  position: "relative",
                  transition: "all 0.2s"
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = "#fbbf24";
                  e.currentTarget.style.transform = "scale(1.05)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = "#555";
                  e.currentTarget.style.transform = "scale(1)";
                }}
              >
                <div style={{ fontSize: "10px", color: "#888", marginBottom: "5px" }}>Slot 2</div>
                <div style={{ color: getRarityColor(equipped.accessory2.rarity), fontWeight: "bold", fontSize: "13px", marginBottom: "8px" }}>
                  {equipped.accessory2.name}
                </div>
                <div style={{
                  background: calculateGearScore(selectedItem) > calculateGearScore(equipped.accessory2) ? "#ef4444" : "#333",
                  padding: "4px 8px",
                  borderRadius: "4px",
                  fontSize: "11px",
                  fontWeight: "bold",
                  display: "inline-block"
                }}>
                  ⭐ {calculateGearScore(equipped.accessory2)}
                </div>
                {calculateGearScore(selectedItem) > calculateGearScore(equipped.accessory2) && (
                  <div style={{ fontSize: "10px", color: "#22c55e", marginTop: "5px" }}>
                    ▲ +{calculateGearScore(selectedItem) - calculateGearScore(equipped.accessory2)} Power
                  </div>
                )}
              </button>
            </div>
            <button
              onClick={() => setSelectedItem(null)}
              style={{
                padding: "8px 16px",
                background: "#4b5563",
                color: "white",
                border: "none",
                borderRadius: "4px",
                cursor: "pointer",
                width: "100%"
              }}
            >
              Cancel
            </button>
          </div>
        </div>
      )}
      
      {/* Comparison Modal */}
      {selectedItem && (
        (selectedItem.type !== "accessory" || 
         !equipped.accessory1 || 
         !equipped.accessory2 || 
         selectedEquippedSlot) && (
        <EquipmentComparisonModal
          newItem={selectedItem}
          currentItem={getCurrentlyEquipped(selectedItem)}
          onEquip={handleEquipClick}
          onCancel={() => {
            setSelectedItem(null);
            setSelectedEquippedSlot(null);
          }}
        />
      ))}
    </div>
  );
}
