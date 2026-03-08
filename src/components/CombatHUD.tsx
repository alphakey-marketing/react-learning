import { Character } from "../types/character";
import { useState } from "react";

interface CombatHUDProps {
  character: Character;
  hpPotions: number;
  mpPotions: number;
  autoHpPercent: number;
  autoMpPercent: number;
  onUseHpPotion: () => void;
  onUseMpPotion: () => void;
  inTown: boolean;
}

export function CombatHUD({
  character,
  hpPotions,
  mpPotions,
  autoHpPercent,
  autoMpPercent,
  onUseHpPotion,
  onUseMpPotion,
  inTown,
}: CombatHUDProps) {
  const [isMinimized, setIsMinimized] = useState(false);
  
  if (inTown) return null;

  const hpPercent = (character.hp / character.maxHp) * 100;
  const mpPercent = (character.mp / character.maxMp) * 100;
  const isHpLow = hpPercent < 30;

  // Minimized view - just show compact bars and toggle button
  if (isMinimized) {
    return (
      <div
        style={{
          position: "fixed",
          bottom: "20px",
          left: "20px",
          background: "rgba(17, 24, 39, 0.95)",
          border: "2px solid #374151",
          borderRadius: "12px",
          padding: "8px",
          minWidth: "120px",
          boxShadow: "0 4px 20px rgba(0, 0, 0, 0.5)",
          backdropFilter: "blur(10px)",
          zIndex: 999,
        }}
      >
        {/* Compact HP Bar */}
        <div style={{ marginBottom: "6px" }}>
          <div
            style={{
              width: "100%",
              height: "12px",
              background: "#1f2937",
              borderRadius: "6px",
              overflow: "hidden",
              border: isHpLow ? "1px solid #ef4444" : "1px solid #374151",
            }}
          >
            <div
              style={{
                width: `${hpPercent}%`,
                height: "100%",
                background:
                  hpPercent > 50
                    ? "linear-gradient(to right, #10b981, #22c55e)"
                    : hpPercent > 20
                    ? "linear-gradient(to right, #f59e0b, #fbbf24)"
                    : "linear-gradient(to right, #ef4444, #dc2626)",
                transition: "width 0.3s ease-out",
              }}
            />
          </div>
        </div>
        
        {/* Compact MP Bar */}
        <div style={{ marginBottom: "6px" }}>
          <div
            style={{
              width: "100%",
              height: "12px",
              background: "#1f2937",
              borderRadius: "6px",
              overflow: "hidden",
              border: "1px solid #374151",
            }}
          >
            <div
              style={{
                width: `${mpPercent}%`,
                height: "100%",
                background: "linear-gradient(to right, #3b82f6, #60a5fa)",
                transition: "width 0.3s ease-out",
              }}
            />
          </div>
        </div>
        
        {/* Expand Button */}
        <button
          onClick={() => setIsMinimized(false)}
          style={{
            width: "100%",
            padding: "6px",
            background: "#374151",
            color: "white",
            border: "none",
            borderRadius: "6px",
            fontSize: "12px",
            cursor: "pointer",
            fontWeight: "bold",
          }}
        >
          ➕ Expand
        </button>
      </div>
    );
  }

  return (
    <div
      style={{
        position: "fixed",
        bottom: "20px",
        left: "20px",
        background: "rgba(17, 24, 39, 0.95)",
        border: "2px solid #374151",
        borderRadius: "12px",
        padding: "15px",
        minWidth: "280px",
        maxWidth: "90vw", // Mobile responsive
        boxShadow: "0 4px 20px rgba(0, 0, 0, 0.5)",
        backdropFilter: "blur(10px)",
        zIndex: 999,
      }}
    >
      {/* Minimize Button */}
      <button
        onClick={() => setIsMinimized(true)}
        style={{
          position: "absolute",
          top: "8px",
          right: "8px",
          background: "#374151",
          color: "#9ca3af",
          border: "none",
          borderRadius: "4px",
          padding: "4px 8px",
          fontSize: "12px",
          cursor: "pointer",
          fontWeight: "bold",
        }}
        title="Minimize"
      >
        ➖
      </button>
      
      {/* HP Bar */}
      <div style={{ marginBottom: "12px" }}>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            marginBottom: "4px",
            fontSize: "12px",
            fontWeight: "bold",
          }}
        >
          <span style={{ color: "#ef4444" }}>❤️ HP</span>
          <span style={{ color: "#fff" }}>
            {character.hp} / {character.maxHp} ({Math.floor(hpPercent)}%)
          </span>
        </div>
        <div
          style={{
            width: "100%",
            height: "24px",
            background: "#1f2937",
            borderRadius: "6px",
            overflow: "hidden",
            border: isHpLow ? "2px solid #ef4444" : "1px solid #374151",
            position: "relative",
          }}
        >
          <div
            style={{
              width: `${hpPercent}%`,
              height: "100%",
              background:
                hpPercent > 50
                  ? "linear-gradient(to right, #10b981, #22c55e)"
                  : hpPercent > 20
                  ? "linear-gradient(to right, #f59e0b, #fbbf24)"
                  : "linear-gradient(to right, #ef4444, #dc2626)",
              transition: "width 0.3s ease-out",
              animation: isHpLow ? "hpPulse 1s infinite" : "none",
            }}
          />
          {autoHpPercent > 0 && (
            <div
              style={{
                position: "absolute",
                left: `${autoHpPercent}%`,
                top: 0,
                bottom: 0,
                width: "2px",
                background: "#fbbf24",
                boxShadow: "0 0 4px #fbbf24",
              }}
            />
          )}
        </div>
      </div>

      {/* MP Bar */}
      <div style={{ marginBottom: "12px" }}>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            marginBottom: "4px",
            fontSize: "12px",
            fontWeight: "bold",
          }}
        >
          <span style={{ color: "#3b82f6" }}>💙 MP</span>
          <span style={{ color: "#fff" }}>
            {character.mp} / {character.maxMp} ({Math.floor(mpPercent)}%)
          </span>
        </div>
        <div
          style={{
            width: "100%",
            height: "24px",
            background: "#1f2937",
            borderRadius: "6px",
            overflow: "hidden",
            border: "1px solid #374151",
            position: "relative",
          }}
        >
          <div
            style={{
              width: `${mpPercent}%`,
              height: "100%",
              background: "linear-gradient(to right, #3b82f6, #60a5fa)",
              transition: "width 0.3s ease-out",
            }}
          />
          {autoMpPercent > 0 && (
            <div
              style={{
                position: "absolute",
                left: `${autoMpPercent}%`,
                top: 0,
                bottom: 0,
                width: "2px",
                background: "#fbbf24",
                boxShadow: "0 0 4px #fbbf24",
              }}
            />
          )}
        </div>
      </div>

      {/* Quick Potion Buttons */}
      <div style={{ display: "flex", gap: "8px" }}>
        <button
          onClick={onUseHpPotion}
          disabled={hpPotions <= 0 || character.hp >= character.maxHp}
          style={{
            flex: 1,
            padding: "10px",
            background:
              hpPotions > 0 && character.hp < character.maxHp
                ? "linear-gradient(to bottom, #ef4444, #dc2626)"
                : "#374151",
            color: "white",
            border: "none",
            borderRadius: "6px",
            fontSize: "13px",
            fontWeight: "bold",
            cursor:
              hpPotions > 0 && character.hp < character.maxHp
                ? "pointer"
                : "not-allowed",
            opacity:
              hpPotions > 0 && character.hp < character.maxHp ? 1 : 0.5,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: "4px",
          }}
        >
          <span>🍖 HP Pot</span>
          <span style={{ fontSize: "11px" }}>({hpPotions})</span>
        </button>
        <button
          onClick={onUseMpPotion}
          disabled={mpPotions <= 0 || character.mp >= character.maxMp}
          style={{
            flex: 1,
            padding: "10px",
            background:
              mpPotions > 0 && character.mp < character.maxMp
                ? "linear-gradient(to bottom, #3b82f6, #2563eb)"
                : "#374151",
            color: "white",
            border: "none",
            borderRadius: "6px",
            fontSize: "13px",
            fontWeight: "bold",
            cursor:
              mpPotions > 0 && character.mp < character.maxMp
                ? "pointer"
                : "not-allowed",
            opacity:
              mpPotions > 0 && character.mp < character.maxMp ? 1 : 0.5,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: "4px",
          }}
        >
          <span>🧪 MP Pot</span>
          <span style={{ fontSize: "11px" }}>({mpPotions})</span>
        </button>
      </div>

      <style>{`
        @keyframes hpPulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.6; }
        }
      `}</style>
    </div>
  );
}
