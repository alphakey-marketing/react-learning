import { Equipment, getRarityColor, getEquipmentIcon } from "../types/equipment";
import { CSSProperties, useEffect, useState } from "react";

interface EquipmentTooltipProps {
  item: Equipment;
  currentItem: Equipment | null;
  position: { x: number; y: number };
}

export function EquipmentTooltip({ item, currentItem, position }: EquipmentTooltipProps) {
  const rarityColor = getRarityColor(item.rarity);
  const icon = getEquipmentIcon(item.type);
  const [tooltipDimensions, setTooltipDimensions] = useState({ width: 240, height: 350 });
  
  // Calculate stat differences
  const getStatDiff = (newVal: number = 0, oldVal: number = 0) => {
    const diff = newVal - oldVal;
    if (diff > 0) return { text: `+${diff}`, color: "#22c55e" }; // Green
    if (diff < 0) return { text: `${diff}`, color: "#ef4444" };  // Red
    return { text: "0", color: "#9ca3af" }; // Gray
  };
  
  const atkDiff = getStatDiff(item.atk || item.stat || 0, currentItem?.atk || currentItem?.stat || 0);
  const defDiff = getStatDiff(item.def || 0, currentItem?.def || 0);
  
  // Smart positioning - prevent tooltip from going off screen
  const padding = 15;
  const tooltipWidth = tooltipDimensions.width;
  const tooltipHeight = tooltipDimensions.height;
  
  // Start with default position (right and below cursor)
  let left = position.x + padding;
  let top = position.y + padding;
  
  // Check if tooltip would overflow viewport
  const wouldOverflowRight = left + tooltipWidth > window.innerWidth - padding;
  const wouldOverflowBottom = top + tooltipHeight > window.innerHeight - padding;
  
  // Adjust position if would overflow
  if (wouldOverflowRight) {
    left = position.x - tooltipWidth - padding;
  }
  
  if (wouldOverflowBottom) {
    top = position.y - tooltipHeight - padding;
  }
  
  // Final bounds check - ensure tooltip stays within viewport
  left = Math.max(padding, Math.min(left, window.innerWidth - tooltipWidth - padding));
  top = Math.max(padding, Math.min(top, window.innerHeight - tooltipHeight - padding));
  
  const tooltipStyle: CSSProperties = {
    position: "fixed",
    left: `${left}px`,
    top: `${top}px`,
    background: "#1a1a1a",
    border: `2px solid ${rarityColor}`,
    borderRadius: "6px",
    padding: "12px",
    width: `${tooltipWidth}px`,
    fontSize: "11px",
    color: "#fff",
    zIndex: 9999,
    pointerEvents: "none",
    boxShadow: "0 4px 12px rgba(0,0,0,0.5)",
  };
  
  const statRowStyle: CSSProperties = {
    display: "flex",
    justifyContent: "space-between",
    marginBottom: "4px",
    fontSize: "10px",
  };
  
  return (
    <div style={tooltipStyle}>
      {/* Item Name */}
      <div style={{ 
        fontSize: "13px", 
        fontWeight: "bold", 
        color: rarityColor,
        marginBottom: "8px",
        display: "flex",
        alignItems: "center",
        gap: "6px",
      }}>
        <span>{icon}</span>
        <span>{item.name}</span>
        {item.refinement !== undefined && item.refinement > 0 && (
          <span style={{ color: "#fbbf24" }}> +{item.refinement}</span>
        )}
      </div>
      
      {/* Type & Rarity */}
      <div style={{ 
        fontSize: "9px", 
        color: "#9ca3af",
        marginBottom: "8px",
        textTransform: "capitalize",
      }}>
        {item.type} • {item.rarity}
      </div>
      
      <div style={{ borderTop: "1px solid #444", marginBottom: "8px" }} />
      
      {/* Stats */}
      {(item.atk || item.stat) && (
        <div style={statRowStyle}>
          <span style={{ color: "#fca5a5" }}>⚔️ ATK:</span>
          <span>
            {item.atk || item.stat}
            {currentItem && (
              <span style={{ color: atkDiff.color, marginLeft: "6px" }}>({atkDiff.text})</span>
            )}
          </span>
        </div>
      )}
      
      {item.def !== undefined && item.def > 0 && (
        <div style={statRowStyle}>
          <span style={{ color: "#93c5fd" }}>🛡️ DEF:</span>
          <span>
            {item.def}
            {currentItem && (
              <span style={{ color: defDiff.color, marginLeft: "6px" }}>({defDiff.text})</span>
            )}
          </span>
        </div>
      )}
      
      {/* Bonus Stats */}
      {item.str && (
        <div style={statRowStyle}>
          <span style={{ color: "#fca5a5" }}>STR:</span>
          <span style={{ color: "#22c55e" }}>+{item.str}</span>
        </div>
      )}
      
      {item.agi && (
        <div style={statRowStyle}>
          <span style={{ color: "#86efac" }}>AGI:</span>
          <span style={{ color: "#22c55e" }}>+{item.agi}</span>
        </div>
      )}
      
      {item.vit && (
        <div style={statRowStyle}>
          <span style={{ color: "#fdba74" }}>VIT:</span>
          <span style={{ color: "#22c55e" }}>+{item.vit}</span>
        </div>
      )}
      
      {item.int && (
        <div style={statRowStyle}>
          <span style={{ color: "#93c5fd" }}>INT:</span>
          <span style={{ color: "#22c55e" }}>+{item.int}</span>
        </div>
      )}
      
      {item.dex && (
        <div style={statRowStyle}>
          <span style={{ color: "#fde047" }}>DEX:</span>
          <span style={{ color: "#22c55e" }}>+{item.dex}</span>
        </div>
      )}
      
      {item.luk && (
        <div style={statRowStyle}>
          <span style={{ color: "#c084fc" }}>LUK:</span>
          <span style={{ color: "#22c55e" }}>+{item.luk}</span>
        </div>
      )}
      
      {/* Slots & Weight */}
      <div style={{ borderTop: "1px solid #444", marginTop: "8px", paddingTop: "8px" }} />
      
      <div style={statRowStyle}>
        <span style={{ color: "#9ca3af" }}>Slots:</span>
        <span>{item.slots || 0}</span>
      </div>
      
      {item.weight && (
        <div style={statRowStyle}>
          <span style={{ color: "#9ca3af" }}>Weight:</span>
          <span>{item.weight}</span>
        </div>
      )}
      
      {/* Action hint */}
      <div style={{ 
        marginTop: "8px",
        paddingTop: "8px",
        borderTop: "1px solid #444",
        fontSize: "9px",
        color: "#fbbf24",
        textAlign: "center",
      }}>
        Tap to equip
      </div>
    </div>
  );
}
