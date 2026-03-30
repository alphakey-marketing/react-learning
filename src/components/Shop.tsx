import { useState } from "react";
import { Character } from "../types/character";
import { Equipment, getEquipmentIcon } from "../types/equipment";
import { HP_POTION_COST, MP_POTION_COST, HP_POTION_HEAL_FLAT, HP_POTION_HEAL_PERCENT } from "../data/constants";
import { RefineNPC, RefineResult } from "./RefineNPC";
import { JobChangeNPC } from "./JobChangeNPC";
import { EquippedItems } from "../types/equipment";
import { JobClass } from "../types/character";

type ShopSubTab = "items" | "refine" | "job";

interface ShopProps {
  character: Character;
  isInTown: boolean;
  inventory: Equipment[];
  equipped: EquippedItems;
  onSellItem: (item: Equipment) => void;
  onBuyHpPotion: (amount: number) => void;
  onBuyMpPotion: (amount: number) => void;
  onRefine: (item: Equipment, isEquipped: boolean, slotKey?: keyof EquippedItems) => RefineResult | void;
  onJobChange: (newJob: JobClass) => void;
  // Slide-in panel control (optional — defaults to always-open with no-op close)
  isOpen?: boolean;
  onClose?: () => void;
}

export function Shop({
  character,
  isInTown,
  inventory,
  equipped,
  onSellItem,
  onBuyHpPotion,
  onBuyMpPotion,
  onRefine,
  onJobChange,
  isOpen = true,
  onClose = () => {},
}: ShopProps) {
  const [subTab, setSubTab] = useState<ShopSubTab>("items");
  const [selectedItems, setSelectedItems] = useState<Set<number>>(new Set());

  const hpHealAmount = HP_POTION_HEAL_FLAT + Math.floor(character.maxHp * HP_POTION_HEAL_PERCENT);

  const calculateSellPrice = (item: Equipment) =>
    Math.floor((item.atk || item.def || item.stat || 1) * 2);

  const getRarityColor = (rarity: string) => {
    const colors: Record<string, string> = {
      legendary: "#ff6b35",
      epic: "#a855f7",
      rare: "#3b82f6",
      uncommon: "#22c55e",
      common: "#9ca3af",
    };
    return colors[rarity] || "#9ca3af";
  };

  const handleToggleItem = (itemId: number) => {
    setSelectedItems(prev => {
      const next = new Set(prev);
      next.has(itemId) ? next.delete(itemId) : next.add(itemId);
      return next;
    });
  };

  const handleSellSelected = () => {
    inventory.filter(i => selectedItems.has(i.id)).forEach(onSellItem);
    setSelectedItems(new Set());
  };

  const SUB_TABS: { id: ShopSubTab; label: string; icon: string }[] = [
    { id: "items", label: "Items", icon: "🛒" },
    { id: "refine", label: "Refine", icon: "🔨" },
    { id: "job", label: "Job", icon: "🧙" },
  ];

  return (
    <>
      {/* Backdrop */}
      {isOpen && (
        <div
          onClick={onClose}
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.4)",
            zIndex: 850,
          }}
        />
      )}

      {/* Slide-in panel from the right */}
      <div
        style={{
          position: "fixed",
          top: 0,
          right: 0,
          bottom: 0,
          width: "min(100%, 420px)",
          background: "linear-gradient(180deg, #1e293b 0%, #0f172a 100%)",
          borderLeft: "1px solid rgba(255,215,0,0.2)",
          zIndex: 860,
          display: "flex",
          flexDirection: "column",
          transform: isOpen ? "translateX(0)" : "translateX(100%)",
          transition: "transform 0.35s cubic-bezier(0.4, 0, 0.2, 1)",
          overflow: "hidden",
          pointerEvents: isOpen ? "auto" : "none",
        }}
      >
        {/* Header */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "10px",
            padding: "14px",
            borderBottom: "1px solid #1e293b",
            flexShrink: 0,
            paddingTop: "calc(14px + env(safe-area-inset-top, 0px))",
          }}
        >
          <button
            onClick={onClose}
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
              flexShrink: 0,
            }}
          >
            ‹
          </button>
          <div>
            <div style={{ fontSize: "13px", fontWeight: "bold", color: "#fbbf24" }}>
              🏪 Town Shop
            </div>
            <div style={{ fontSize: "10px", color: "#64748b" }}>
              {isInTown ? "Welcome, adventurer!" : "⚠️ Return to town to shop"}
            </div>
          </div>
        </div>

        {/* Sub-tabs */}
        <div
          style={{
            display: "flex",
            borderBottom: "1px solid #1e293b",
            flexShrink: 0,
          }}
        >
          {SUB_TABS.map(tab => (
            <button
              key={tab.id}
              onClick={() => setSubTab(tab.id)}
              style={{
                flex: 1,
                padding: "10px 6px",
                background: "transparent",
                color: subTab === tab.id ? "#fbbf24" : "#64748b",
                border: "none",
                borderBottom: subTab === tab.id ? "2px solid #fbbf24" : "2px solid transparent",
                cursor: "pointer",
                fontSize: "12px",
                fontWeight: subTab === tab.id ? "bold" : "normal",
                touchAction: "manipulation",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: "2px",
              }}
            >
              <span style={{ fontSize: "12px" }}>{tab.icon}</span>
              <span>{tab.label}</span>
            </button>
          ))}
        </div>

        {/* Content area */}
        <div
          style={{
            flex: 1,
            overflowY: "auto",
            WebkitOverflowScrolling: "touch",
            padding: subTab === "refine" || subTab === "job" ? "0" : "12px",
            paddingBottom: "calc(12px + env(safe-area-inset-bottom, 0px))",
          }}
        >
          {/* ── Items Sub-tab ── */}
          {subTab === "items" && (
            <div>
              {!isInTown && (
                <div
                  style={{
                    background: "rgba(239,68,68,0.1)",
                    border: "1px solid #ef4444",
                    borderRadius: "8px",
                    padding: "10px",
                    marginBottom: "12px",
                    fontSize: "12px",
                    color: "#fca5a5",
                    textAlign: "center",
                  }}
                >
                  ⚠️ Return to town to purchase items
                </div>
              )}

              {/* HP Potions */}
              <div style={{ marginBottom: "12px" }}>
                <div style={{ fontSize: "11px", color: "#fbbf24", fontWeight: "bold", marginBottom: "6px" }}>
                  🍖 HP Potions
                </div>
                <div style={{ fontSize: "10px", color: "#64748b", marginBottom: "5px" }}>
                  {HP_POTION_COST}g each · Heals ~{hpHealAmount} HP
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "6px" }}>
                  {[1, 5, 10].map(amount => (
                    <button
                      key={amount}
                      onClick={() => onBuyHpPotion(amount)}
                      disabled={!isInTown || character.gold < HP_POTION_COST * amount}
                      style={{
                        minHeight: "52px",
                        padding: "8px",
                        background: isInTown && character.gold >= HP_POTION_COST * amount
                          ? "linear-gradient(135deg, #ef4444, #dc2626)"
                          : "#374151",
                        color: "white",
                        border: "none",
                        borderRadius: "8px",
                        cursor: isInTown && character.gold >= HP_POTION_COST * amount ? "pointer" : "not-allowed",
                        opacity: isInTown && character.gold >= HP_POTION_COST * amount ? 1 : 0.5,
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center",
                        justifyContent: "center",
                        gap: "2px",
                        touchAction: "manipulation",
                      }}
                    >
                      <span style={{ fontSize: "14px" }}>🍖 ×{amount}</span>
                      <span style={{ fontSize: "10px", opacity: 0.85 }}>{HP_POTION_COST * amount}g</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* MP Potions */}
              <div style={{ marginBottom: "16px" }}>
                <div style={{ fontSize: "11px", color: "#fbbf24", fontWeight: "bold", marginBottom: "8px" }}>
                  🧪 MP Potions
                </div>
                <div style={{ fontSize: "11px", color: "#64748b", marginBottom: "6px" }}>
                  {MP_POTION_COST}g each
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "6px" }}>
                  {[1, 5, 10].map(amount => (
                    <button
                      key={amount}
                      onClick={() => onBuyMpPotion(amount)}
                      disabled={!isInTown || character.gold < MP_POTION_COST * amount}
                      style={{
                        minHeight: "52px",
                        padding: "8px",
                        background: isInTown && character.gold >= MP_POTION_COST * amount
                          ? "linear-gradient(135deg, #3b82f6, #2563eb)"
                          : "#374151",
                        color: "white",
                        border: "none",
                        borderRadius: "8px",
                        cursor: isInTown && character.gold >= MP_POTION_COST * amount ? "pointer" : "not-allowed",
                        opacity: isInTown && character.gold >= MP_POTION_COST * amount ? 1 : 0.5,
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center",
                        justifyContent: "center",
                        gap: "2px",
                        touchAction: "manipulation",
                      }}
                    >
                      <span style={{ fontSize: "14px" }}>🧪 ×{amount}</span>
                      <span style={{ fontSize: "10px", opacity: 0.85 }}>{MP_POTION_COST * amount}g</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Sell section */}
              <div>
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    marginBottom: "8px",
                  }}
                >
                  <div style={{ fontSize: "12px", color: "#fbbf24", fontWeight: "bold" }}>
                    💰 Sell Items
                  </div>
                  {selectedItems.size > 0 && (
                    <button
                      onClick={handleSellSelected}
                      style={{
                        minHeight: "36px",
                        padding: "6px 12px",
                        background: "linear-gradient(135deg, #f59e0b, #d97706)",
                        color: "white",
                        border: "none",
                        borderRadius: "6px",
                        cursor: "pointer",
                        fontSize: "11px",
                        fontWeight: "bold",
                        touchAction: "manipulation",
                      }}
                    >
                      Sell {selectedItems.size} →{" "}
                      {inventory
                        .filter(i => selectedItems.has(i.id))
                        .reduce((sum, i) => sum + calculateSellPrice(i), 0)}g
                    </button>
                  )}
                </div>

                {inventory.length === 0 ? (
                  <div style={{ color: "#475569", textAlign: "center", padding: "20px", fontSize: "13px" }}>
                    No items to sell
                  </div>
                ) : (
                  <div
                    style={{
                      display: "grid",
                      gridTemplateColumns: "1fr 1fr",
                      gap: "6px",
                    }}
                  >
                    {inventory.map(item => {
                      const isSelected = selectedItems.has(item.id);
                      const rarityColor = getRarityColor(item.rarity);
                      return (
                        <button
                          key={item.id}
                          onClick={() => handleToggleItem(item.id)}
                          style={{
                            padding: "8px",
                            background: isSelected ? "rgba(34,197,94,0.15)" : "#0f172a",
                            border: "1px solid " + (isSelected ? "#22c55e" : rarityColor),
                            borderRadius: "8px",
                            cursor: "pointer",
                            display: "flex",
                            alignItems: "center",
                            gap: "8px",
                            textAlign: "left",
                            minHeight: "52px",
                            touchAction: "manipulation",
                          }}
                        >
                          <span style={{ fontSize: "20px", flexShrink: 0 }}>{getEquipmentIcon(item)}</span>
                          <div style={{ flex: 1, minWidth: 0 }}>
                            <div
                              style={{
                                color: rarityColor,
                                fontSize: "11px",
                                fontWeight: "bold",
                                overflow: "hidden",
                                textOverflow: "ellipsis",
                                whiteSpace: "nowrap",
                              }}
                            >
                              {item.name}
                            </div>
                            <div style={{ color: "#64748b", fontSize: "9px" }}>
                              {calculateSellPrice(item)}g
                            </div>
                          </div>
                          {isSelected && (
                            <span style={{ color: "#22c55e", fontSize: "14px", flexShrink: 0 }}>✓</span>
                          )}
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ── Refine Sub-tab ── */}
          {subTab === "refine" && (
            <div style={{ height: "100%", overflow: "hidden" }}>
              <RefineNPC
                character={character}
                inventory={inventory}
                equipped={equipped}
                onRefine={onRefine}
                onClose={() => setSubTab("items")}
                embedded
              />
            </div>
          )}

          {/* ── Job Change Sub-tab ── */}
          {subTab === "job" && (
            <div style={{ height: "100%", overflow: "hidden" }}>
              <JobChangeNPC
                currentJob={character.jobClass}
                currentJobLevel={character.jobLevel}
                onJobChange={newJob => {
                  onJobChange(newJob);
                  setSubTab("items");
                }}
                onClose={() => setSubTab("items")}
                embedded
              />
            </div>
          )}
        </div>
      </div>
    </>
  );
}
