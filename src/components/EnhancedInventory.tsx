import { useState } from "react";
import { Equipment, EquippedItems, getEquipmentIcon, getRarityColor, calculateGearScore } from "../types/equipment";
import { EquipmentComparisonModal } from "./EquipmentComparisonModal";

interface EnhancedInventoryProps {
  inventory: Equipment[];
  equipped: EquippedItems;
  onEquip: (item: Equipment) => void;
  onUnequip?: (slotKey: keyof EquippedItems) => void;
}

type CategoryFilter = "all" | "equipment" | "consumables" | "quest";
type SortOption = "type" | "rarity" | "power" | "name";

const EQUIPMENT_TYPES = ["weapon", "armor", "head", "garment", "footgear", "accessory"];

const CATEGORY_TABS: { id: CategoryFilter; label: string }[] = [
  { id: "all", label: "All" },
  { id: "equipment", label: "Equipment" },
  { id: "consumables", label: "Consumables" },
  { id: "quest", label: "Quest" },
];

export function EnhancedInventory({ inventory, equipped, onEquip, onUnequip }: EnhancedInventoryProps) {
  const [category, setCategory] = useState<CategoryFilter>("all");
  const [sortBy, setSortBy] = useState<SortOption>("type");
  const [selectedItem, setSelectedItem] = useState<Equipment | null>(null);
  const [selectedEquippedSlot, setSelectedEquippedSlot] = useState<keyof EquippedItems | null>(null);
  const [showDetail, setShowDetail] = useState(false);

 const filteredInventory = inventory.filter(item => {
  if (category === "all") return true;
  if (category === "equipment") return EQUIPMENT_TYPES.includes(item.type);
  if (category === "consumables") return item.type === "consumable";
  if (category === "quest") return item.type === "quest";
  return false;
});

  const sortedInventory = [...filteredInventory].sort((a, b) => {
    switch (sortBy) {
      case "type": return a.type.localeCompare(b.type);
      case "rarity": {
        const order = { common: 0, uncommon: 1, rare: 2, epic: 3, legendary: 4 };
        return (order[b.rarity] || 0) - (order[a.rarity] || 0);
      }
      case "power": return calculateGearScore(b) - calculateGearScore(a);
      case "name": return a.name.localeCompare(b.name);
      default: return 0;
    }
  });

  const slots = [
    { key: "weapon" as keyof EquippedItems, label: "Weapon", icon: "⚔️" },
    { key: "armor" as keyof EquippedItems, label: "Armor", icon: "🛡️" },
    { key: "head" as keyof EquippedItems, label: "Head", icon: "🎩" },
    { key: "garment" as keyof EquippedItems, label: "Garment", icon: "🧥" },
    { key: "footgear" as keyof EquippedItems, label: "Footgear", icon: "👢" },
    { key: "accessory1" as keyof EquippedItems, label: "Acc 1", icon: "💍" },
    { key: "accessory2" as keyof EquippedItems, label: "Acc 2", icon: "💍" },
  ];

  const getCurrentlyEquipped = (item: Equipment): Equipment | null => {
    if (item.type === "accessory") {
      if (selectedEquippedSlot) return equipped[selectedEquippedSlot] || null;
      return equipped.accessory1 || equipped.accessory2 || null;
    }
    return equipped[item.type as keyof EquippedItems] || null;
  };

  const handleItemTap = (item: Equipment) => {
    setSelectedItem(item);
    setSelectedEquippedSlot(null);
    setShowDetail(true);
  };

  const handleEquipClick = () => {
    if (!selectedItem) return;
    if (selectedItem.type === "accessory" && selectedEquippedSlot) {
      onEquip({ ...selectedItem, targetSlot: selectedEquippedSlot } as any);
    } else {
      onEquip(selectedItem);
    }
    setSelectedItem(null);
    setSelectedEquippedSlot(null);
    setShowDetail(false);
  };

  const isUpgrade = (item: Equipment) => {
    if (item.type === "accessory") {
      const acc1Score = equipped.accessory1 ? calculateGearScore(equipped.accessory1) : 0;
      const acc2Score = equipped.accessory2 ? calculateGearScore(equipped.accessory2) : 0;
      return calculateGearScore(item) > acc1Score || calculateGearScore(item) > acc2Score;
    }
    const cur = equipped[item.type as keyof EquippedItems];
    return calculateGearScore(item) > (cur ? calculateGearScore(cur) : 0);
  };

  return (
    <>
      {/* Equipped slots summary — compact horizontal scroll */}
      <div
        style={{
          display: "flex",
          gap: "6px",
          overflowX: "auto",
          paddingBottom: "6px",
          marginBottom: "8px",
          WebkitOverflowScrolling: "touch",
          touchAction: "pan-x",
        }}
      >
        {slots.map(slot => {
          const item = equipped[slot.key];
          const rarityColor = item ? getRarityColor(item.rarity) : "#334155";
          return (
            <div
              key={slot.key}
              style={{
                flexShrink: 0,
                background: "#1e293b",
                border: `1px solid ${rarityColor}`,
                borderRadius: "8px",
                padding: "5px 8px",
                fontSize: "10px",
                minWidth: "70px",
                textAlign: "center",
              }}
            >
              <div style={{ fontSize: "14px", marginBottom: "2px" }}>
                {item ? getEquipmentIcon(item) : slot.icon}
              </div>
              <div style={{ color: "#64748b", fontSize: "9px" }}>{slot.label}</div>
              {item && (
                <div
                  style={{
                    color: getRarityColor(item.rarity),
                    fontSize: "9px",
                    fontWeight: "bold",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap",
                  }}
                >
                  {item.name}
                </div>
              )}
              {!item && (
                <div style={{ color: "#475569", fontSize: "9px", fontStyle: "italic" }}>Empty</div>
              )}
            </div>
          );
        })}
      </div>

      {/* Section header */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          marginBottom: "8px",
        }}
      >
        <h3 style={{ margin: 0, fontSize: "13px", color: "#fbbf24" }}>
          🎒 Inventory
        </h3>
        <span style={{ fontSize: "11px", color: "#9ca3af" }}>
          {inventory.length} items
        </span>
      </div>

      {/* Category filter tabs */}
      <div
        style={{
          display: "flex",
          gap: "0",
          marginBottom: "8px",
          borderBottom: "1px solid #1e293b",
        }}
      >
        {CATEGORY_TABS.map(tab => (
          <button
            key={tab.id}
            onClick={() => setCategory(tab.id)}
            style={{
              flex: 1,
              padding: "8px 4px",
              background: "transparent",
              color: category === tab.id ? "#fbbf24" : "#64748b",
              border: "none",
              borderBottom: category === tab.id ? "2px solid #fbbf24" : "2px solid transparent",
              cursor: "pointer",
              fontSize: "12px",
              fontWeight: category === tab.id ? "bold" : "normal",
              touchAction: "manipulation",
              transition: "color 0.15s",
            }}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Sort bar */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "6px",
          marginBottom: "8px",
        }}
      >
        <span style={{ fontSize: "9px", color: "#64748b" }}>Sort:</span>
        {(["type", "rarity", "power", "name"] as SortOption[]).map(opt => (
          <button
            key={opt}
            onClick={() => setSortBy(opt)}
            style={{
              padding: "3px 8px",
              background: sortBy === opt ? "#1d4ed8" : "#1e293b",
              color: sortBy === opt ? "white" : "#64748b",
              border: "1px solid " + (sortBy === opt ? "#3b82f6" : "#334155"),
              borderRadius: "4px",
              cursor: "pointer",
              fontSize: "10px",
              textTransform: "capitalize",
              touchAction: "manipulation",
            }}
          >
            {opt}
          </button>
        ))}
      </div>

      {/* Item list */}
      <div>
        {sortedInventory.length === 0 ? (
          <div
            style={{
              color: "#475569",
              textAlign: "center",
              padding: "40px 20px",
              fontSize: "14px",
            }}
          >
            {category === "all" ? "No items in inventory" : `No ${category} items`}
          </div>
        ) : (
          sortedInventory.map(item => {
            const icon = getEquipmentIcon(item);
            const rarityColor = getRarityColor(item.rarity);
            const gearScore = calculateGearScore(item);
            const upgrade = isUpgrade(item);
            const typeLabel = item.type === "weapon" && item.weaponType ? item.weaponType : item.type;

            return (
              <button
                key={item.id}
                onClick={() => handleItemTap(item)}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "12px",
                  width: "100%",
                  padding: "10px 12px",
                  marginBottom: "6px",
                  background: "#1e293b",
                  border: `1px solid ${rarityColor}`,
                  borderRadius: "10px",
                  cursor: "pointer",
                  textAlign: "left",
                  touchAction: "manipulation",
                  minHeight: "56px",
                }}
              >
                <div
                  style={{
                    width: "40px",
                    height: "40px",
                    flexShrink: 0,
                    background: "#0f172a",
                    borderRadius: "8px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: "18px",
                    border: `1px solid ${rarityColor}`,
                    position: "relative",
                  }}
                >
                  {icon}
                  {upgrade && (
                    <div
                      style={{
                        position: "absolute",
                        top: "-4px",
                        right: "-4px",
                        background: "#22c55e",
                        borderRadius: "50%",
                        width: "14px",
                        height: "14px",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontSize: "8px",
                        color: "white",
                        fontWeight: "bold",
                      }}
                    >
                      ▲
                    </div>
                  )}
                </div>

                <div style={{ flex: 1, minWidth: 0 }}>
                  <div
                    style={{
                      color: rarityColor,
                      fontWeight: "bold",
                      fontSize: "13px",
                      whiteSpace: "nowrap",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                    }}
                  >
                    {item.name}
                    {item.refinement !== undefined && item.refinement > 0 && (
                      <span style={{ color: "#fbbf24" }}> +{item.refinement}</span>
                    )}
                  </div>
                  <div style={{ fontSize: "10px", color: "#64748b", textTransform: "capitalize" }}>
                    {typeLabel} · {item.rarity}
                  </div>
                </div>

                <div
                  style={{
                    flexShrink: 0,
                    fontSize: "11px",
                    fontWeight: "bold",
                    color: "#fbbf24",
                    background: "#0f172a",
                    borderRadius: "6px",
                    padding: "3px 7px",
                    border: "1px solid #334155",
                  }}
                >
                  ⭐ {gearScore}
                </div>

                <span style={{ color: "#475569", fontSize: "14px" }}>›</span>
              </button>
            );
          })
        )}
      </div>

      {/* Full-screen item detail view */}
      {showDetail && selectedItem && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.92)",
            zIndex: 1000,
            display: "flex",
            flexDirection: "column",
            padding: "0",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "10px",
              padding: "14px",
              borderBottom: "1px solid #1e293b",
              flexShrink: 0,
            }}
          >
            <button
              onClick={() => { setShowDetail(false); setSelectedItem(null); }}
              style={{
                minWidth: "44px",
                minHeight: "44px",
                background: "#1e293b",
                border: "1px solid #334155",
                borderRadius: "8px",
                color: "white",
                cursor: "pointer",
                fontSize: "18px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                touchAction: "manipulation",
              }}
            >
              ‹
            </button>
            <div style={{ flex: 1 }}>
              <div
                style={{
                  color: getRarityColor(selectedItem.rarity),
                  fontWeight: "bold",
                  fontSize: "16px",
                }}
              >
                {selectedItem.name}
                {selectedItem.refinement !== undefined && selectedItem.refinement > 0 && (
                  <span style={{ color: "#fbbf24" }}> +{selectedItem.refinement}</span>
                )}
              </div>
              <div style={{ fontSize: "11px", color: "#64748b", textTransform: "capitalize" }}>
                {selectedItem.type} · {selectedItem.rarity} · ⭐ {calculateGearScore(selectedItem)}
              </div>
            </div>
          </div>

          <div style={{ flex: 1, overflowY: "auto", padding: "16px" }}>
            <div style={{ fontSize: "36px", textAlign: "center", marginBottom: "12px" }}>
              {getEquipmentIcon(selectedItem)}
            </div>

            <div
              style={{
                background: "#1e293b",
                borderRadius: "10px",
                padding: "12px",
                marginBottom: "16px",
                border: `1px solid ${getRarityColor(selectedItem.rarity)}`,
              }}
            >
              {selectedItem.atk !== undefined && selectedItem.atk > 0 && (
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "5px", fontSize: "11px" }}>
                  <span style={{ color: "#94a3b8" }}>ATK</span>
                  <span style={{ color: "#fb923c", fontWeight: "bold" }}>+{selectedItem.atk}</span>
                </div>
              )}
              {selectedItem.matk !== undefined && selectedItem.matk > 0 && (
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "6px", fontSize: "13px" }}>
                  <span style={{ color: "#94a3b8" }}>MATK</span>
                  <span style={{ color: "#a78bfa", fontWeight: "bold" }}>+{selectedItem.matk}</span>
                </div>
              )}
              {selectedItem.def !== undefined && selectedItem.def > 0 && (
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "6px", fontSize: "13px" }}>
                  <span style={{ color: "#94a3b8" }}>DEF</span>
                  <span style={{ color: "#60a5fa", fontWeight: "bold" }}>+{selectedItem.def}</span>
                </div>
              )}
              {(["str", "agi", "vit", "int", "dex", "luk"] as const).map(stat => {
                const val = selectedItem[stat];
                if (!val) return null;
                return (
                  <div key={stat} style={{ display: "flex", justifyContent: "space-between", marginBottom: "6px", fontSize: "13px" }}>
                    <span style={{ color: "#94a3b8", textTransform: "uppercase" }}>{stat}</span>
                    <span style={{ color: "#22c55e", fontWeight: "bold" }}>+{val}</span>
                  </div>
                );
              })}
            </div>
          </div>

          <div
            style={{
              padding: "14px",
              display: "flex",
              gap: "10px",
              flexShrink: 0,
              borderTop: "1px solid #1e293b",
              paddingBottom: "calc(14px + env(safe-area-inset-bottom, 0px))",
            }}
          >
            <button
              onClick={handleEquipClick}
              style={{
                flex: 1,
                minHeight: "52px",
                background: "linear-gradient(135deg, #059669, #047857)",
                color: "white",
                border: "none",
                borderRadius: "10px",
                cursor: "pointer",
                fontWeight: "bold",
                fontSize: "14px",
                touchAction: "manipulation",
              }}
            >
              ⚔️ Equip
            </button>
            <button
              onClick={() => { setShowDetail(false); setSelectedItem(null); }}
              style={{
                minWidth: "52px",
                minHeight: "52px",
                background: "#374151",
                color: "#9ca3af",
                border: "1px solid #374151",
                borderRadius: "10px",
                cursor: "pointer",
                fontSize: "13px",
                touchAction: "manipulation",
              }}
            >
              ✕
            </button>
          </div>
        </div>
      )}

      {/* Accessory slot selection */}
      {selectedItem && selectedItem.type === "accessory" && !selectedEquippedSlot && equipped.accessory1 && equipped.accessory2 && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.85)",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            zIndex: 920,
            padding: "20px",
          }}
        >
          <div
            style={{
              background: "#1e293b",
              padding: "20px",
              borderRadius: "12px",
              border: "2px solid #fbbf24",
              maxWidth: "360px",
              width: "100%",
              textAlign: "center",
            }}
          >
            <h3 style={{ color: "#fbbf24", margin: "0 0 10px 0", fontSize: "13px" }}>💍 Replace which slot?</h3>
            <div style={{ display: "flex", gap: "10px", marginBottom: "14px" }}>
              {(["accessory1", "accessory2"] as const).map((slotKey, idx) => {
                const acc = equipped[slotKey]!;
                const diff = calculateGearScore(selectedItem) - calculateGearScore(acc);
                return (
                  <button
                    key={slotKey}
                    onClick={() => setSelectedEquippedSlot(slotKey)}
                    style={{
                      flex: 1,
                      minHeight: "80px",
                      padding: "12px",
                      background: "#0f172a",
                      border: "2px solid #334155",
                      borderRadius: "10px",
                      color: "white",
                      cursor: "pointer",
                      touchAction: "manipulation",
                    }}
                  >
                    <div style={{ fontSize: "9px", color: "#64748b", marginBottom: "3px" }}>Slot {idx + 1}</div>
                    <div style={{ color: getRarityColor(acc.rarity), fontWeight: "bold", fontSize: "11px" }}>{acc.name}</div>
                    <div style={{ color: diff > 0 ? "#22c55e" : "#ef4444", fontSize: "10px", marginTop: "4px" }}>
                      {diff > 0 ? "▲" : "▼"} {Math.abs(diff)} power
                    </div>
                  </button>
                );
              })}
            </div>
            <button
              onClick={() => { setSelectedItem(null); setShowDetail(false); }}
              style={{
                width: "100%",
                minHeight: "44px",
                padding: "10px",
                background: "#374151",
                color: "#9ca3af",
                border: "none",
                borderRadius: "8px",
                cursor: "pointer",
                touchAction: "manipulation",
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
          selectedEquippedSlot) && showDetail === false && (
          <EquipmentComparisonModal
            newItem={selectedItem}
            currentItem={getCurrentlyEquipped(selectedItem)}
            onEquip={handleEquipClick}
            onCancel={() => {
              setSelectedItem(null);
              setSelectedEquippedSlot(null);
            }}
          />
        )
      )}
    </>
  );
}