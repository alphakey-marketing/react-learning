import { useState } from "react";
import { Equipment, EquippedItems, getEquipmentIcon, getRarityColor } from "../types/equipment";
import { EquipmentComparisonModal } from "./EquipmentComparisonModal";

interface EnhancedInventoryProps {
  inventory: Equipment[];
  equipped: EquippedItems;
  onEquip: (item: Equipment) => void;
}

type SortOption = "type" | "rarity" | "stat" | "name";

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
      case "stat":
        return (b.atk || b.def || b.stat || 0) - (a.atk || a.def || a.stat || 0);
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
              }}
            >
              <div style={{ color: "#9ca3af", fontSize: "9px" }}>
                {slot.icon} {slot.label}
              </div>
              {item ? (
                <div style={{ color: rarityColor, fontWeight: "500" }}>
                  {item.name}
                  {item.refinement !== undefined && item.refinement > 0 && (
                    <span style={{ color: "#fbbf24" }}> +{item.refinement}</span>
                  )}
                </div>
              ) : (
                <div style={{ color: "#666", fontStyle: "italic" }}>Empty</div>
              )}
              {item && (
                <div style={{ fontSize: "9px", color: "#9ca3af" }}>
                  {item.atk && `ATK: ${item.atk}`}
                  {item.def && `DEF: ${item.def}`}
                  {!item.atk && !item.def && item.stat && `+${item.stat}`}
                </div>
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
        fontSize: "9px",
      }}>
        <span style={{ color: "#9ca3af", marginRight: "4px" }}>Sort:</span>
        {(["type", "rarity", "stat", "name"] as SortOption[]).map((option) => (
          <button
            key={option}
            onClick={() => setSortBy(option)}
            style={{
              padding: "4px 8px",
              background: sortBy === option ? "#3b82f6" : "#444",
              color: "white",
              border: "none",
              borderRadius: "3px",
              cursor: "pointer",
              textTransform: "capitalize",
              fontSize: "9px",
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
        gap: "4px",
        maxHeight: "180px",
        overflowY: "auto",
        padding: "4px",
        background: "#1a1a1a",
        borderRadius: "4px",
      }}>
        {sortedInventory.length === 0 ? (
          <div style={{ 
            gridColumn: "1 / -1",
            color: "#666", 
            fontSize: "10px",
            textAlign: "center",
            padding: "20px",
          }}>
            No items in inventory
          </div>
        ) : (
          sortedInventory.map((item) => {
            const icon = getEquipmentIcon(item.type);
            const rarityColor = getRarityColor(item.rarity);
            
            return (
              <button
                key={item.id}
                onClick={() => setSelectedItem(item)}
                style={{
                  fontSize: "20px",
                  padding: "8px",
                  background: "#2a2a2a",
                  border: `2px solid ${rarityColor}`,
                  borderRadius: "4px",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  position: "relative",
                  transition: "transform 0.2s, box-shadow 0.2s",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = "scale(1.05)";
                  e.currentTarget.style.boxShadow = `0 0 10px ${rarityColor}`;
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
                    right: "2px",
                    fontSize: "8px",
                    color: "#fbbf24",
                    fontWeight: "bold",
                  }}>
                    +{item.refinement}
                  </span>
                )}
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
