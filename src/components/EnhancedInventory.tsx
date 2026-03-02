import { useState } from "react";
import { Equipment, EquippedItems, getEquipmentIcon, getRarityColor, calculateGearScore } from "../types/equipment";
import { EquipmentComparisonModal } from "./EquipmentComparisonModal";

interface EnhancedInventoryProps {
  inventory: Equipment[];
  equipped: EquippedItems;
  onEquip: (item: Equipment) => void;
}

type SortOption = "type" | "rarity" | "power" | "name";

export function EnhancedInventory({ inventory, equipped, onEquip }: EnhancedInventoryProps) {
  const [sortBy, setSortBy] = useState<SortOption>("type");
  const [selectedItem, setSelectedItem] = useState<Equipment | null>(null);
  
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
    { key: "accessory1" as keyof EquippedItems, label: "Accessory", icon: "💍" },
    { key: "accessory2" as keyof EquippedItems, label: "Accessory", icon: "💍" },
  ];
  
  const handleEquipClick = () => {
    if (selectedItem) {
      onEquip(selectedItem);
      setSelectedItem(null);
    }
  };
  
  const getCurrentlyEquipped = (item: Equipment): Equipment | null => {
    if (item.type === "accessory") {
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
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span style={{ color: "#9ca3af", fontSize: "10px", fontWeight: "bold" }}>
                  {slot.icon} {slot.label}
                </span>
                {item && (
                  <span style={{ 
                    background: "#333", 
                    padding: "2px 6px", 
                    borderRadius: "4px", 
                    color: "#fbbf24",
                    fontSize: "10px",
                    fontWeight: "bold",
                    border: "1px solid #444"
                  }}>
                    ⭐ {gearScore}
                  </span>
                )}
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
        gap: "8px", // slightly increased gap to make room for bigger badges
        maxHeight: "220px", // slightly taller to fit bigger items
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
            const icon = getEquipmentIcon(item.type);
            const rarityColor = getRarityColor(item.rarity);
            const gearScore = calculateGearScore(item);
            const currentlyEquipped = getCurrentlyEquipped(item);
            const equippedScore = currentlyEquipped ? calculateGearScore(currentlyEquipped) : 0;
            const isUpgrade = gearScore > equippedScore;
            
            return (
              <button
                key={item.id}
                onClick={() => setSelectedItem(item)}
                style={{
                  fontSize: "24px", // Bigger icon
                  padding: "10px 8px 14px 8px", // More bottom padding for the badge
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
                  fontSize: "10px", // Much bigger font
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
      
      {/* Comparison Modal */}
      {selectedItem && (
        <EquipmentComparisonModal
          newItem={selectedItem}
          currentItem={getCurrentlyEquipped(selectedItem)}
          onEquip={handleEquipClick}
          onCancel={() => setSelectedItem(null)}
        />
      )}
    </div>
  );
}
