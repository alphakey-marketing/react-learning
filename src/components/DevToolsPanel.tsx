import { useState } from "react";
import { Character } from "../types/character";

interface DevToolsPanelProps {
  character: Character;
  onAddBaseLevel: () => void;
  onAddJobLevel: () => void;
  onAddGold: (amount: number) => void;
  onAddPotions: (hp: number, mp: number) => void;
  onFullHeal: () => void;
  onAddGear: () => void;
  onUnlockAllZones: () => void;
}

export function DevToolsPanel(props: DevToolsPanelProps) {
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [password, setPassword] = useState("");
  const [isVisible, setIsVisible] = useState(false);
  const [error, setError] = useState("");

  const handleUnlock = () => {
    if (password === "123456") {
      setIsUnlocked(true);
      setError("");
    } else {
      setError("Invalid password!");
      setTimeout(() => setError(""), 2000);
    }
  };

  if (!isVisible) {
    return (
      <button
        onClick={() => setIsVisible(true)}
        title="Press Ctrl+D to open Dev Tools"
        style={{
          position: "fixed",
          bottom: "20px",
          right: "20px",
          width: "50px",
          height: "50px",
          borderRadius: "50%",
          background: "linear-gradient(45deg, #8b5cf6, #6d28d9)",
          border: "2px solid #a78bfa",
          color: "white",
          fontSize: "24px",
          cursor: "pointer",
          boxShadow: "0 4px 12px rgba(139, 92, 246, 0.4)",
          zIndex: 9999,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        🔧
      </button>
    );
  }

  return (
    <div style={{
      position: "fixed",
      bottom: "20px",
      right: "20px",
      background: "linear-gradient(135deg, #1a1a1a 0%, #2a2a2a 100%)",
      border: "2px solid #8b5cf6",
      borderRadius: "12px",
      padding: "20px",
      minWidth: "300px",
      maxWidth: "400px",
      color: "white",
      boxShadow: "0 8px 32px rgba(139, 92, 246, 0.3)",
      zIndex: 9999,
    }}>
      <div style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: "15px",
      }}>
        <h3 style={{ margin: 0, color: "#a78bfa", fontSize: "18px" }}>
          🔧 Dev Tools
        </h3>
        <button
          onClick={() => setIsVisible(false)}
          style={{
            background: "#444",
            border: "none",
            color: "white",
            borderRadius: "4px",
            padding: "4px 8px",
            cursor: "pointer",
            fontSize: "16px",
          }}
        >
          ✖
        </button>
      </div>

      {!isUnlocked ? (
        <div>
          <p style={{ fontSize: "13px", color: "#bbb", marginBottom: "10px" }}>
            Enter password to unlock:
          </p>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") handleUnlock();
            }}
            placeholder="Enter code..."
            style={{
              width: "100%",
              padding: "8px",
              marginBottom: "10px",
              background: "#333",
              border: error ? "2px solid #ef4444" : "1px solid #555",
              borderRadius: "6px",
              color: "white",
              fontSize: "14px",
            }}
          />
          {error && (
            <p style={{ color: "#ef4444", fontSize: "12px", margin: "0 0 10px 0" }}>
              {error}
            </p>
          )}
          <button
            onClick={handleUnlock}
            style={{
              width: "100%",
              padding: "10px",
              background: "linear-gradient(45deg, #8b5cf6, #6d28d9)",
              border: "none",
              borderRadius: "6px",
              color: "white",
              cursor: "pointer",
              fontWeight: "bold",
            }}
          >
            🔓 Unlock
          </button>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
          <div style={{ 
            display: "grid", 
            gridTemplateColumns: "1fr 1fr", 
            gap: "8px",
            marginBottom: "8px"
          }}>
            <button
              onClick={props.onAddBaseLevel}
              style={{
                padding: "8px",
                background: "#3b82f6",
                border: "none",
                borderRadius: "6px",
                color: "white",
                cursor: "pointer",
                fontSize: "12px",
                fontWeight: "bold",
              }}
            >
              ⬆️ Base Lv +1
            </button>
            <button
              onClick={props.onAddJobLevel}
              style={{
                padding: "8px",
                background: "#8b5cf6",
                border: "none",
                borderRadius: "6px",
                color: "white",
                cursor: "pointer",
                fontSize: "12px",
                fontWeight: "bold",
              }}
            >
              📘 Job Lv +1
            </button>
          </div>

          <button
            onClick={() => props.onAddGold(10000)}
            style={{
              padding: "10px",
              background: "#f59e0b",
              border: "none",
              borderRadius: "6px",
              color: "white",
              cursor: "pointer",
              fontSize: "13px",
              fontWeight: "bold",
            }}
          >
            💰 +10,000 Gold
          </button>

          <button
            onClick={() => props.onAddPotions(99, 99)}
            style={{
              padding: "10px",
              background: "#10b981",
              border: "none",
              borderRadius: "6px",
              color: "white",
              cursor: "pointer",
              fontSize: "13px",
              fontWeight: "bold",
            }}
          >
            🍖 +99 HP & MP Pots
          </button>

          <button
            onClick={props.onFullHeal}
            style={{
              padding: "10px",
              background: "#ec4899",
              border: "none",
              borderRadius: "6px",
              color: "white",
              cursor: "pointer",
              fontSize: "13px",
              fontWeight: "bold",
            }}
          >
            ❤️ Full Heal
          </button>

          <button
            onClick={props.onAddGear}
            style={{
              padding: "10px",
              background: "#6366f1",
              border: "none",
              borderRadius: "6px",
              color: "white",
              cursor: "pointer",
              fontSize: "13px",
              fontWeight: "bold",
            }}
          >
            ⚔️ Add Random Gear
          </button>

          <button
            onClick={props.onUnlockAllZones}
            style={{
              padding: "10px",
              background: "#14b8a6",
              border: "none",
              borderRadius: "6px",
              color: "white",
              cursor: "pointer",
              fontSize: "13px",
              fontWeight: "bold",
            }}
          >
            🗺️ Unlock All Zones
          </button>

          <div style={{
            marginTop: "10px",
            padding: "10px",
            background: "#333",
            borderRadius: "6px",
            fontSize: "11px",
            color: "#999",
          }}>
            <div>Base Lv: {props.character.level}</div>
            <div>Job Lv: {props.character.jobLevel}</div>
            <div>Gold: {props.character.gold}</div>
          </div>
        </div>
      )}
    </div>
  );
}
