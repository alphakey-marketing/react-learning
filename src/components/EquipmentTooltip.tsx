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
  
  // Phase 3: Strict type checking for tooltips
  const isWeapon = item.type === 'weapon';
  const isArmor = ['armor', 'head', 'garment', 'footgear'].includes(item.type);
  
  const currentIsWeapon = currentItem?.type === 'weapon';
  const currentIsArmor = currentItem ? ['armor', 'head', 'garment', 'footgear'].includes(currentItem.type) : false;

  const itemAtk = isWeapon ? (item.atk || 0) : 0;
  const currentAtk = currentIsWeapon ? (currentItem?.atk || 0) : 0;
  const atkDiff = getStatDiff(itemAtk, currentAtk);
  
  // UAT FIX: Add MATK display for wands
  const itemMatk = isWeapon ? (item.matk || 0) : 0;
  const currentMatk = currentIsWeapon ? (currentItem?.matk || 0) : 0;
  const matkDiff = getStatDiff(itemMatk, currentMatk);
  
  const itemDef = isArmor ? (item.def || 0) : 0;
  const currentDef = currentIsArmor ? (currentItem?.def || 0) : 0;
  const defDiff = getStatDiff(itemDef, currentDef);
  
  const hasBasicStats = (item.str || 0) > 0 || (item.agi || 0) > 0 || (item.vit || 0) > 0 || 
                        (item.int || 0) > 0 || (item.dex || 0) > 0 || (item.luk || 0) > 0;
  const hasCombatStats = (isWeapon && (itemAtk > 0 || itemMatk > 0)) || (isArmor && itemDef > 0) || (isWeapon && item.weaponLevel);

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
  
  const sectionHeaderStyle: CSSProperties = {
    fontSize: "11px",
    color: "#fbbf24",
    marginBottom: "6px",
    marginTop: "8px",
    borderBottom: "1px solid #444",
    paddingBottom: "2px",
    fontWeight: "bold"
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
      
      {/* Combat Stats */}
      {hasCombatStats && (
        <>
          <div style={sectionHeaderStyle}>Combat Stats</div>
          {isWeapon && itemAtk > 0 && (
            <div style={statRowStyle}>
              <span style={{ color: "#fca5a5" }}>⚔️ ATK:</span>
              <span>
                {itemAtk}
                {currentItem && (
                  <span style={{ color: atkDiff.color, marginLeft: "6px" }}>({atkDiff.text})</span>
                )}
              </span>
            </div>
          )}
          
          {/* UAT FIX: Display MATK for wands */}
          {isWeapon && itemMatk > 0 && (
            <div style={statRowStyle}>
              <span style={{ color: "#93c5fd" }}>🪄 MATK:</span>
              <span>
                {itemMatk}
                {currentItem && (
                  <span style={{ color: matkDiff.color, marginLeft: "6px" }}>({matkDiff.text})</span>
                )}
              </span>
            </div>
          )}
          
          {isWeapon && item.weaponLevel && (
            <div style={statRowStyle}>
              <span style={{ color: "#fca5a5" }}>Weapon Level:</span>
              <span>{item.weaponLevel}</span>
            </div>
          )}
          
          {isArmor && itemDef > 0 && (
            <div style={statRowStyle}>
              <span style={{ color: "#93c5fd" }}>🛡️ DEF:</span>
              <span>
                {itemDef}
                {currentItem && (
                  <span style={{ color: defDiff.color, marginLeft: "6px" }}>({defDiff.text})</span>
                )}
              </span>
            </div>
          )}
        </>
      )}
      
      {/* Basic Stats */}
      {hasBasicStats && (
        <>
          <div style={sectionHeaderStyle}>Basic Stats</div>
          {item.str !== undefined && item.str > 0 && (
            <div style={statRowStyle}>
              <span style={{ color: "#fca5a5" }}>STR:</span>
              <span style={{ color: "#22c55e" }}>+{item.str}</span>
            </div>
          )}
          
          {item.agi !== undefined && item.agi > 0 && (
            <div style={statRowStyle}>
              <span style={{ color: "#86efac" }}>AGI:</span>
              <span style={{ color: "#22c55e" }}>+{item.agi}</span>
            </div>
          )}
          
          {item.vit !== undefined && item.vit > 0 && (
            <div style={statRowStyle}>
              <span style={{ color: "#fdba74" }}>VIT:</span>
              <span style={{ color: "#22c55e" }}>+{item.vit}</span>
            </div>
          )}
          
          {item.int !== undefined && item.int > 0 && (
            <div style={statRowStyle}>
              <span style={{ color: "#93c5fd" }}>INT:</span>
              <span style={{ color: "#22c55e" }}>+{item.int}</span>
            </div>
          )}
          
          {item.dex !== undefined && item.dex > 0 && (
            <div style={statRowStyle}>
              <span style={{ color: "#fde047" }}>DEX:</span>
              <span style={{ color: "#22c55e" }}>+{item.dex}</span>
            </div>
          )}
          
          {item.luk !== undefined && item.luk > 0 && (
            <div style={statRowStyle}>
              <span style={{ color: "#c084fc" }}>LUK:</span>
              <span style={{ color: "#22c55e" }}>+{item.luk}</span>
            </div>
          )}
        </>
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