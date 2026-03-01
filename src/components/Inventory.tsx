import { Equipment, EquippedItems } from "../types/equipment";

interface InventoryProps {
  inventory: Equipment[];
  equipped: EquippedItems;
  onEquip: (item: Equipment) => void;
}

export function Inventory({ inventory, equipped, onEquip }: InventoryProps) {
  return (
    <div
      style={{
        background: "#2a2a2a",
        padding: "10px",
        borderRadius: "6px",
        marginBottom: "15px",
        border: "1px solid #444",
      }}
    >
      <h3
        style={{
          margin: "0 0 8px 0",
          fontSize: "14px",
          color: "#fbbf24",
        }}
      >
        🎒 Inventory ({inventory.length})
      </h3>
      <div
        style={{
          display: "flex",
          gap: "6px",
          marginBottom: "8px",
          fontSize: "11px",
        }}
      >
        <div
          style={{
            flex: 1,
            background: "#111",
            padding: "6px",
            borderRadius: "4px",
            border: equipped.weapon ? "1px solid #059669" : "1px solid #444",
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap",
          }}
        >
          ⚔️{" "}
          {equipped.weapon
            ? `${equipped.weapon.name} (+${equipped.weapon.stat})`
            : "No Weapon"}
        </div>
        <div
          style={{
            flex: 1,
            background: "#111",
            padding: "6px",
            borderRadius: "4px",
            border: equipped.armor ? "1px solid #2563eb" : "1px solid #444",
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap",
          }}
        >
          🛡️{" "}
          {equipped.armor
            ? `${equipped.armor.name} (+${equipped.armor.stat})`
            : "No Armor"}
        </div>
      </div>
      <div
        style={{
          display: "flex",
          flexWrap: "wrap",
          gap: "3px",
          maxHeight: "70px",
          overflowY: "auto",
        }}
      >
        {inventory.length === 0 ? (
          <div style={{ color: "#666", fontSize: "10px" }}>Empty...</div>
        ) : (
          inventory.map((item) => (
            <button
              key={item.id}
              onClick={() => onEquip(item)}
              style={{
                fontSize: "9px",
                padding: "2px 4px",
                background:
                  item.rarity === "epic"
                    ? "#a855f7"
                    : item.rarity === "rare"
                      ? "#3b82f6"
                      : "#555",
                color: "white",
                border: "none",
                borderRadius: "3px",
                cursor: "pointer",
                maxWidth: "90px",
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
              }}
            >
              {item.name}
            </button>
          ))
        )}
      </div>
    </div>
  );
}
