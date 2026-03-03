import { Enemy } from "../types/enemy";
import { useState, useEffect, useMemo } from "react";

interface EnemyDisplayProps {
  enemy: Enemy;
  currentZoneId: number;
  onAttack: () => void;
  canAttack: boolean;
  inTown: boolean;
  attackCooldownPercent: number;
  autoAttackEnabled: boolean;
  onToggleAutoAttack: () => void;
}

export function EnemyDisplay({ 
  enemy,
  currentZoneId,
  onAttack, 
  canAttack, 
  inTown, 
  attackCooldownPercent,
  autoAttackEnabled,
  onToggleAutoAttack,
}: EnemyDisplayProps) {
  const hpPercent = (enemy.hp / enemy.maxHp) * 100;
  const isBoss = enemy.name.includes("Boss");
  const isGroup = (enemy.count || 1) > 1;
  const isLowHp = hpPercent < 30;
  
  const [enemyAttackProgress, setEnemyAttackProgress] = useState(0);
  const [isHit, setIsHit] = useState(false);
  const [prevHp, setPrevHp] = useState(enemy.hp);

  // Get zone-specific battle arena background
  const battleArenaBackground = useMemo(() => {
    if (isBoss) {
      return "linear-gradient(135deg, #7f1d1d 0%, #450a0a 50%, #1c0a0a 100%)"; // Boss - Red
    }
    
    if (isGroup) {
      // Slightly darker/more intense for groups
      switch(currentZoneId) {
        case 1: return "linear-gradient(135deg, #15803d 0%, #14532d 50%, #052e16 100%)"; // Darker green
        case 2: return "linear-gradient(135deg, #14532d 0%, #052e16 50%, #000000 100%)"; // Very dark green
        case 3: return "linear-gradient(135deg, #44403c 0%, #292524 50%, #0c0a09 100%)"; // Darker gray
        case 4: return "linear-gradient(135deg, #92400e 0%, #78350f 50%, #451a03 100%)"; // Darker orange
        case 5: return "linear-gradient(135deg, #1e40af 0%, #1e3a8a 50%, #0f172a 100%)"; // Darker blue
        case 6: return "linear-gradient(135deg, #991b1b 0%, #7f1d1d 50%, #450a0a 100%)"; // Darker red
        case 7: return "linear-gradient(135deg, #581c87 0%, #3b0764 50%, #1e1b4b 100%)"; // Darker purple
        case 8: return "linear-gradient(135deg, #4c1d95 0%, #2e1065 50%, #1e1b4b 100%)"; // Darker void
        default: return "linear-gradient(135deg, #1f2937 0%, #111827 50%, #000000 100%)";
      }
    }
    
    switch(currentZoneId) {
      case 0: return "linear-gradient(135deg, #334155 0%, #1e293b 70%, #0f172a 100%)"; // Blue-slate
      case 1: return "linear-gradient(135deg, #22c55e 0%, #15803d 50%, #14532d 100%)"; // Light green
      case 2: return "linear-gradient(135deg, #166534 0%, #14532d 50%, #052e16 100%)"; // Dark green
      case 3: return "linear-gradient(135deg, #57534e 0%, #44403c 50%, #292524 100%)"; // Gray-brown
      case 4: return "linear-gradient(135deg, #d97706 0%, #92400e 50%, #78350f 100%)"; // Orange-sandy
      case 5: return "linear-gradient(135deg, #3b82f6 0%, #1e40af 50%, #1e3a8a 100%)"; // Icy blue
      case 6: return "linear-gradient(135deg, #dc2626 0%, #991b1b 50%, #7f1d1d 100%)"; // Red-orange
      case 7: return "linear-gradient(135deg, #7c3aed 0%, #581c87 50%, #3b0764 100%)"; // Purple
      case 8: return "linear-gradient(135deg, #6366f1 0%, #4c1d95 50%, #2e1065 100%)"; // Deep purple
      default: return "linear-gradient(135deg, #374151 0%, #1f2937 70%, #111827 100%)"; // Default gray
    }
  }, [currentZoneId, isBoss, isGroup]);

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
          background: "linear-gradient(135deg, #475569 0%, #334155 50%, #1e293b 100%)",
          padding: "40px 20px",
          borderRadius: "8px",
          textAlign: "center",
          border: "2px solid #64748b",
          boxShadow: "inset 0 0 30px rgba(0,0,0,0.5)",
          transition: "background 1s ease"
        }}
      >
        <div style={{ fontSize: "48px", marginBottom: "10px", opacity: 0.8 }}>
          🏯️
        </div>
        <h2 style={{ margin: "0", color: "#e2e8f0", fontSize: "20px", fontWeight: "bold" }}>
          Safe in Town
        </h2>
        <p style={{ fontSize: "13px", color: "#94a3b8", margin: "10px 0 0 0" }}>
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
        background: battleArenaBackground,
        padding: "20px 15px",
        borderRadius: "8px",
        textAlign: "center",
        border: isBoss ? "3px solid #fca5a5" : (isGroup ? "2px solid #fbbf24" : "2px solid rgba(255,255,255,0.2)"),
        position: "relative",
        overflow: "hidden",
        boxShadow: isBoss 
          ? "0 0 40px rgba(220, 38, 38, 0.5), inset 0 0 30px rgba(0,0,0,0.4)" 
          : (isGroup ? "0 0 20px rgba(251, 191, 36, 0.3), inset 0 0 30px rgba(0,0,0,0.4)" : "inset 0 0 30px rgba(0,0,0,0.4)"),
        transition: "background 1s ease, border 0.3s ease"
      }}
    >
      {/* Animated light rays effect for depth */}
      <div style={{
        position: "absolute",
        top: "0",
        left: "0",
        right: "0",
        height: "100%",
        background: "radial-gradient(ellipse at top, rgba(255,255,255,0.08) 0%, transparent 60%)",
        pointerEvents: "none",
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
            filter: isHit ? "brightness(2) sepia(1) hue-rotate(300deg) saturate(10000%)" : "drop-shadow(0 10px 15px rgba(0,0,0,0.7))",
            transform: isHit ? "scale(0.95) translateX(5px)" : (isLowHp ? "scale(1)" : "scale(1) translateY(0)"),
            transition: "filter 0.1s, transform 0.1s",
            animation: isLowHp && !isHit ? "enemyShake 0.5s infinite" : (isBoss ? "bossFloat 3s ease-in-out infinite" : "float 4s ease-in-out infinite"),
          }}
        />
        
        {/* Ground shadow */}
        <div style={{
          position: "absolute",
          bottom: "-5px",
          width: isBoss ? "90px" : "70px",
          height: "12px",
          background: "rgba(0,0,0,0.6)",
          borderRadius: "50%",
          filter: "blur(3px)",
          zIndex: 0,
          animation: "shadowPulse 4s ease-in-out infinite",
        }} />
      </div>

      <h2
        style={{
          margin: "0 0 8px 0",
          fontSize: "20px",
          color: isBoss ? "#fef3c7" : "#fef3c7",
          textShadow: "2px 2px 6px rgba(0,0,0,0.9)",
          position: "relative",
          zIndex: 1,
          fontWeight: "900",
          letterSpacing: "0.5px"
        }}
      >
        {isBoss && "💀 "}
        {isGroup && !isBoss && (
          <span style={{ color: "#fbbf24", fontSize: "16px" }}>
            {enemy.count}x{" "}
          </span>
        )}
        {enemy.name}{" "}
        <span style={{ fontSize: "14px", color: "rgba(255,255,255,0.8)", fontWeight: "normal" }}>
          (Lv.{enemy.level})
        </span>
      </h2>
      
      {/* Group indicator badge */}
      {isGroup && !isBoss && (
        <div style={{
          display: "inline-block",
          background: "rgba(251, 191, 36, 0.2)",
          border: "1px solid #fbbf24",
          borderRadius: "4px",
          padding: "2px 8px",
          fontSize: "10px",
          color: "#fbbf24",
          fontWeight: "bold",
          marginBottom: "8px",
          position: "relative",
          zIndex: 1,
        }}>
          👥 ENEMY GROUP
        </div>
      )}
      
      {/* Enemy Stats Row */}
      <div style={{ 
        fontSize: "12px", 
        marginBottom: "15px", 
        color: "#fff",
        display: "inline-flex",
        justifyContent: "center",
        gap: "15px",
        position: "relative",
        zIndex: 1,
        background: "rgba(0,0,0,0.5)",
        padding: "5px 12px",
        borderRadius: "6px",
        border: "1px solid rgba(255,255,255,0.15)"
      }}>
        <span><span style={{color: "#fca5a5"}}>⚔️</span> {enemy.atk}</span>
        <span><span style={{color: "#93c5fd"}}>🛡️</span> {enemy.def}</span>
        <span><span style={{color: "#fde047"}}>⚡</span> {enemy.attackSpeed.toFixed(1)}/s</span>
      </div>
      
      {/* HP Bar Container */}
      <div style={{ background: "rgba(0,0,0,0.6)", padding: "10px", borderRadius: "8px", marginBottom: "15px", position: "relative", zIndex: 1, border: "1px solid rgba(255,255,255,0.1)" }}>
        <div style={{ display: "flex", justifyContent: "space-between", fontSize: "13px", marginBottom: "6px", fontWeight: "bold" }}>
          <span style={{ color: "#fca5a5" }}>HP</span>
          <span style={{ color: "#fff" }}>{Math.floor(enemy.hp)} / {enemy.maxHp}</span>
        </div>
        
        <div
          style={{
            width: "100%",
            height: "18px",
            background: "#000",
            borderRadius: "9px",
            overflow: "hidden",
            border: "2px solid #111",
            boxShadow: "inset 0 2px 4px rgba(0,0,0,0.7)",
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
              boxShadow: "inset 0 2px 4px rgba(255, 255, 255, 0.3)",
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
          color: "#cbd5e1",
        }}>
          <span>Attack Cooldown</span>
          <div style={{ 
            width: "100px", 
            height: "6px", 
            background: "#000", 
            borderRadius: "3px", 
            overflow: "hidden",
            border: "1px solid #333",
          }}>
            <div style={{
              width: `${enemyAttackProgress}%`,
              height: "100%",
              background: "linear-gradient(to right, #ef4444, #fca5a5)",
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
      
      <div style={{ fontSize: "10px", color: "rgba(255,255,255,0.6)", marginTop: "12px", position: "relative", zIndex: 1 }}>
        {isGroup && "Tip: AOE skills deal bonus damage to groups!"}
        {!isGroup && "Tip: Press 'A' key to attack manually"}
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
          0%, 100% { transform: scale(1); opacity: 0.6; }
          50% { transform: scale(0.8); opacity: 0.3; }
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
