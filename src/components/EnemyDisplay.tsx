import { Enemy } from "../types/enemy";
import { useState, useEffect } from "react";

interface EnemyDisplayProps {
  enemy: Enemy;
  onAttack: () => void;
  canAttack: boolean;
  inTown: boolean;
  attackCooldownPercent: number;
  autoAttackEnabled: boolean;
  onToggleAutoAttack: () => void;
}

export function EnemyDisplay({ 
  enemy, 
  onAttack, 
  canAttack, 
  inTown, 
  attackCooldownPercent,
  autoAttackEnabled,
  onToggleAutoAttack,
}: EnemyDisplayProps) {
  const hpPercent = (enemy.hp / enemy.maxHp) * 100;
  const isBoss = enemy.name.includes("Boss");
  const isLowHp = hpPercent < 30;
  
  const [enemyAttackProgress, setEnemyAttackProgress] = useState(0);

  useEffect(() => {
    if (inTown || enemy.attackSpeed <= 0) {
      setEnemyAttackProgress(0);
      return;
    }

    const attackDelayMs = 1000 / enemy.attackSpeed;
    let startTime = Date.now();

    const interval = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const progress = (elapsed / attackDelayMs) * 100;

      if (progress >= 100) {
        startTime = Date.now();
        setEnemyAttackProgress(0);
      } else {
        setEnemyAttackProgress(progress);
      }
    }, 50);

    return () => clearInterval(interval);
  }, [enemy.attackSpeed, inTown]);

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
        background: isBoss ? "rgba(139, 92, 246, 0.1)" : "#333",
        padding: "15px",
        borderRadius: "8px",
        textAlign: "center",
        border: isBoss ? "2px solid #8b5cf6" : "1px solid #444",
        position: "relative",
        overflow: "hidden",
        boxShadow: isBoss ? "0 0 20px rgba(139, 92, 246, 0.4)" : "none",
        animation: isBoss ? "bossGlow 2s infinite" : isLowHp ? "enemyShake 0.5s infinite" : "none",
      }}
    >
      {/* Boss Aura Effect */}
      {isBoss && (
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: "radial-gradient(circle, rgba(139, 92, 246, 0.2) 0%, transparent 70%)",
            pointerEvents: "none",
            animation: "bossAura 3s infinite",
          }}
        />
      )}

      <h2
        style={{
          margin: "0 0 8px 0",
          fontSize: "18px",
          color: isBoss ? "#a78bfa" : "#fbbf24",
          textShadow: isBoss ? "0 0 10px rgba(167, 139, 250, 0.8)" : "1px 1px 2px rgba(0,0,0,0.8)",
          position: "relative",
          zIndex: 1,
        }}
      >
        {enemy.name}{" "}
        <span style={{ fontSize: "12px", color: "#aaa" }}>
          (Lv.{enemy.level})
        </span>
      </h2>
      
      {/* Enemy Stats Row */}
      <div style={{ 
        fontSize: "11px", 
        marginBottom: "10px", 
        color: "#999",
        display: "flex",
        justifyContent: "center",
        gap: "15px",
        position: "relative",
        zIndex: 1,
      }}>
        <span>⚔️ ATK: {enemy.atk}</span>
        <span>🛡️ DEF: {enemy.def}</span>
        <span>⚡ ASPD: {enemy.attackSpeed.toFixed(1)}/s</span>
      </div>
      
      {/* HP Text */}
      <div style={{ fontSize: "13px", marginBottom: "6px", fontWeight: "bold", position: "relative", zIndex: 1 }}>
        HP: {enemy.hp}/{enemy.maxHp} ({Math.floor(hpPercent)}%)
      </div>
      
      {/* Enemy HP Bar - LARGER */}
      <div
        style={{
          width: "100%",
          height: "20px",
          background: "#555",
          borderRadius: "10px",
          overflow: "hidden",
          marginBottom: "12px",
          border: "2px solid #222",
          boxShadow: "inset 0 2px 4px rgba(0,0,0,0.3)",
          position: "relative",
          zIndex: 1,
        }}
      >
        <div
          style={{
            width: `${hpPercent}%`,
            height: "100%",
            background: hpPercent > 50 
              ? "linear-gradient(to right, #22c55e, #10b981)" 
              : hpPercent > 20 
              ? "linear-gradient(to right, #f59e0b, #fbbf24)" 
              : "linear-gradient(to right, #ef4444, #dc2626)",
            transition: "width 0.3s ease-out, background 0.3s",
            boxShadow: "0 0 10px rgba(255, 255, 255, 0.3)",
          }}
        />
      </div>

      {/* Enemy Attack Timer */}
      <div style={{ 
        marginBottom: "10px", 
        display: "flex", 
        alignItems: "center", 
        justifyContent: "center", 
        gap: "8px",
        fontSize: "11px",
        color: "#f87171",
        position: "relative",
        zIndex: 1,
      }}>
        <span>⚡ Next Attack:</span>
        <div style={{ 
          width: "80px", 
          height: "8px", 
          background: "#222", 
          borderRadius: "4px", 
          overflow: "hidden",
          border: "1px solid #444",
        }}>
          <div style={{
            width: `${enemyAttackProgress}%`,
            height: "100%",
            background: "linear-gradient(to right, #ef4444, #f87171)",
            transition: "width 0.05s linear",
          }} />
        </div>
        <span>{Math.ceil((100 - enemyAttackProgress) / 100 * (1000 / enemy.attackSpeed) / 1000)}s</span>
      </div>

      {/* Auto-Attack Toggle */}
      <div style={{ marginBottom: "10px", position: "relative", zIndex: 1 }}>
        <button
          onClick={onToggleAutoAttack}
          style={{
            width: "100%",
            padding: "8px",
            background: autoAttackEnabled 
              ? "linear-gradient(to bottom, #10b981, #059669)" 
              : "linear-gradient(to bottom, #6b7280, #4b5563)",
            color: "white",
            border: autoAttackEnabled ? "2px solid #34d399" : "2px solid #6b7280",
            borderRadius: "6px",
            fontSize: "13px",
            fontWeight: "bold",
            cursor: "pointer",
            transition: "all 0.2s",
          }}
        >
          {autoAttackEnabled ? "🤖 Auto-Attack: ON" : "✋ Auto-Attack: OFF"}
        </button>
      </div>

      {/* Manual Attack Button */}
      <div style={{ position: "relative", height: "50px", zIndex: 1 }}>
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
      
      <div style={{ fontSize: "10px", color: "#888", marginTop: "8px", position: "relative", zIndex: 1 }}>
        Press 'A' key to attack | Toggle Auto-Attack for casual play
      </div>

      <style>{`
        @keyframes bossGlow {
          0%, 100% { box-shadow: 0 0 20px rgba(139, 92, 246, 0.4); }
          50% { box-shadow: 0 0 30px rgba(139, 92, 246, 0.7); }
        }
        @keyframes bossAura {
          0%, 100% { opacity: 0.5; }
          50% { opacity: 1; }
        }
        @keyframes enemyShake {
          0%, 100% { transform: translateX(0); }
          25% { transform: translateX(-2px); }
          75% { transform: translateX(2px); }
        }
      `}</style>
    </div>
  );
}
