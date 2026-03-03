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
  const [isHit, setIsHit] = useState(false);
  const [prevHp, setPrevHp] = useState(enemy.hp);

  // Trigger hit animation when HP drops
  useEffect(() => {
    if (enemy.hp < prevHp) {
      setIsHit(true);
      const timer = setTimeout(() => setIsHit(false), 200);
      setPrevHp(enemy.hp);
      return () => clearTimeout(timer);
    }
    setPrevHp(enemy.hp);
  }, [enemy.hp, prevHp]);

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

  // Generate a procedural seed for the enemy avatar based on their name
  const getAvatarUrl = () => {
    if (isBoss) {
      return `https://api.dicebear.com/7.x/bottts/svg?seed=${enemy.name}&backgroundColor=transparent&colors=ff0000`;
    }
    return `https://api.dicebear.com/7.x/adventurer/svg?seed=${enemy.name}&backgroundColor=transparent`;
  };

  if (inTown) {
    return (
      <div
        style={{
          marginTop: "15px",
          marginBottom: "15px",
          background: "linear-gradient(180deg, #2a2a2a 0%, #1a1a1a 100%)",
          padding: "40px 20px",
          borderRadius: "8px",
          textAlign: "center",
          border: "2px solid #444",
          boxShadow: "inset 0 0 20px rgba(0,0,0,0.5)"
        }}
      >
        <div style={{ fontSize: "48px", marginBottom: "10px", opacity: 0.8 }}>
          🏕️
        </div>
        <h2 style={{ margin: "0", color: "#bbb", fontSize: "20px", fontWeight: "bold" }}>
          Safe in Town
        </h2>
        <p style={{ fontSize: "13px", color: "#888", margin: "10px 0 0 0" }}>
          Resting at the inn. HP and MP are recovering...
        </p>
      </div>
    );
  }

  return (
    <div
      style={{
        marginTop: "15px",
        marginBottom: "15px",
        background: isBoss ? "linear-gradient(180deg, #4c1d95 0%, #2e1065 100%)" : "linear-gradient(180deg, #374151 0%, #1f2937 100%)",
        padding: "20px 15px",
        borderRadius: "8px",
        textAlign: "center",
        border: isBoss ? "2px solid #a78bfa" : "2px solid #4b5563",
        position: "relative",
        overflow: "hidden",
        boxShadow: isBoss ? "0 0 30px rgba(139, 92, 246, 0.3)" : "inset 0 0 20px rgba(0,0,0,0.5)",
      }}
    >
      {/* Background Effect for Enemy */}
      <div style={{
        position: "absolute",
        top: "20%",
        left: "50%",
        transform: "translateX(-50%)",
        width: "120px",
        height: "120px",
        background: isBoss ? "radial-gradient(circle, rgba(239, 68, 68, 0.4) 0%, transparent 70%)" : "radial-gradient(circle, rgba(255, 255, 255, 0.1) 0%, transparent 70%)",
        borderRadius: "50%",
        zIndex: 0,
      }} />

      {/* Enemy Sprite/Avatar Container */}
      <div style={{
        height: "120px",
        display: "flex",
        justifyContent: "center",
        alignItems: "flex-end",
        marginBottom: "15px",
        position: "relative",
        zIndex: 1,
      }}>
        <img 
          src={getAvatarUrl()} 
          alt={enemy.name}
          style={{
            height: isBoss ? "120px" : "100px",
            filter: isHit ? "brightness(2) sepia(1) hue-rotate(300deg) saturate(10000%)" : "drop-shadow(0 10px 10px rgba(0,0,0,0.5))",
            transform: isHit ? "scale(0.95) translateX(5px)" : (isLowHp ? "scale(1)" : "scale(1) translateY(0)"),
            transition: "filter 0.1s, transform 0.1s",
            animation: isLowHp && !isHit ? "enemyShake 0.5s infinite" : (isBoss ? "bossFloat 3s ease-in-out infinite" : "float 4s ease-in-out infinite"),
          }}
        />
        
        {/* Ground shadow */}
        <div style={{
          position: "absolute",
          bottom: "-5px",
          width: isBoss ? "80px" : "60px",
          height: "10px",
          background: "rgba(0,0,0,0.5)",
          borderRadius: "50%",
          filter: "blur(2px)",
          zIndex: -1,
          animation: "shadowPulse 4s ease-in-out infinite",
        }} />
      </div>

      <h2
        style={{
          margin: "0 0 8px 0",
          fontSize: "20px",
          color: isBoss ? "#fca5a5" : "#fbbf24",
          textShadow: "1px 2px 4px rgba(0,0,0,0.8)",
          position: "relative",
          zIndex: 1,
          fontWeight: "900",
          letterSpacing: "0.5px"
        }}
      >
        {isBoss && "💀 "} {enemy.name}{" "}
        <span style={{ fontSize: "14px", color: "#aaa", fontWeight: "normal" }}>
          (Lv.{enemy.level})
        </span>
      </h2>
      
      {/* Enemy Stats Row */}
      <div style={{ 
        fontSize: "12px", 
        marginBottom: "15px", 
        color: "#ccc",
        display: "flex",
        justifyContent: "center",
        gap: "15px",
        position: "relative",
        zIndex: 1,
        background: "rgba(0,0,0,0.4)",
        padding: "4px 8px",
        borderRadius: "4px",
        display: "inline-flex",
        border: "1px solid rgba(255,255,255,0.1)"
      }}>
        <span><span style={{color: "#f87171"}}>⚔️</span> {enemy.atk}</span>
        <span><span style={{color: "#60a5fa"}}>🛡️</span> {enemy.def}</span>
        <span><span style={{color: "#fbbf24"}}>⚡</span> {enemy.attackSpeed.toFixed(1)}/s</span>
      </div>
      
      {/* HP Bar Container */}
      <div style={{ background: "rgba(0,0,0,0.6)", padding: "10px", borderRadius: "8px", marginBottom: "15px", position: "relative", zIndex: 1 }}>
        <div style={{ display: "flex", justifyContent: "space-between", fontSize: "13px", marginBottom: "6px", fontWeight: "bold" }}>
          <span style={{ color: "#ef4444" }}>HP</span>
          <span>{Math.floor(enemy.hp)} / {enemy.maxHp}</span>
        </div>
        
        <div
          style={{
            width: "100%",
            height: "18px",
            background: "#222",
            borderRadius: "9px",
            overflow: "hidden",
            border: "2px solid #111",
            boxShadow: "inset 0 2px 4px rgba(0,0,0,0.5)",
            position: "relative",
          }}
        >
          <div
            style={{
              width: `${hpPercent}%`,
              height: "100%",
              background: hpPercent > 50 
                ? "linear-gradient(to bottom, #4ade80, #16a34a)" 
                : hpPercent > 25 
                ? "linear-gradient(to bottom, #fbbf24, #d97706)" 
                : "linear-gradient(to bottom, #f87171, #dc2626)",
              transition: "width 0.2s ease-out, background 0.3s",
              boxShadow: "inset 0 2px 4px rgba(255, 255, 255, 0.3), 0 0 10px rgba(0,0,0,0.5)",
              position: "relative"
            }}
          >
            {/* Shimmer effect on HP bar */}
            <div style={{
              position: "absolute",
              top: 0,
              left: 0,
              right: 0,
              height: "40%",
              background: "linear-gradient(to bottom, rgba(255,255,255,0.4), transparent)",
            }}/>
          </div>
        </div>

        {/* Enemy Attack Timer integrated smoothly */}
        <div style={{ 
          marginTop: "10px",
          display: "flex", 
          alignItems: "center", 
          justifyContent: "space-between", 
          fontSize: "11px",
          color: "#999",
        }}>
          <span>Attack Cooldown</span>
          <div style={{ 
            width: "100px", 
            height: "6px", 
            background: "#111", 
            borderRadius: "3px", 
            overflow: "hidden",
            border: "1px solid #333",
          }}>
            <div style={{
              width: `${enemyAttackProgress}%`,
              height: "100%",
              background: "linear-gradient(to right, #ef4444, #f87171)",
              transition: "width 0.05s linear",
            }} />
          </div>
        </div>
      </div>

      {/* Combat Controls Grid */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px", position: "relative", zIndex: 1 }}>
        <button
          onClick={onToggleAutoAttack}
          style={{
            padding: "10px",
            background: autoAttackEnabled 
              ? "linear-gradient(to bottom, #10b981, #059669)" 
              : "linear-gradient(to bottom, #4b5563, #374151)",
            color: "white",
            border: autoAttackEnabled ? "1px solid #34d399" : "1px solid #6b7280",
            borderRadius: "6px",
            fontSize: "12px",
            fontWeight: "bold",
            cursor: "pointer",
            transition: "all 0.2s",
            boxShadow: autoAttackEnabled ? "0 4px 10px rgba(16,185,129,0.3)" : "none"
          }}
        >
          {autoAttackEnabled ? "🟢 AUTO: ON" : "⚪ AUTO: OFF"}
        </button>

        <div style={{ position: "relative", height: "100%" }}>
          <button
            onClick={onAttack}
            disabled={!canAttack}
            style={{
              width: "100%",
              height: "100%",
              background: canAttack ? "linear-gradient(to bottom, #ef4444, #b91c1c)" : "#374151",
              color: "white",
              border: canAttack ? "1px solid #fca5a5" : "1px solid #4b5563",
              borderRadius: "6px",
              fontSize: "14px",
              fontWeight: "900",
              cursor: canAttack ? "pointer" : "not-allowed",
              textTransform: "uppercase",
              letterSpacing: "1px",
              boxShadow: canAttack ? "0 4px 10px rgba(220,38,38,0.4)" : "none",
              transition: "all 0.1s",
              position: "relative",
              zIndex: 2,
            }}
            onMouseDown={(e) => {
              if (canAttack) e.currentTarget.style.transform = "translateY(2px)";
            }}
            onMouseUp={(e) => {
              if (canAttack) e.currentTarget.style.transform = "translateY(0)";
            }}
            onMouseLeave={(e) => {
              if (canAttack) e.currentTarget.style.transform = "translateY(0)";
            }}
          >
            ⚔️ ATTACK
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
                background: "rgba(255, 255, 255, 0.15)",
                borderRadius: "6px",
                zIndex: 3,
                pointerEvents: "none",
              }}
            />
          )}
        </div>
      </div>
      
      <div style={{ fontSize: "10px", color: "#666", marginTop: "12px", position: "relative", zIndex: 1 }}>
        Tip: Press 'A' key to attack manually
      </div>

      <style>{`
        @keyframes float {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-8px); }
        }
        @keyframes bossFloat {
          0%, 100% { transform: translateY(0) scale(1.1); }
          50% { transform: translateY(-12px) scale(1.1); }
        }
        @keyframes shadowPulse {
          0%, 100% { transform: scale(1); opacity: 0.5; }
          50% { transform: scale(0.8); opacity: 0.2; }
        }
        @keyframes enemyShake {
          0%, 100% { transform: translateX(0); }
          25% { transform: translateX(-3px) rotate(-2deg); }
          75% { transform: translateX(3px) rotate(2deg); }
        }
      `}</style>
    </div>
  );
}
