import { Equipment, getRarityColor, getEquipmentIcon } from "../types/equipment";
import { CSSProperties } from "react";

interface EquipmentComparisonModalProps {
  newItem: Equipment;
  currentItem: Equipment | null;
  onEquip: () => void;
  onCancel: () => void;
}

export function EquipmentComparisonModal({
  newItem,
  currentItem,
  onEquip,
  onCancel,
}: EquipmentComparisonModalProps) {
  const newRarityColor = getRarityColor(newItem.rarity);
  const currentRarityColor = currentItem ? getRarityColor(currentItem.rarity) : "#666";
  const newIcon = getEquipmentIcon(newItem.type);
  const currentIcon = currentItem ? getEquipmentIcon(currentItem.type) : "❌";

  // Calculate stat differences
  const getStatDiff = (newVal: number = 0, oldVal: number = 0) => {
    const diff = newVal - oldVal;
    if (diff > 0) return { text: `+${diff}`, color: "#22c55e" };
    if (diff < 0) return { text: `${diff}`, color: "#ef4444" };
    return { text: "0", color: "#9ca3af" };
  };

  const atkDiff = getStatDiff(
    newItem.atk || newItem.stat || 0,
    currentItem?.atk || currentItem?.stat || 0
  );
  const defDiff = getStatDiff(newItem.def || 0, currentItem?.def || 0);
  const strDiff = getStatDiff(newItem.str || 0, currentItem?.str || 0);
  const agiDiff = getStatDiff(newItem.agi || 0, currentItem?.agi || 0);
  const vitDiff = getStatDiff(newItem.vit || 0, currentItem?.vit || 0);
  const intDiff = getStatDiff(newItem.int || 0, currentItem?.int || 0);
  const dexDiff = getStatDiff(newItem.dex || 0, currentItem?.dex || 0);
  const lukDiff = getStatDiff(newItem.luk || 0, currentItem?.luk || 0);

  const overlayStyle: CSSProperties = {
    position: "fixed",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: "rgba(0, 0, 0, 0.85)",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 10000,
    padding: "20px",
  };

  const modalStyle: CSSProperties = {
    background: "linear-gradient(135deg, #1a1a1a 0%, #2a2a2a 100%)",
    border: "3px solid #fbbf24",
    borderRadius: "12px",
    padding: "20px",
    maxWidth: "600px",
    width: "100%",
    maxHeight: "90vh",
    overflowY: "auto",
    boxShadow: "0 10px 40px rgba(251, 191, 36, 0.4)",
  };

  const cardStyle = (color: string): CSSProperties => ({
    background: "#1a1a1a",
    border: `2px solid ${color}`,
    borderRadius: "8px",
    padding: "12px",
    flex: 1,
  });

  const statRowStyle: CSSProperties = {
    display: "flex",
    justifyContent: "space-between",
    marginBottom: "6px",
    fontSize: "12px",
  };

  return (
    <div style={overlayStyle} onClick={onCancel}>
      <div style={modalStyle} onClick={(e) => e.stopPropagation()}>
        {/* Title */}
        <h2
          style={{
            margin: "0 0 20px 0",
            fontSize: "20px",
            color: "#fbbf24",
            textAlign: "center",
            fontWeight: "bold",
          }}
        >
          ⚖️ Equipment Comparison
        </h2>

        {/* Comparison Grid */}
        <div style={{ display: "flex", gap: "15px", marginBottom: "20px" }}>
          {/* Current Item */}
          <div style={cardStyle(currentRarityColor)}>
            <div
              style={{
                fontSize: "14px",
                fontWeight: "bold",
                color: currentRarityColor,
                marginBottom: "10px",
                display: "flex",
                alignItems: "center",
                gap: "6px",
              }}
            >
              <span style={{ fontSize: "20px" }}>{currentIcon}</span>
              <div>
                <div>Currently Equipped</div>
                {currentItem && (
                  <div style={{ fontSize: "11px", opacity: 0.7 }}>
                    {currentItem.name}
                    {currentItem.refinement !== undefined && currentItem.refinement > 0 && (
                      <span style={{ color: "#fbbf24" }}> +{currentItem.refinement}</span>
                    )}
                  </div>
                )}
              </div>
            </div>

            {!currentItem ? (
              <div style={{ color: "#666", fontSize: "12px", fontStyle: "italic" }}>
                No item equipped
              </div>
            ) : (
              <>
                <div style={{ fontSize: "10px", color: "#9ca3af", marginBottom: "8px" }}>
                  {currentItem.type} • {currentItem.rarity}
                </div>
                <div style={{ borderTop: "1px solid #444", marginBottom: "8px" }} />
                {(currentItem.atk || currentItem.stat) && (
                  <div style={statRowStyle}>
                    <span style={{ color: "#fca5a5" }}>⚔️ ATK:</span>
                    <span>{currentItem.atk || currentItem.stat}</span>
                  </div>
                )}
                {currentItem.def !== undefined && currentItem.def > 0 && (
                  <div style={statRowStyle}>
                    <span style={{ color: "#93c5fd" }}>🛡️ DEF:</span>
                    <span>{currentItem.def}</span>
                  </div>
                )}
                {currentItem.str && (
                  <div style={statRowStyle}>
                    <span style={{ color: "#fca5a5" }}>STR:</span>
                    <span style={{ color: "#22c55e" }}>+{currentItem.str}</span>
                  </div>
                )}
                {currentItem.agi && (
                  <div style={statRowStyle}>
                    <span style={{ color: "#86efac" }}>AGI:</span>
                    <span style={{ color: "#22c55e" }}>+{currentItem.agi}</span>
                  </div>
                )}
                {currentItem.vit && (
                  <div style={statRowStyle}>
                    <span style={{ color: "#fdba74" }}>VIT:</span>
                    <span style={{ color: "#22c55e" }}>+{currentItem.vit}</span>
                  </div>
                )}
                {currentItem.int && (
                  <div style={statRowStyle}>
                    <span style={{ color: "#93c5fd" }}>INT:</span>
                    <span style={{ color: "#22c55e" }}>+{currentItem.int}</span>
                  </div>
                )}
                {currentItem.dex && (
                  <div style={statRowStyle}>
                    <span style={{ color: "#fde047" }}>DEX:</span>
                    <span style={{ color: "#22c55e" }}>+{currentItem.dex}</span>
                  </div>
                )}
                {currentItem.luk && (
                  <div style={statRowStyle}>
                    <span style={{ color: "#c084fc" }}>LUK:</span>
                    <span style={{ color: "#22c55e" }}>+{currentItem.luk}</span>
                  </div>
                )}
              </>
            )}
          </div>

          {/* Arrow */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              fontSize: "24px",
              color: "#fbbf24",
            }}
          >
            →
          </div>

          {/* New Item */}
          <div style={cardStyle(newRarityColor)}>
            <div
              style={{
                fontSize: "14px",
                fontWeight: "bold",
                color: newRarityColor,
                marginBottom: "10px",
                display: "flex",
                alignItems: "center",
                gap: "6px",
              }}
            >
              <span style={{ fontSize: "20px" }}>{newIcon}</span>
              <div>
                <div>New Item</div>
                <div style={{ fontSize: "11px", opacity: 0.7 }}>
                  {newItem.name}
                  {newItem.refinement !== undefined && newItem.refinement > 0 && (
                    <span style={{ color: "#fbbf24" }}> +{newItem.refinement}</span>
                  )}
                </div>
              </div>
            </div>

            <div style={{ fontSize: "10px", color: "#9ca3af", marginBottom: "8px" }}>
              {newItem.type} • {newItem.rarity}
            </div>
            <div style={{ borderTop: "1px solid #444", marginBottom: "8px" }} />
            {(newItem.atk || newItem.stat) && (
              <div style={statRowStyle}>
                <span style={{ color: "#fca5a5" }}>⚔️ ATK:</span>
                <span>
                  {newItem.atk || newItem.stat}
                  {currentItem && (
                    <span style={{ color: atkDiff.color, marginLeft: "6px" }}>({atkDiff.text})</span>
                  )}
                </span>
              </div>
            )}
            {newItem.def !== undefined && newItem.def > 0 && (
              <div style={statRowStyle}>
                <span style={{ color: "#93c5fd" }}>🛡️ DEF:</span>
                <span>
                  {newItem.def}
                  {currentItem && (
                    <span style={{ color: defDiff.color, marginLeft: "6px" }}>({defDiff.text})</span>
                  )}
                </span>
              </div>
            )}
            {newItem.str && (
              <div style={statRowStyle}>
                <span style={{ color: "#fca5a5" }}>STR:</span>
                <span>
                  <span style={{ color: "#22c55e" }}>+{newItem.str}</span>
                  {currentItem && currentItem.str !== newItem.str && (
                    <span style={{ color: strDiff.color, marginLeft: "6px" }}>({strDiff.text})</span>
                  )}
                </span>
              </div>
            )}
            {newItem.agi && (
              <div style={statRowStyle}>
                <span style={{ color: "#86efac" }}>AGI:</span>
                <span>
                  <span style={{ color: "#22c55e" }}>+{newItem.agi}</span>
                  {currentItem && currentItem.agi !== newItem.agi && (
                    <span style={{ color: agiDiff.color, marginLeft: "6px" }}>({agiDiff.text})</span>
                  )}
                </span>
              </div>
            )}
            {newItem.vit && (
              <div style={statRowStyle}>
                <span style={{ color: "#fdba74" }}>VIT:</span>
                <span>
                  <span style={{ color: "#22c55e" }}>+{newItem.vit}</span>
                  {currentItem && currentItem.vit !== newItem.vit && (
                    <span style={{ color: vitDiff.color, marginLeft: "6px" }}>({vitDiff.text})</span>
                  )}
                </span>
              </div>
            )}
            {newItem.int && (
              <div style={statRowStyle}>
                <span style={{ color: "#93c5fd" }}>INT:</span>
                <span>
                  <span style={{ color: "#22c55e" }}>+{newItem.int}</span>
                  {currentItem && currentItem.int !== newItem.int && (
                    <span style={{ color: intDiff.color, marginLeft: "6px" }}>({intDiff.text})</span>
                  )}
                </span>
              </div>
            )}
            {newItem.dex && (
              <div style={statRowStyle}>
                <span style={{ color: "#fde047" }}>DEX:</span>
                <span>
                  <span style={{ color: "#22c55e" }}>+{newItem.dex}</span>
                  {currentItem && currentItem.dex !== newItem.dex && (
                    <span style={{ color: dexDiff.color, marginLeft: "6px" }}>({dexDiff.text})</span>
                  )}
                </span>
              </div>
            )}
            {newItem.luk && (
              <div style={statRowStyle}>
                <span style={{ color: "#c084fc" }}>LUK:</span>
                <span>
                  <span style={{ color: "#22c55e" }}>+{newItem.luk}</span>
                  {currentItem && currentItem.luk !== newItem.luk && (
                    <span style={{ color: lukDiff.color, marginLeft: "6px" }}>({lukDiff.text})</span>
                  )}
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Action Buttons */}
        <div style={{ display: "flex", gap: "10px" }}>
          <button
            onClick={onCancel}
            style={{
              flex: 1,
              padding: "12px",
              background: "#444",
              color: "white",
              border: "none",
              borderRadius: "6px",
              cursor: "pointer",
              fontSize: "14px",
              fontWeight: "bold",
            }}
          >
            ❌ Cancel
          </button>
          <button
            onClick={onEquip}
            style={{
              flex: 1,
              padding: "12px",
              background: "linear-gradient(45deg, #10b981, #059669)",
              color: "white",
              border: "none",
              borderRadius: "6px",
              cursor: "pointer",
              fontSize: "14px",
              fontWeight: "bold",
              boxShadow: "0 4px 15px rgba(16, 185, 129, 0.4)",
            }}
          >
            ✅ Equip
          </button>
        </div>
      </div>
    </div>
  );
}
