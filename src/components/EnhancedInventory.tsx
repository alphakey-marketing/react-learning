import { useState, useRef } from "react";
import { Equipment, EquippedItems, getEquipmentIcon, getRarityColor } from "../types/equipment";
import { EquipmentTooltip } from "./EquipmentTooltip";

interface EnhancedInventoryProps {
  inventory: Equipment[];
  equipped: EquippedItems;
  onEquip: (item: Equipment) => void;
}

type SortOption = "type" | "rarity" | "stat" | "name";

export function EnhancedInventory({ inventory, equipped, onEquip }: EnhancedInventoryProps) {
  const [sortBy, setSortBy] = useState<SortOption>("type");
  const [hoveredItem, setHoveredItem] = useState<{ item: Equipment; x: number; y: number } | null>(null);
  const touchTimeoutRef = useRef<number | null>(null);
  const lastTouchedItemRef = useRef<string | null>(null);
  
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
  
  const handleTouchStart = (e: React.TouchEvent, item: Equipment) => {
    e.preventDefault();
    const touch = e.touches[0];
    
    // If same item touched twice within timeout, equip it
    if (lastTouchedItemRef.current === item.id && hoveredItem) {
      onEquip(item);
      setHoveredItem(null);
      if (touchTimeoutRef.current) {
        clearTimeout(touchTimeoutRef.current);
        touchTimeoutRef.current = null;
      }
      lastTouchedItemRef.current = null;
      return;
    }
    
    // Show tooltip
    setHoveredItem({
      item,
      x: touch.clientX,
      y: touch.clientY,
    });
    
    lastTouchedItemRef.current = item.id;
    
    // Clear previous timeout
    if (touchTimeoutRef.current) {
      clearTimeout(touchTimeoutRef.current);
    }
    
    // Auto-hide tooltip after 2 seconds
    touchTimeoutRef.current = window.setTimeout(() => {
      setHoveredItem(null);
      lastTouchedItemRef.current = null;
    }, 2000);
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
            const isHovered = hoveredItem && hoveredItem.item.id === item.id;
            
            return (
              <button
                key={item.id}
                onClick={() => onEquip(item)}
                onMouseEnter={(e) => {
                  setHoveredItem({
                    item,
                    x: e.clientX,
                    y: e.clientY,
                  });
                }}
                onMouseMove={(e) => {
                  if (hoveredItem && hoveredItem.item.id === item.id) {
                    setHoveredItem({
                      item,
                      x: e.clientX,
                      y: e.clientY,
                    });
                  }
                }}
                onMouseLeave={() => {
                  setHoveredItem(null);
                  lastTouchedItemRef.current = null;
                }}
                onTouchStart={(e) => handleTouchStart(e, item)}
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
                  transform: isHovered ? "scale(1.05)" : "scale(1)",
                  boxShadow: isHovered ? `0 0 10px ${rarityColor}` : "none",
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
      
      {/* Tooltip */}
      {hoveredItem && (
        <EquipmentTooltip
          item={hoveredItem.item}
          currentItem={
            hoveredItem.item.type === "accessory"
              ? (equipped.accessory1 || equipped.accessory2)
              : equipped[hoveredItem.item.type as keyof EquippedItems]
          }
          position={{ x: hoveredItem.x, y: hoveredItem.y }}
        />
      )}
    </div>
  );
}
