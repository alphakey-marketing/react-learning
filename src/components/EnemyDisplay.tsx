import { Enemy } from "../types/enemy";

interface EnemyDisplayProps {
  enemy: Enemy;
  onAttack: () => void;
  canAttack: boolean;
  inTown: boolean;
  attackCooldownPercent: number;
}

export function EnemyDisplay({ enemy, onAttack, canAttack, inTown, attackCooldownPercent }: EnemyDisplayProps) {
  const hpPercent = (enemy.hp / enemy.maxHp) * 100;

  if (inTown) {
    return (
      <div
        style={{
          marginTop: "15px",
          marginBottom: "15px",
          background: "#222",
          padding: "20px",
          borderRadius: "6px",
          textAlign: "center",
          border: "1px dashed #555"
        }}
      >
        <h2 style={{ margin: "0", color: "#888", fontSize: "18px" }}>
          🏛️ Safe in Town
        </h2>
        <p style={{ fontSize: "12px", color: "#666", margin: "5px 0 0 0" }}>
          HP/MP slowly recovering...
        </p>
      </div>
    );
  }

  return (
    <div
      style={{
        marginTop: "15px",
        marginBottom: "15px",
        background: "#333",
        padding: "15px",
        borderRadius: "8px",
        textAlign: "center",
        border: "1px solid #444",
        position: "relative",
        overflow: "hidden"
      }}
    >
      <h2
        style={{
          margin: "0 0 8px 0",
          fontSize: "18px",
          color: "#fbbf24",
          textShadow: "1px 1px 2px rgba(0,0,0,0.8)"
        }}
      >
        {enemy.name}{" "}
        <span style={{ fontSize: "12px", color: "#aaa" }}>
          (Lv.{enemy.level})
        </span>
      </h2>
      
      <div style={{ fontSize: "12px", marginBottom: "8px", fontWeight: "bold" }}>
        HP: {enemy.hp}/{enemy.maxHp}
      </div>
      
      {/* Enemy HP Bar */}
      <div
        style={{
          width: "100%",
          height: "12px",
          background: "#555",
          borderRadius: "6px",
          overflow: "hidden",
          marginBottom: "15px",
          border: "1px solid #222"
        }}
      >
        <div
          style={{
            width: `${hpPercent}%`,
            height: "100%",
            background: hpPercent > 50 ? "#22c55e" : hpPercent > 20 ? "#f59e0b" : "#ef4444",
            transition: "width 0.2s ease-out, background 0.3s",
          }}
        />
      </div>

      {/* Manual Attack Button */}
      <div style={{ position: "relative", height: "50px" }}>
        <button
          onClick={onAttack}
          disabled={!canAttack}
          style={{
            width: "100%",
            height: "100%",
            background: canAttack ? "linear-gradient(to bottom, #ef4444, #b91c1c)" : "#555",
            color: "white",
            border: canAttack ? "2px solid #f87171" : "2px solid #444",
            borderRadius: "8px",
            fontSize: "18px",
            fontWeight: "bold",
            cursor: canAttack ? "pointer" : "not-allowed",
            textTransform: "uppercase",
            letterSpacing: "1px",
            boxShadow: canAttack ? "0 4px 6px rgba(0,0,0,0.3)" : "none",
            transition: "all 0.1s",
            position: "relative",
            zIndex: 2,
            opacity: canAttack ? 1 : 0.8
          }}
          onMouseDown={(e) => {
            if (canAttack) {
              e.currentTarget.style.transform = "translateY(2px)";
              e.currentTarget.style.boxShadow = "0 1px 2px rgba(0,0,0,0.3)";
            }
          }}
          onMouseUp={(e) => {
            if (canAttack) {
              e.currentTarget.style.transform = "translateY(0)";
              e.currentTarget.style.boxShadow = "0 4px 6px rgba(0,0,0,0.3)";
            }
          }}
          onMouseLeave={(e) => {
            if (canAttack) {
              e.currentTarget.style.transform = "translateY(0)";
              e.currentTarget.style.boxShadow = "0 4px 6px rgba(0,0,0,0.3)";
            }
          }}
        >
          ⚔️ ATTACK!
        </button>

        {/* Attack Cooldown Overlay */}
        {!canAttack && attackCooldownPercent < 100 && (
          <div 
            style={{
              position: "absolute",
              bottom: 0,
              left: 0,
              height: "100%",
              width: `${attackCooldownPercent}%`,
              background: "rgba(255, 255, 255, 0.2)",
              borderRadius: "6px",
              zIndex: 3,
              pointerEvents: "none",
            }}
          />
        )}
      </div>
      
      <div style={{ fontSize: "10px", color: "#888", marginTop: "8px" }}>
        Press 'A' key to attack | Higher AGI = Faster Attacks
      </div>
    </div>
  );
}
