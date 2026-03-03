import { useState } from "react";
import { Character } from "../types/character";

interface DevToolsProps {
  character: Character;
  onAddBaseLevel: () => void;
  onAddJobLevel: () => void;
  onAddGold: (amount: number) => void;
  onAddPotions: (hp: number, mp: number) => void;
  onFullHeal: () => void;
  onAddGear: () => void;
  onUnlockAllZones: () => void;
}

export function DevTools({
  character,
  onAddBaseLevel,
  onAddJobLevel,
  onAddGold,
  onAddPotions,
  onFullHeal,
  onAddGear,
  onUnlockAllZones,
}: DevToolsProps) {
  const [isMinimized, setIsMinimized] = useState(false);
  
  return (
    <div
      style={{
        position: "fixed",
        top: "20px",
        right: "20px",
        width: isMinimized ? "200px" : "280px",
        background: "linear-gradient(135deg, #1e1e2e 0%, #2d2d44 100%)",
        border: "2px solid #f59e0b",
        borderRadius: "12px",
        padding: "15px",
        boxShadow: "0 8px 32px rgba(245, 158, 11, 0.3)",
        zIndex: 9999,
        maxHeight: isMinimized ? "auto" : "90vh",
        overflowY: isMinimized ? "visible" : "auto",
        transition: "all 0.3s ease",
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          marginBottom: isMinimized ? "0" : "12px",
          paddingBottom: isMinimized ? "0" : "10px",
          borderBottom: isMinimized ? "none" : "2px solid #f59e0b",
        }}
      >
        <h3
          style={{
            margin: 0,
            fontSize: "16px",
            color: "#f59e0b",
            fontWeight: "bold",
          }}
        >
          🛠️ Dev Tools
        </h3>
        <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
          <div
            style={{
              fontSize: "10px",
              color: "#888",
              background: "#ff0000",
              padding: "2px 6px",
              borderRadius: "4px",
              fontWeight: "bold",
            }}
          >
            TEST
          </div>
          <button
            onClick={() => setIsMinimized(!isMinimized)}
            style={{
              background: "transparent",
              border: "1px solid #f59e0b",
              color: "#f59e0b",
              borderRadius: "4px",
              cursor: "pointer",
              padding: "2px 8px",
              fontSize: "14px",
              fontWeight: "bold",
            }}
          >
            {isMinimized ? "➕" : "➖"}
          </button>
        </div>
      </div>

      {!isMinimized && (
        <>
          {/* Current Stats Display */}
          <div
            style={{
              background: "#1a1a2a",
              padding: "10px",
              borderRadius: "6px",
              marginBottom: "12px",
              border: "1px solid #444",
            }}
          >
            <div style={{ fontSize: "11px", color: "#aaa", marginBottom: "6px" }}>
              Current Status:
            </div>
            <div style={{ fontSize: "10px", color: "#fff", lineHeight: "1.5" }}>
              Base Lv.{character.level} | Job Lv.{character.jobLevel}
              <br />
              Gold: {character.gold}g
              <br />
              HP: {character.hp}/{character.maxHp} | MP: {character.mp}/
              {character.maxMp}
            </div>
          </div>

          {/* Level Controls */}
          <div style={{ marginBottom: "10px" }}>
            <div
              style={{
                fontSize: "11px",
                color: "#fbbf24",
                marginBottom: "6px",
                fontWeight: "bold",
              }}
            >
              🌟 Level Up
            </div>
            <div style={{ display: "flex", gap: "6px" }}>
              <button
                onClick={onAddBaseLevel}
                style={{
                  flex: 1,
                  padding: "8px",
                  background: "linear-gradient(45deg, #3b82f6, #2563eb)",
                  color: "white",
                  border: "none",
                  borderRadius: "6px",
                  cursor: "pointer",
                  fontSize: "11px",
                  fontWeight: "bold",
                  boxShadow: "0 2px 8px rgba(59, 130, 246, 0.4)",
                }}
              >
                +1 Base Lv
              </button>
              <button
                onClick={onAddJobLevel}
                style={{
                  flex: 1,
                  padding: "8px",
                  background: "linear-gradient(45deg, #8b5cf6, #7c3aed)",
                  color: "white",
                  border: "none",
                  borderRadius: "6px",
                  cursor: "pointer",
                  fontSize: "11px",
                  fontWeight: "bold",
                  boxShadow: "0 2px 8px rgba(139, 92, 246, 0.4)",
                }}
              >
                +1 Job Lv
              </button>
            </div>
          </div>

          {/* Gold Controls */}
          <div style={{ marginBottom: "10px" }}>
            <div
              style={{
                fontSize: "11px",
                color: "#fbbf24",
                marginBottom: "6px",
                fontWeight: "bold",
              }}
            >
              💰 Add Gold
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "6px" }}>
              <button
                onClick={() => onAddGold(1000)}
                style={{
                  padding: "8px",
                  background: "#d97706",
                  color: "white",
                  border: "none",
                  borderRadius: "6px",
                  cursor: "pointer",
                  fontSize: "10px",
                  fontWeight: "bold",
                }}
              >
                +1K
              </button>
              <button
                onClick={() => onAddGold(10000)}
                style={{
                  padding: "8px",
                  background: "#d97706",
                  color: "white",
                  border: "none",
                  borderRadius: "6px",
                  cursor: "pointer",
                  fontSize: "10px",
                  fontWeight: "bold",
                }}
              >
                +10K
              </button>
              <button
                onClick={() => onAddGold(100000)}
                style={{
                  padding: "8px",
                  background: "#d97706",
                  color: "white",
                  border: "none",
                  borderRadius: "6px",
                  cursor: "pointer",
                  fontSize: "10px",
                  fontWeight: "bold",
                }}
              >
                +100K
              </button>
            </div>
          </div>

          {/* Potion Controls */}
          <div style={{ marginBottom: "10px" }}>
            <div
              style={{
                fontSize: "11px",
                color: "#fbbf24",
                marginBottom: "6px",
                fontWeight: "bold",
              }}
            >
              🧪 Add Potions
            </div>
            <div style={{ display: "flex", gap: "6px" }}>
              <button
                onClick={() => onAddPotions(10, 10)}
                style={{
                  flex: 1,
                  padding: "8px",
                  background: "#dc2626",
                  color: "white",
                  border: "none",
                  borderRadius: "6px",
                  cursor: "pointer",
                  fontSize: "10px",
                  fontWeight: "bold",
                }}
              >
                +10 HP
              </button>
              <button
                onClick={() => onAddPotions(0, 10)}
                style={{
                  flex: 1,
                  padding: "8px",
                  background: "#2563eb",
                  color: "white",
                  border: "none",
                  borderRadius: "6px",
                  cursor: "pointer",
                  fontSize: "10px",
                  fontWeight: "bold",
                }}
              >
                +10 MP
              </button>
              <button
                onClick={() => onAddPotions(50, 50)}
                style={{
                  flex: 1,
                  padding: "8px",
                  background: "linear-gradient(45deg, #dc2626, #2563eb)",
                  color: "white",
                  border: "none",
                  borderRadius: "6px",
                  cursor: "pointer",
                  fontSize: "10px",
                  fontWeight: "bold",
                }}
              >
                +50 Both
              </button>
            </div>
          </div>

          {/* Quick Actions */}
          <div style={{ marginBottom: "10px" }}>
            <div
              style={{
                fontSize: "11px",
                color: "#fbbf24",
                marginBottom: "6px",
                fontWeight: "bold",
              }}
            >
              ⚡ Quick Actions
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
              <button
                onClick={onFullHeal}
                style={{
                  padding: "8px",
                  background: "linear-gradient(45deg, #10b981, #059669)",
                  color: "white",
                  border: "none",
                  borderRadius: "6px",
                  cursor: "pointer",
                  fontSize: "11px",
                  fontWeight: "bold",
                  boxShadow: "0 2px 8px rgba(16, 185, 129, 0.4)",
                }}
              >
                ❤️ Full Heal (HP/MP)
              </button>
              <button
                onClick={onAddGear}
                style={{
                  padding: "8px",
                  background: "linear-gradient(45deg, #ec4899, #db2777)",
                  color: "white",
                  border: "none",
                  borderRadius: "6px",
                  cursor: "pointer",
                  fontSize: "11px",
                  fontWeight: "bold",
                  boxShadow: "0 2px 8px rgba(236, 72, 153, 0.4)",
                }}
              >
                🎯 Add Random Gear
              </button>
              <button
                onClick={onUnlockAllZones}
                style={{
                  padding: "8px",
                  background: "linear-gradient(45deg, #f59e0b, #d97706)",
                  color: "white",
                  border: "none",
                  borderRadius: "6px",
                  cursor: "pointer",
                  fontSize: "11px",
                  fontWeight: "bold",
                  boxShadow: "0 2px 8px rgba(245, 158, 11, 0.4)",
                }}
              >
                🗺️ Unlock All Zones
              </button>
            </div>
          </div>

          {/* Warning */}
          <div
            style={{
              marginTop: "12px",
              padding: "8px",
              background: "rgba(239, 68, 68, 0.1)",
              border: "1px solid #ef4444",
              borderRadius: "6px",
              fontSize: "9px",
              color: "#fca5a5",
              textAlign: "center",
            }}
          >
            ⚠️ For testing purposes only!
            <br />
            Remove before production.
          </div>
        </>
      )}
    </div>
  );
}
