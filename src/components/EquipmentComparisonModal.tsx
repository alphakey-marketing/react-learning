import { Equipment, getRarityColor, getEquipmentIcon, calculateGearScore } from "../types/equipment";

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
  const currentRarityColor = currentItem ? getRarityColor(currentItem.rarity) : "#555";
  const newIcon = getEquipmentIcon(newItem);
  const currentIcon = currentItem ? getEquipmentIcon(currentItem) : "❌";

  const newGearScore = calculateGearScore(newItem);
  const currentGearScore = currentItem ? calculateGearScore(currentItem) : 0;
  const scoreDiff = newGearScore - currentGearScore;

  const getItemAtk = (item: Equipment): number => item.type === "weapon" ? (item.atk || 0) : 0;
  const getItemMatk = (item: Equipment): number => item.type === "weapon" ? (item.matk || 0) : 0;
  const getItemDef = (item: Equipment): number => {
    const armorTypes = ["armor", "head", "garment", "footgear"];
    return armorTypes.includes(item.type) ? (item.def || 0) : 0;
  };

  const diff = (newVal: number = 0, oldVal: number = 0) => {
    const d = newVal - oldVal;
    if (d > 0) return { text: `▲ Better (+${d})`, color: "#22c55e" };
    if (d < 0) return { text: `▼ Worse (${d})`, color: "#ef4444" };
    return { text: "— Same", color: "#6b7280" };
  };

  const statComparisons = [
    currentItem ? { label: "⚔️ ATK", d: diff(getItemAtk(newItem), getItemAtk(currentItem)) } : null,
    currentItem ? { label: "🔮 MATK", d: diff(getItemMatk(newItem), getItemMatk(currentItem)) } : null,
    currentItem ? { label: "🛡️ DEF", d: diff(getItemDef(newItem), getItemDef(currentItem)) } : null,
    currentItem ? { label: "STR", d: diff(newItem.str || 0, currentItem.str || 0) } : null,
    currentItem ? { label: "AGI", d: diff(newItem.agi || 0, currentItem.agi || 0) } : null,
    currentItem ? { label: "VIT", d: diff(newItem.vit || 0, currentItem.vit || 0) } : null,
    currentItem ? { label: "INT", d: diff(newItem.int || 0, currentItem.int || 0) } : null,
    currentItem ? { label: "DEX", d: diff(newItem.dex || 0, currentItem.dex || 0) } : null,
    currentItem ? { label: "LUK", d: diff(newItem.luk || 0, currentItem.luk || 0) } : null,
  ].filter(Boolean).filter(row => row!.d.text !== "— Same");

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(0, 0, 0, 0.88)",
        display: "flex",
        justifyContent: "center",
        alignItems: "flex-end",
        zIndex: 10000,
        padding: "0",
      }}
      onClick={onCancel}
    >
      <div
        onClick={e => e.stopPropagation()}
        style={{
          background: "linear-gradient(180deg, #1e293b 0%, #0f172a 100%)",
          border: `2px solid ${scoreDiff > 0 ? "#22c55e" : "#fbbf24"}`,
          borderRadius: "16px 16px 0 0",
          padding: "20px",
          width: "100%",
          maxWidth: "480px",
          maxHeight: "85vh",
          overflowY: "auto",
          boxShadow: `0 -8px 32px ${scoreDiff > 0 ? "rgba(34,197,94,0.25)" : "rgba(251,191,36,0.25)"}`,
        }}
      >
        {/* Title */}
        <div
          style={{
            textAlign: "center",
            marginBottom: "16px",
            fontSize: "14px",
            color: "#94a3b8",
          }}
        >
          {scoreDiff > 0
            ? "✅ This is an upgrade!"
            : scoreDiff < 0
            ? "⚠️ This is a downgrade"
            : "Same power level"}
        </div>

        {/* Current item — on top */}
        {currentItem && (
          <div
            style={{
              background: "#0f172a",
              border: `1px solid ${currentRarityColor}`,
              borderRadius: "10px",
              padding: "12px",
              marginBottom: "8px",
            }}
          >
            <div style={{ fontSize: "10px", color: "#64748b", marginBottom: "6px" }}>CURRENTLY EQUIPPED</div>
            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
              <span style={{ fontSize: "28px" }}>{currentIcon}</span>
              <div>
                <div style={{ color: currentRarityColor, fontWeight: "bold", fontSize: "14px" }}>
                  {currentItem.name}
                  {currentItem.refinement !== undefined && currentItem.refinement > 0 && (
                    <span style={{ color: "#fbbf24" }}> +{currentItem.refinement}</span>
                  )}
                </div>
                <div style={{ fontSize: "12px", color: "#64748b" }}>
                  ⭐ {currentGearScore} power · {currentItem.rarity}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Stat differences */}
        {currentItem && statComparisons.length > 0 && (
          <div
            style={{
              background: "#1e293b",
              borderRadius: "8px",
              padding: "10px 12px",
              marginBottom: "8px",
            }}
          >
            {statComparisons.map(row => (
              <div
                key={row!.label}
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  padding: "3px 0",
                  fontSize: "12px",
                }}
              >
                <span style={{ color: "#94a3b8" }}>{row!.label}</span>
                <span style={{ color: row!.d.color, fontWeight: "bold" }}>{row!.d.text}</span>
              </div>
            ))}
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                padding: "6px 0 2px",
                fontSize: "13px",
                borderTop: "1px solid #1e293b",
                marginTop: "4px",
              }}
            >
              <span style={{ color: "#94a3b8" }}>⭐ Power</span>
              <span
                style={{
                  color: scoreDiff > 0 ? "#22c55e" : scoreDiff < 0 ? "#ef4444" : "#6b7280",
                  fontWeight: "bold",
                }}
              >
                {scoreDiff > 0 ? `▲ +${scoreDiff}` : scoreDiff < 0 ? `▼ ${scoreDiff}` : "— Same"}
              </span>
            </div>
          </div>
        )}

        {/* New item — below */}
        <div
          style={{
            background: "#0f172a",
            border: `2px solid ${newRarityColor}`,
            borderRadius: "10px",
            padding: "12px",
            marginBottom: "16px",
          }}
        >
          <div style={{ fontSize: "10px", color: "#64748b", marginBottom: "6px" }}>NEW ITEM</div>
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <span style={{ fontSize: "28px" }}>{newIcon}</span>
            <div>
              <div style={{ color: newRarityColor, fontWeight: "bold", fontSize: "14px" }}>
                {newItem.name}
                {newItem.refinement !== undefined && newItem.refinement > 0 && (
                  <span style={{ color: "#fbbf24" }}> +{newItem.refinement}</span>
                )}
              </div>
              <div style={{ fontSize: "12px", color: "#64748b" }}>
                ⭐ {newGearScore} power · {newItem.rarity}
              </div>
            </div>
          </div>
        </div>

        {/* Action buttons */}
        <div style={{ display: "flex", gap: "10px" }}>
          <button
            onClick={onEquip}
            style={{
              flex: 1,
              minHeight: "52px",
              background: "linear-gradient(135deg, #059669, #047857)",
              color: "white",
              border: "none",
              borderRadius: "10px",
              cursor: "pointer",
              fontWeight: "bold",
              fontSize: "15px",
              touchAction: "manipulation",
            }}
          >
            ⚔️ Equip
          </button>
          <button
            onClick={onCancel}
            style={{
              flex: 1,
              minHeight: "52px",
              background: "#374151",
              color: "#9ca3af",
              border: "1px solid #374151",
              borderRadius: "10px",
              cursor: "pointer",
              fontSize: "15px",
              touchAction: "manipulation",
            }}
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}
