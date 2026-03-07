import { CSSProperties } from "react";
import { Character } from "../types/character";

interface GameCompleteModalProps {
  character: Character;
  onClose: () => void;
}

export function GameCompleteModal({ character, onClose }: GameCompleteModalProps) {
  const overlayStyle: CSSProperties = {
    position: "fixed",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: "rgba(0, 0, 0, 0.95)",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 10000,
    padding: "20px",
  };

  const modalStyle: CSSProperties = {
    background: "linear-gradient(135deg, #1e3a8a 0%, #312e81 100%)",
    border: "4px solid #fbbf24",
    borderRadius: "16px",
    padding: "40px",
    maxWidth: "600px",
    width: "100%",
    color: "white",
    textAlign: "center",
    boxShadow: "0 0 80px rgba(251, 191, 36, 0.6)",
    position: "relative",
    overflow: "hidden",
  };

  const starStyle: CSSProperties = {
    position: "absolute",
    fontSize: "24px",
    animation: "twinkle 2s infinite alternate",
  };

  return (
    <div style={overlayStyle}>
      <div style={modalStyle} className="game-complete-modal">
        {/* Decorative elements */}
        <div style={{ ...starStyle, top: "20px", left: "20px", animationDelay: "0s" }}>✨</div>
        <div style={{ ...starStyle, top: "40px", right: "30px", animationDelay: "0.5s" }}>🌟</div>
        <div style={{ ...starStyle, bottom: "30px", left: "40px", animationDelay: "1s" }}>✨</div>
        <div style={{ ...starStyle, bottom: "20px", right: "20px", animationDelay: "1.5s" }}>🌟</div>
        <div style={{ ...starStyle, top: "50%", left: "10px", animationDelay: "0.7s" }}>✨</div>
        <div style={{ ...starStyle, top: "50%", right: "10px", animationDelay: "1.2s" }}>🌟</div>

        <div style={{ fontSize: "80px", marginBottom: "10px", textShadow: "0 0 20px gold" }}>
          🏆
        </div>
        
        <h1
          style={{
            margin: "0 0 10px 0",
            fontSize: "42px",
            color: "#fbbf24",
            fontWeight: "bold",
            textShadow: "0 2px 4px rgba(0,0,0,0.5)",
            background: "linear-gradient(to right, #fde047, #f59e0b)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
          }}
        >
          CONGRATULATIONS!
        </h1>
        
        <h2 style={{ fontSize: "24px", color: "#60a5fa", marginBottom: "30px", fontWeight: "normal" }}>
          You have defeated the final boss!
        </h2>

        <div style={{ 
          background: "rgba(0,0,0,0.4)", 
          padding: "20px", 
          borderRadius: "12px", 
          marginBottom: "30px",
          border: "1px solid rgba(255,255,255,0.1)"
        }}>
          <p style={{ fontSize: "16px", lineHeight: "1.6", margin: "0 0 15px 0", color: "#e2e8f0" }}>
            The Void Dimension has been conquered, and peace has returned to the realm. Your journey from a humble Novice to a legendary hero will be remembered for generations!
          </p>
          
          <div style={{ display: "flex", justifyContent: "center", gap: "20px", fontSize: "18px" }}>
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
              <span style={{ color: "#9ca3af", fontSize: "12px", textTransform: "uppercase" }}>Final Level</span>
              <span style={{ fontWeight: "bold", color: "#fbbf24" }}>Lv.{character.level}</span>
            </div>
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
              <span style={{ color: "#9ca3af", fontSize: "12px", textTransform: "uppercase" }}>Class</span>
              <span style={{ fontWeight: "bold", color: "#fbbf24" }}>{character.jobClass}</span>
            </div>
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
              <span style={{ color: "#9ca3af", fontSize: "12px", textTransform: "uppercase" }}>Wealth</span>
              <span style={{ fontWeight: "bold", color: "#fbbf24" }}>{character.gold}g</span>
            </div>
          </div>
        </div>

        <p style={{ fontSize: "14px", color: "#9ca3af", marginBottom: "30px" }}>
          You can continue playing to farm better gear, reach max level, or refine your equipment!
        </p>

        <button
          onClick={onClose}
          style={{
            padding: "16px 40px",
            background: "linear-gradient(45deg, #fbbf24, #d97706)",
            color: "#fff",
            border: "none",
            borderRadius: "8px",
            cursor: "pointer",
            fontSize: "20px",
            fontWeight: "bold",
            boxShadow: "0 4px 20px rgba(245, 158, 11, 0.5)",
            transition: "all 0.2s",
            textShadow: "0 1px 2px rgba(0,0,0,0.5)"
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = "scale(1.05)";
            e.currentTarget.style.boxShadow = "0 6px 25px rgba(245, 158, 11, 0.7)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = "scale(1)";
            e.currentTarget.style.boxShadow = "0 4px 20px rgba(245, 158, 11, 0.5)";
          }}
        >
          Continue Adventure
        </button>
      </div>
      
      <style>{`
        @keyframes twinkle {
          0% { opacity: 0.2; transform: scale(0.8); }
          100% { opacity: 1; transform: scale(1.2); }
        }
        .game-complete-modal {
          animation: dropIn 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards;
        }
        @keyframes dropIn {
          0% { transform: translateY(-50px) scale(0.9); opacity: 0; }
          100% { transform: translateY(0) scale(1); opacity: 1; }
        }
      `}</style>
    </div>
  );
}